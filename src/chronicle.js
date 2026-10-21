"use strict";
/* ============ Chronicles: the rules Claude's chronicles must pass, shared by the game and tools/chronicler ============
   The model writes a kingdom's chronicle from a fact sheet; this file is everything around that: the fact sheet, the
   prompt, the validator and the form stored in T.chronicle. The game loads it as a classic script (global CHRON) for the
   copy-and-paste flow on the History tab; Node requires it for the headless claude -p pipeline. Nothing here touches
   the sim or the page, and nothing runs at load time except building tables. */
const CHRON=(()=>{
  const LIMITS={titleMin:3,titleMax:80,versesMin:3,versesMax:6,textMin:40,textMax:700};
  const MAX_EVENTS=40,MIN_EVENTS=3;
  const AGES=['Stone Age','Bronze Age','Iron Age','Medieval Age','Gunpowder Age','Industrial Age','Modern Age','Future Age'];

  const SYSTEM=`You are the court chronicler of a kingdom in a fantasy world simulation.
You receive a fact sheet as JSON and write that kingdom's chronicle.
Rules:
- Use only what the facts say. Do not invent people, places, gods, battles or dates.
- Every name you write must appear in the facts.
- Write in the voice of the kingdom's own people (stately for humans, lyrical for elves, carved and terse for dwarves, boastful for orcs).
- Tell it as a story: choose the events that matter most and say why they mattered. Do not list every event.
- Write years as digits, like "year 42".
- ${LIMITS.versesMin} to ${LIMITS.versesMax} verses, oldest events first, each ${LIMITS.textMin} to ${LIMITS.textMax} characters of plain text.
- Each verse lists the ids of the events it tells in "cites".
Reply with only this JSON, no other text:
{"title": "a title for the chronicle", "verses": [{"text": "...", "cites": ["E1", "E2"]}]}`;

  /* ---- the fact sheet: all the model may know. T is a tribe as saved (or live), c carries what is looked up elsewhere:
     {people, faith, patronGod, secondGod, doctrine, parentTitle, worldYear, legend} */
  function factSheet(T,c){
    /* hist is newest first; the chronicle reads oldest first and keeps the most recent events if there are many */
    const events=(T.hist||[]).slice(0,MAX_EVENTS).reverse().map((h,i)=>({id:'E'+(i+1),year:h.y,text:h.m}));
    return {
      id:T.id,kingdom:T.title,name:T.name,people:c.people,status:T.alive?'living':'fallen',
      era:AGES[T.age|0]||AGES[0],founded:T.founded|0,worldYear:c.worldYear|0,
      parent:c.parentTitle||null,rebel:!!T.rebel,
      faith:c.faith||null,patronGod:c.patronGod||null,secondGod:c.secondGod||null,doctrine:c.doctrine||null,
      values:(T.values||[]).map(v=>v.name),
      villages:(T.towns||[]).map(t=>t.name).filter(Boolean),
      population:T.pop|0,renown:T.renown|0,legend:c.legend||T.legend||null,
      worksOfArt:(T.arts||[]).slice(0,8).map(a=>({name:a.name,form:a.form,creator:a.creator,year:a.year})),
      events,
    };
  }
  const firstPrompt=facts=>`Fact sheet:\n${JSON.stringify(facts,null,1)}`;
  const retryPrompt=(facts,reply,errors)=>`${firstPrompt(facts)}\n\nYour last reply was:\n${reply}\n\nIt was rejected for these reasons:\n${errors.map(e=>'- '+e).join('\n')}\n\nWrite the chronicle again and fix every problem.`;
  /* for a chat window, where there is no separate system prompt */
  const chatPrompt=body=>`${SYSTEM}\n\n${body}`;

  /* ---- names: every word in the fact sheet is known; a capitalised word that does not start a sentence is a name */
  const norm=w=>w.toLowerCase().replace(/[’']s?$/,'').replace(/[’']/g,"'");
  function vocabulary(facts){
    const words=new Set();
    const walk=v=>{
      if(v==null)return;
      if(typeof v==='string'){for(const w of v.match(/[\p{L}][\p{L}'’-]*/gu)||[])words.add(norm(w))}
      else if(Array.isArray(v))v.forEach(walk);
      else if(typeof v==='object')Object.values(v).forEach(walk);
    };
    walk(facts);
    return words;
  }
  /* capitalised words that are fine in any chronicle even when the facts never say them */
  const ALWAYS_OK=new Set(['i','god','gods','goddess','king','queen','lord','lady','chief','prophet','general','kingdom','realm','horde','clan',
    'warren','dominion','age','ages','spring','summer','autumn','winter','north','south','east','west','heaven','heavens','chronicle',
    'year','years','the','a','an','and','of','in','so','thus','then','when','after','before','yet','but','for','o']);
  function namesIn(text){
    const out=[];
    for(const sentence of text.split(/(?<=[.!?;:])\s+|\n+/)){
      const words=sentence.match(/[\p{L}][\p{L}'’-]*/gu)||[];
      words.forEach((w,i)=>{if(i>0&&/^\p{Lu}/u.test(w))out.push(w)});
    }
    return out;
  }

  /* ---- years: "year 42", "the year forty-two" and "the forty-second year" all name year 42 */
  const UNITS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen',
    'sixteen','seventeen','eighteen','nineteen'];
  const UNIT_ORD=['zeroth','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth',
    'thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth'];
  const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const WORD_NUM=new Map();
  UNITS.forEach((w,i)=>WORD_NUM.set(w,i));UNIT_ORD.forEach((w,i)=>WORD_NUM.set(w,i));
  TENS.forEach((w,i)=>{if(w){WORD_NUM.set(w,i*10);WORD_NUM.set(w.replace(/y$/,'ieth'),i*10)}});
  WORD_NUM.set('hundred',100);WORD_NUM.set('hundredth',100);
  const NUM_WORD=`(?:${[...WORD_NUM.keys()].sort((a,b)=>b.length-a.length).join('|')})`;
  const NUM_PHRASE=`${NUM_WORD}(?:(?:[\\s-]+|\\s+and\\s+)${NUM_WORD})*`;
  const YEAR_OF=new RegExp(`\\b[Yy]ears?\\s+(?:the\\s+)?(${NUM_PHRASE})\\b`,'gi'),ORD_YEAR=new RegExp(`\\b(${NUM_PHRASE})\\s+year\\b`,'gi');
  function wordsToNum(s){
    let cur=0;
    for(const w of s.toLowerCase().split(/[\s-]+/)){
      if(w==='and')continue;
      const n=WORD_NUM.get(w);if(n==null)return null;
      if(n===100)cur=(cur||1)*100;else cur+=n;
    }
    return cur;
  }
  function yearsIn(text){
    const out=[];
    for(const m of text.matchAll(/\b(?:[Yy]ears?|Y)\s*(\d{1,5})\b/g))out.push(+m[1]);
    for(const m of text.matchAll(YEAR_OF)){const n=wordsToNum(m[1]);if(n!=null)out.push(n)}
    /* only ordinals name a year ("the fifth year"); "five years" is a span */
    for(const m of text.matchAll(ORD_YEAR))if(/(?:st|nd|rd|th)$/i.test(m[1])){const n=wordsToNum(m[1]);if(n!=null)out.push(n)}
    return out;
  }

  /* ---- the reply: pull a JSON object out of it, even from a code fence or a sentence around it */
  function parseReply(text){
    const s=String(text||'').trim();
    const fence=s.match(/```(?:json)?\s*([\s\S]*?)```/);
    const body=fence?fence[1]:s.slice(s.indexOf('{'),s.lastIndexOf('}')+1);
    try{return {ok:true,value:JSON.parse(body)}}catch(e){return {ok:false,error:`the reply is not valid JSON (${e.message})`}}
  }

  /* ---- every rule; each failure is a readable sentence that can be sent back to the model as it is */
  function validate(chron,facts){
    const errors=[];
    if(!chron||typeof chron!=='object'||Array.isArray(chron))return ['the reply must be one JSON object with "title" and "verses"'];
    const {title,verses}=chron;
    if(typeof title!=='string'||title.trim().length<LIMITS.titleMin||title.length>LIMITS.titleMax)
      errors.push(`"title" must be a string of ${LIMITS.titleMin} to ${LIMITS.titleMax} characters`);
    if(!Array.isArray(verses)||verses.length<LIMITS.versesMin||verses.length>LIMITS.versesMax){
      errors.push(`"verses" must be a list of ${LIMITS.versesMin} to ${LIMITS.versesMax} items`);
      return errors;
    }
    const byId=new Map(facts.events.map(e=>[e.id,e]));
    const known=vocabulary(facts);
    const years=new Set([facts.founded,facts.worldYear,...facts.events.map(e=>e.year),...facts.worksOfArt.map(a=>a.year)]);
    const cited=new Set();let lastYear=-Infinity;
    verses.forEach((v,n)=>{
      const where=`verse ${n+1}`;
      if(!v||typeof v.text!=='string'){errors.push(`${where} has no "text"`);return}
      const t=v.text;
      if(t.length<LIMITS.textMin||t.length>LIMITS.textMax)errors.push(`${where} is ${t.length} characters; keep each verse between ${LIMITS.textMin} and ${LIMITS.textMax}`);
      if(/[<>]/.test(t))errors.push(`${where} contains < or >; write plain text only`);
      /* grounding: every verse must rest on recorded events */
      if(!Array.isArray(v.cites)||!v.cites.length){errors.push(`${where} cites no events; every verse must cite at least one event id`);return}
      const evs=[];
      for(const c of v.cites){const e=byId.get(c);if(!e)errors.push(`${where} cites "${c}", which is not an event id`);else{evs.push(e);cited.add(c)}}
      /* verses run from oldest to newest */
      if(evs.length){const y=Math.min(...evs.map(e=>e.year));if(y<lastYear)errors.push(`${where} goes back in time (year ${y} after year ${lastYear}); keep the verses in order`);lastYear=Math.max(lastYear,y)}
      /* no invented names */
      const unknown=[...new Set(namesIn(t).filter(w=>!known.has(norm(w))&&!ALWAYS_OK.has(norm(w))))];
      if(unknown.length)errors.push(`${where} names ${unknown.map(w=>`"${w}"`).join(', ')}, which the facts never mention; use only names from the facts`);
      /* no invented dates */
      for(const y of yearsIn(t))if(!years.has(y))errors.push(`${where} mentions year ${y}, which is not in the facts`);
    });
    const need=Math.min(3,facts.events.length);
    if(cited.size<need)errors.push(`the chronicle cites only ${cited.size} different events; cite at least ${need}`);
    return errors;
  }

  /* ---- the form kept in T.chronicle: each verse keeps the years it rests on, for the Codex to show */
  function toStored(chron,facts,meta){
    const byId=new Map(facts.events.map(e=>[e.id,e]));
    return {
      title:chron.title.trim(),
      verses:chron.verses.map(v=>{const ys=v.cites.map(c=>byId.get(c).year);return {text:v.text.trim(),from:Math.min(...ys),to:Math.max(...ys)}}),
      year:facts.worldYear,
      ...meta,
    };
  }

  return {LIMITS,MAX_EVENTS,MIN_EVENTS,AGES,SYSTEM,factSheet,firstPrompt,retryPrompt,chatPrompt,
    vocabulary,norm,namesIn,yearsIn,wordsToNum,parseReply,validate,toStored};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=CHRON;
