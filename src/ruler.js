"use strict";
/* ============ Claude rules a kingdom ============
   Every RULE_YEARS a kingdom the player handed to Claude sends a situation report to the local bridge
   (tools/ruler-bridge, which runs claude -p). Claude answers with ONE move from a fixed menu and a royal decree.
   Plain code does the rest: it checks the move is legal (now, not only when it was asked), applies it with the game's
   own diplomacy, and writes the decree into the history. An illegal or late move is refused and logged; the kingdom
   waits. The page never runs the model; with no bridge running, the kingdom simply rules itself.
   The pure half (menu, prompt, checks) is also required by the bridge in Node; it never touches the sim at load. */
const RULER=(()=>{
  const RULE_YEARS=3,REACH=120,MAX_TRIES=2,DECREE_MAX=240,KEEP=12;
  const ACTIONS={
    wait:{target:false,desc:'Keep the realm as it is this turn.'},
    declare_war:{target:true,desc:'Declare war on a neighbor you are not at war or allied with. Your allies may join.'},
    make_peace:{target:true,desc:'End the war with a kingdom you are at war with.'},
    form_alliance:{target:true,desc:'Seal an alliance with a neighbor you are not at war or allied with.'},
    break_alliance:{target:true,desc:'Break the alliance with one of your allies.'},
    found_village:{target:false,desc:'Send families to found a new village (needs people to spare).'},
    patronize_arts:{target:false,desc:'Fund artists and priests: more devotion and stability, maybe a new work of art.'},
  };
  const SYSTEM=`You rule a kingdom in a fantasy world simulation. Each turn you get a situation report as JSON and choose ONE move.
Moves:
${Object.entries(ACTIONS).map(([k,a])=>`- ${k}${a.target?' (needs "target")':''}: ${a.desc}`).join('\n')}
Rules:
- "target" must be the exact name of a kingdom in "neighbors".
- Only choose moves the report allows: you cannot make peace with a kingdom you are not at war with, ally an enemy, or declare war on an ally.
- Rule in the character of your people and faith, and think about survival: food, stability, soldiers and who is stronger.
- "decree" is what your herald proclaims: one or two sentences, at most ${DECREE_MAX} characters, plain text, naming only kingdoms, gods and people from the report.
- "reason" is a short private note on why.
Reply with only this JSON, no other text:
{"action": "...", "target": "kingdom name or null", "decree": "...", "reason": "..."}`;

  const prompt=(sit,last,errors)=>`Situation report:\n${JSON.stringify(sit,null,1)}`+
    (errors&&errors.length?`\n\nYour last answer was:\n${last}\n\nIt was refused because:\n${errors.map(e=>'- '+e).join('\n')}\n\nChoose again.`:'');

  /* the request the bridge accepts: a situation report and nothing else, so it cannot be used to run other prompts */
  function checkRequest(o){
    if(!o||typeof o!=='object')return 'the body must be a JSON object';
    const s=o.situation;
    if(!s||typeof s!=='object'||typeof s.kingdom!=='string'||!Array.isArray(s.neighbors)||!Array.isArray(s.recent))return 'it needs a situation report';
    if(o.errors!=null&&(!Array.isArray(o.errors)||o.errors.some(e=>typeof e!=='string')))return '"errors" must be a list of strings';
    if(o.last!=null&&typeof o.last!=='string')return '"last" must be a string';
    return null;
  }

  /* is this move allowed in this situation? Every problem is a sentence that can go back to Claude as it is */
  function checkDecision(d,sit){
    if(!d||typeof d!=='object'||Array.isArray(d))return ['the answer must be one JSON object'];
    const errors=[],A=ACTIONS[d.action];
    if(!A)return [`"${d.action}" is not a move; choose one of ${Object.keys(ACTIONS).join(', ')}`];
    if(typeof d.decree!=='string'||d.decree.trim().length<8||d.decree.length>DECREE_MAX)errors.push(`"decree" must be 8 to ${DECREE_MAX} characters`);
    else if(/[<>]/.test(d.decree))errors.push('"decree" must be plain text');
    let n=null;
    if(A.target){
      n=sit.neighbors.find(x=>x.name===d.target);
      if(!n)errors.push(`"${d.target}" is not one of your neighbors; use an exact name from "neighbors"`);
    }
    if(n){
      if(d.action==='declare_war'&&n.atWar)errors.push(`you are already at war with the ${n.name}`);
      if(d.action==='declare_war'&&n.allied)errors.push(`the ${n.name} is your ally; break the alliance first`);
      if(d.action==='make_peace'&&!n.atWar)errors.push(`you are not at war with the ${n.name}`);
      if(d.action==='form_alliance'&&(n.atWar||n.allied))errors.push(n.atWar?`you are at war with the ${n.name}; make peace first`:`you are already allied with the ${n.name}`);
      if(d.action==='break_alliance'&&!n.allied)errors.push(`you are not allied with the ${n.name}`);
    }
    if(d.action==='found_village'&&!sit.canSettle)errors.push('you have too few people to found a village now');
    /* the herald may only name what the report names (the same check the chronicles use) */
    if(typeof d.decree==='string'&&typeof CHRON!=='undefined'){
      const known=CHRON.vocabulary(sit);
      const unknown=[...new Set(CHRON.namesIn(d.decree).filter(w=>!known.has(CHRON.norm(w))&&!ALWAYS_OK.has(CHRON.norm(w))))];
      if(unknown.length)errors.push(`the decree names ${unknown.map(w=>`"${w}"`).join(', ')}, which the report never mentions`);
    }
    return errors;
  }
  const ALWAYS_OK=new Set(['i','we','our','my','king','queen','lord','lady','people','realm','kingdom','gods','god','herald','hear','let','all','the','by','in','of','and','o']);

  /* ---- everything below runs only in the game ---- */
  const soldiers=T=>(T.jobs&&T.jobs.soldier)||0;
  const near=(a,b)=>Math.hypot(a.cx-b.cx,a.cy-b.cy)<=REACH;
  const canSettle=T=>T.pop>=14&&T.towns.length<8;
  function situation(T){
    const others=tribes.filter(o=>o.alive&&o.pop>0&&o!==T&&near(T,o));
    return {
      kingdom:T.title,people:RACES[T.race].plural,faith:T.rel.name,god:T.rel.patron.name,year:year(),era:AGE_NAME[T.age|0],
      population:T.pop,soldiers:soldiers(T),food:Math.round(T.food),materials:Math.round(T.mat),
      stability:Math.round(T.stab),devotion:Math.round(T.devo),villages:T.towns.map(t=>t.name),values:T.values.map(v=>v.name),
      canSettle:canSettle(T),
      neighbors:others.map(o=>({name:o.title,people:RACES[o.race].plural,population:o.pop,soldiers:soldiers(o),era:AGE_NAME[o.age|0],
        distance:Math.round(Math.hypot(T.cx-o.cx,T.cy-o.cy)),sameFaith:o.rel===T.rel,atWar:hostile(T.id,o.id),allied:allied(T.id,o.id)})),
      recent:T.hist.slice(0,8).map(h=>`Year ${h.y}: ${h.m}`),
      yourLastDecrees:(T.decrees||[]).slice(0,4).map(d=>`Year ${d.y}: ${d.action}${d.target?' '+d.target:''}${d.ok?'':' (refused)'}`),
    };
  }

  /* apply a move that has just been checked against the live world */
  function apply(T,d){
    const K=d.target?tribes.find(o=>o.alive&&o.title===d.target):null,y=year();
    switch(d.action){
      case 'declare_war':declareWar(T,K);break;
      case 'make_peace':
        wars=wars.filter(w=>!((w.a===T.id&&w.b===K.id)||(w.a===K.id&&w.b===T.id)));
        log(`The ${T.title} and the ${K.title} made peace.`,[120,190,120],false,newsAt(K,'🕊️',1));break;
      case 'form_alliance':
        alliances.push({a:T.id,b:K.id,until:y+10});
        log(`The ${T.title} and the ${K.title} sealed an alliance.`,[96,190,140],false,newsAt(T,'🤝',1));sfx('fanfare',null,null);break;
      case 'break_alliance':
        alliances=alliances.filter(x=>!((x.a===T.id&&x.b===K.id)||(x.a===K.id&&x.b===T.id)));
        log(`The ${T.title} broke its alliance with the ${K.title}.`,[200,140,90]);break;
      case 'found_village':settle(T);break;
      case 'patronize_arts':
        T.devo=clamp(T.devo+6,0,100);T.stab=clamp(T.stab+4,0,100);if(T.hall>=0&&T.food>8)makeArt(T);break;
    }
  }
  function remember(T,d,ok,note){
    T.decrees=T.decrees||[];
    T.decrees.unshift({y:year(),action:d?d.action:'none',target:d&&d.target||null,decree:d&&typeof d.decree==='string'?d.decree.slice(0,DECREE_MAX):'',ok,note:note||''});
    if(T.decrees.length>KEEP)T.decrees.length=KEEP;
  }

  /* ---- talking to the bridge ---- */
  const status={url:'http://127.0.0.1:8787',online:null,busy:new Set(),last:''};
  async function ask(sit,last,errors){
    const r=await fetch(status.url+'/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({situation:sit,last,errors})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.error||`the bridge answered ${r.status}`);
    return j.text;
  }
  async function turn(T){
    status.busy.add(T.id);
    try{
      let sit=situation(T),last=null,errors=null,d=null;
      for(let tryN=1;tryN<=MAX_TRIES;tryN++){
        const text=await ask(sit,last,errors);status.online=true;
        const p=CHRON.parseReply(text);
        d=p.ok?p.value:null;errors=p.ok?checkDecision(d,sit):[p.error];
        if(!errors.length)break;
        last=text;
      }
      if(!T.alive)return;
      if(errors.length){remember(T,d,false,errors[0]);log(`The council of the ${T.title} could not agree on a decree.`,[170,150,190],true);return}
      /* the world moved on while Claude thought: check the move again against the world as it is now */
      const late=checkDecision(d,situation(T));
      if(late.length){remember(T,d,false,`too late: ${late[0]}`);log(`The ${T.title}'s decree came too late: ${late[0]}.`,[170,150,190],true);return}
      log(`👑 The herald of the ${T.title} proclaims: “${d.decree.trim()}”`,[236,196,96],false,newsAt(T,'👑',1));
      apply(T,d);remember(T,d,true);
    }catch(e){
      status.online=false;status.last=e.message;
      if(typeof toast==='function')toast(`Claude could not be reached for the ${T.title}. Is the bridge running? (${e.message})`);
    }finally{status.busy.delete(T.id);if(typeof codexOpen==='function'&&codexOpen())renderCodex(true)}
  }
  /* called from yearly(): start any turns that are due. They finish later, between frames, never inside a sim step */
  function rulerYear(){
    if(typeof fetch!=='function')return;
    for(const T of tribes){
      if(!T.alive||!T.claude||status.busy.has(T.id))continue;
      if(year()-(T.ruledAt??-99)<RULE_YEARS)continue;
      T.ruledAt=year();turn(T);
    }
  }
  async function ping(){
    try{const r=await fetch(status.url+'/health');status.online=r.ok;const j=await r.json();status.last=j.model||''}
    catch(e){status.online=false;status.last=e.message}
    return status.online;
  }

  return {RULE_YEARS,REACH,ACTIONS,SYSTEM,DECREE_MAX,prompt,checkRequest,checkDecision,situation,apply,remember,turn,rulerYear,ping,status};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=RULER;
