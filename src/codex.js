"use strict";
/* ============ Realm Codex: faith, culture, art and history of one kingdom ============ */
let codexT=null,codexTab='overview';
const cxEl=id=>document.getElementById(id);
const CX_TABS=[['overview','Overview'],['faith','Faith'],['culture','Culture & Art'],['history','History']];
const codexOpen=()=>!!codexT;
function openCodex(T,tab){closePanels(closeCodex);codexT=T;if(tab)codexTab=tab;cxEl('codex').hidden=false;renderCodex(true)}
function closeCodex(){codexT=null;cxEl('codex').hidden=true}

function glyphSVG(sym,size){
  const D=DOMAINS[sym];let r='';
  D.sym.forEach((row,y)=>{for(let x=0;x<5;x++)if(row[x]==='#')r+=`<rect x="${x}" y="${y}" width="1.03" height="1.03"/>`});
  return `<svg class="glyph" viewBox="-.6 -.6 6.2 6.2" width="${size}" height="${size}" fill="${css(D.c)}" aria-hidden="true">${r}</svg>`;
}
const meter=(label,v,color,note)=>`<div class="meter"><span>${label}</span><div class="mbar"><i style="width:${Math.round(v)}%;background:${color}"></i></div><b>${Math.round(v)}</b></div>${note?`<p class="mnote">${note}</p>`:''}`;
const buffChips=(b,scale)=>Object.keys(b).map(k=>`<span class="bchip">${fmtBuff(k,b[k]*(scale||1))}</span>`).join('');
const nmIn=(val,kind,attrs,label,cls)=>`<input class="nm-in${cls?' '+cls:''}" value="${esc(val==null?'':val)}" data-kind="${kind}" ${attrs} aria-label="${esc(label)}" maxlength="40" spellcheck="false"${kind==='pet'?' placeholder="Give it a name"':''}>`;
const stars=q=>'\u2605'.repeat(q)+'\u2606'.repeat(5-q);
const fxKeys=fx=>Object.keys(fx).filter(k=>Math.abs(fx[k])>.004).sort((a,b)=>Math.abs(fx[b])-Math.abs(fx[a]));

/* how far the kingdom is from its next era: research (a bar) and the ore still to dig */
function eraNote(T,L){
  const pace=`${L.plural} learn ${TECH_WORD(L.tech||1)}.`;
  if(T.age>=ERA_MAX)return `<p class="mnote">The height of technology. ${pace}</p>`;
  const q=ERA_REQ[T.age+1],pct=Math.min(100,Math.round((T.sci||0)/q.sci*100));
  const need=Object.keys(q.ore).filter(k=>(T.res[k]||0)<q.ore[k]).map(k=>`${ORES[ORE[k.toUpperCase()]].icon} ${q.ore[k]-(T.res[k]||0)} more ${k}`);
  return `${meter('Research',pct,'#6fa8dc',`Toward the ${AGE_NAME[T.age+1]}: ${pct}%. ${pace}`)}
  <p class="mnote">${need.length&&(T.sci||0)<q.sci*1.5?`Still to dig: ${need.join(', ')} (or research half as far again). `:''}Teachers, a great hall and more people speed research. Each era upgrades homes, tools, weapons, boats and farms.</p>`;
}
/* ---- Claude on the throne (ruler.js): the switch, the bridge's state and the last decrees */
function cxRule(T){
  const S=RULER.status,on=!!T.claude,busy=S.busy.has(T.id);
  const state=!on?'This kingdom rules itself.':busy?'Claude is weighing the next move…':S.online===false?`Claude cannot be reached: start the bridge on this computer with <code>node tools/ruler-bridge/bridge.js</code>.`:
    `Claude chooses one move every ${RULER.RULE_YEARS} years${T.ruledAt!=null?`; next in year ${T.ruledAt+RULER.RULE_YEARS}`:''}.`;
  const ds=(T.decrees||[]).slice(0,5);
  return `<div class="rule"><div class="bard-row"><button class="btn sm" data-rule="${on?'off':'on'}" aria-pressed="${on}">${on?'👑 Claude rules · take the crown back':'👑 Let Claude rule'}</button>
    ${on&&!busy?'<button class="btn sm" data-rule="now">Ask now</button>':''}</div>
    <p class="mnote">${state}</p>
    ${ds.length?`<ol class="log">${ds.map(d=>`<li><span class="yr">Y${d.y}</span><span>${d.ok?`<b>${esc(d.action.replace(/_/g,' '))}${d.target?' → '+esc(d.target):''}</b>. “${esc(d.decree)}”`:`<i>Refused</i>: ${esc(d.note)}`}</span></li>`).join('')}</ol>`:''}</div>`;
}
function cxOverview(T,L){
  const foes=wars.filter(w=>w.a===T.id||w.b===T.id).map(w=>tribes[w.a===T.id?w.b:w.a]);
  const al=alliesOf(T),fx=T.fx,keys=fxKeys(fx);
  const st=T.stab>=70?'Steady and orderly.':T.stab>=STAB_CALM?'Mostly calm.':T.stab>=REBEL_STAB?'Restless. Whispers of discontent.':'On the brink of rebellion.';
  return `${T.alive?cxRule(T):''}${T.golden>step?`<p>🌟 A golden age: more food, finer art and calmer streets for ${Math.ceil((T.golden-step)/YEAR)} more years.</p>`:''}
  ${meter('Stability',T.stab,T.stab<REBEL_STAB?'#d4533a':T.stab<STAB_CALM?'#e0a23a':'#5cb86a',st)}
  ${meter('Devotion',T.devo,css(DOMAINS[T.rel.domain].c),T.temple?'The temple strengthens their blessings.':'No temple yet: blessings are only 65% effective.')}
  <dl><dt>People</dt><dd>${T.pop} ${T.pop===1?L.name.toLowerCase():L.plural.toLowerCase()}</dd>
    <dt>Buildings</dt><dd>${T.houses}${T.temple?', with a temple':''}${T.hall>=0?', great hall raised':''}</dd>
    <dt>Monuments</dt><dd>${T.monuments} standing, renown ${T.renown}</dd>
    <dt>Livestock</dt><dd>${T.stock}${T.fish?`, ${T.fish} fishing boats`:''}</dd>
    <dt>Stores</dt><dd>${T.food} food, ${T.mat} ${T.race==='dwarf'?'stone':'timber'}</dd>
    <dt>Age</dt><dd><b>${AGE_NAME[T.age]}</b>. ${AGE_WHY[T.age]}</dd>
    <dt>Domain</dt><dd>${sharePct(T)}% of the land (${T.area} tiles)</dd>
    <dt>Ore mined</dt><dd>${Object.keys(T.res).filter(k=>T.res[k]>0).map(k=>`${ORES[ORE[k.toUpperCase()]].icon} ${T.res[k]}`).join(' &nbsp; ')||'none yet'}</dd>
    <dt>Founded</dt><dd>Year ${T.founded}${T.parent>=0?`, by ${T.rebel?'rebels of':'settlers of'} the ${tribes[T.parent].title}`:''}</dd></dl>
  ${eraNote(T,L)}
  <h4>Settlements (${T.towns.length})</h4>
  ${T.towns.map((H,k)=>`<div class="town"><span>${nmIn(H.name,'town',`data-id="${T.id}" data-t="${k}"`,'Settlement name','b')}${k===0?' <span class="tag">capital</span>':''}<br><span class="gdom">${H.pop} people, ${H.houses} ${H.houses===1?'building':'buildings'}, founded year ${H.founded}</span></span><button class="btn sm cx-town" data-x="${H.x}" data-y="${H.y}">Show</button></div>`).join('')}
  <h4>Workforce</h4>
  <div class="chips2">${JOB_KEYS.filter(j=>T.jobs&&T.jobs[j]).map(j=>`<span class="bchip" title="${JOBS[j].d}">${JOBS[j].ic} ${JOBS[j].n} ${T.jobs[j]}</span>`).join('')||'<span class="empty">No one has a trade yet.</span>'}</div>
  ${T.colonies?`<p class="mnote">${T.colonies} ${T.colonies===1?'colony':'colonies'} founded.</p>`:''}
  <h4>Active blessings</h4>
  <div class="chips2">${keys.length?keys.map(k=>`<span class="bchip" title="From faith, culture and season">${fmtBuff(k,fx[k])}</span>`).join(''):'<span class="empty">None yet.</span>'}</div>
  ${T.race==='elf'?`<p class="mnote">${SEASONS[season()]}: ${SEASON_TEXT[season()]}</p>`:''}
  ${T.bless>step?`<p class="mnote">Blessed: the recent rite is boosting the patron\u2019s gift.</p>`:''}${T.frenzy>step?`<p class="mnote">The horde is in a war-frenzy: +25% damage.</p>`:''}
  <h4>Relations</h4>
  <p>${foes.length?`<span class="warc">At war with ${foes.map(f=>'the '+f.title).join(' and ')}.</span>`:'At peace.'}${al.length?` <span class="allyc">Allied with ${al.map(f=>'the '+f.title).join(' and ')}.</span>`:''}</p>
  ${T.heroes.length?`<h4>Heroes</h4><ul class="plain">${T.heroes.slice(-5).reverse().map(h=>`<li><b>${h.name}</b>, ${h.kills} victories, fell in year ${h.y}</li>`).join('')}</ul>`:''}
  ${(T.slain||[]).length?`<h4>Beasts slain</h4><ul class="plain">${T.slain.slice(-5).reverse().map(s=>`<li><b>${esc(s.n)}</b>${s.by?`, struck down by ${esc(s.by)}`:''}, year ${s.y}</li>`).join('')}</ul>`:''}`;
}
function cxFaith(T,L){
  const rel=T.rel,d=rel.patron,sec=rel.second,fol=units.filter(u=>u.k===0&&tribes[u.tribe].rel===rel).length;
  const seasonNote=d.season>=0?`<p class="mnote">Strongest in ${SEASONS[d.season]}${season()===d.season?' (now: +50% gift)':''}.</p>`:'';
  const next=T.temple?(year()>=T.nextFest?'Soon':`Year ${T.nextFest}`):'Needs a temple';
  return `<div class="godcard">${glyphSVG(d.sym,52)}<div><h4 class="gname">${nmIn(d.name,'god',`data-rel="${rel.id}" data-g="patron"`,'Patron god name')}, ${d.title}</h4><p class="gdom">${d.dom}</p></div></div>
  <p>${d.desc}</p><div class="chips2">${buffChips(d.buff,1)}</div>${seasonNote}
  <dl><dt>Faith</dt><dd>${nmIn(rel.name,'faith',`data-rel="${rel.id}"`,'Faith name')}</dd><dt>Doctrine</dt><dd><b>${rel.doc.name}</b>. ${rel.doc.desc}</dd>
  <dt>Followers</dt><dd>${fol} across ${(n=>n+(n===1?' realm':' realms'))(tribes.filter(t=>t.alive&&t.rel===rel).length)}</dd>
  <dt>Devotion</dt><dd>${Math.round(T.devo)} of 100, scaling every blessing</dd></dl>
  ${sec?`<h4>Second god</h4><div class="godcard">${glyphSVG(sec.sym,36)}<div>${nmIn(sec.name,'god',`data-rel="${rel.id}" data-g="second"`,'Second god name','b')}, ${sec.title}<p class="gdom">${sec.dom}. Half of their gift is shared.</p></div></div>`:''}
  <h4>Tenets</h4><ul class="plain">${rel.tenets.map(t=>`<li>${t}</li>`).join('')}</ul>
  <h4>Sacred rite</h4><p><b>${d.rite}</b> \u2014 ${d.ritedesc}</p><p class="mnote">Next celebration: ${next}. Rites raise devotion and grant a blessing for a time${{dwarf:', plus a tribute of stone',elf:', healing everyone and waking new trees',human:', plus a feast and calmer streets',orc:', plus a war-frenzy for the horde'}[RB(T.race)]}.</p>
  <h4>Pantheon of the ${L.plural.toLowerCase()}</h4>
  ${PANTHEON[T.race].map(g=>`<div class="pg${g===d?' cur':''}">${glyphSVG(g.sym,30)}<div><b>${g.name}, ${g.title}</b>${g===d?' <span class="tag">patron</span>':''}${g===sec?' <span class="tag">second</span>':''}<p class="gdom">${g.dom}</p><div class="chips2 sm">${buffChips(g.buff,1)}</div></div></div>`).join('')}`;
}
function cxCulture(T,L){
  return `<h4>${nmIn(cultureName(T),'culture',`data-id="${T.id}"`,'Culture name')}</h4><p class="mnote">Spoken language: ${nmIn(LANG[T.race],'lang',`data-r="${T.race}"`,'Language name')}</p>
  <h4>Values</h4>${T.values.map(v=>`<div class="val"><b>${v.name}</b><p class="gdom">${v.desc}</p><div class="chips2 sm">${buffChips(v.buff,1)}</div></div>`).join('')}
  <h4>Artistic traditions</h4><p>${ART_FORMS[T.race].map(f=>f.n).join(', ')}.</p>
  <p class="mnote">Renown ${T.renown}. Art lifts stability, devotion and diplomacy. Physical works stand on the map, like ${{human:'statues',elf:'living sculptures',dwarf:'rune-pillars',orc:'skull totems'}[RB(T.race)]}.</p>
  <h4>Works of art (${T.arts.length})</h4>
  ${T.arts.length?T.arts.map((a,ai)=>`<div class="art"><div class="arth">${nmIn(a.name,'art',`data-id="${T.id}" data-a="${ai}"`,'Work of art','b')}<span class="stars" aria-label="${a.q} of 5">${stars(a.q)}</span></div>
    <p class="gdom">${a.form} by ${a.creator}, year ${a.year}. ${a.desc}${a.lost?' (Destroyed.)':''}</p>
    ${a.i!=null&&!a.lost?`<button class="btn sm cx-fly" data-i="${a.i}">Show on map</button>`:''}</div>`).join(''):'<p class="empty">No works yet. Artists need a great hall, full stores and peace of mind.</p>'}`;
}
/* ---- the court chronicle: Claude writes it, CHRON (chronicle.js) checks it. It arrives either in a save made by
   tools/chronicler (claude -p) or by hand here: the game freezes a fact sheet, the player copies the prompt into Claude,
   pastes the reply back, and only a reply that passes every check is kept. The page itself never calls the model. */
let bard={tid:-1,facts:null,reply:'',errors:null};
function liveFacts(T){
  const rel=T.rel,par=T.parent>=0?tribes[T.parent]:null;
  return CHRON.factSheet(T,{people:RACES[T.race].plural,faith:rel.name,patronGod:rel.patron.name,secondGod:rel.second&&rel.second.name,
    doctrine:rel.docId,parentTitle:par&&par.title,worldYear:year(),legend:legendOf(T)});
}
const bardOpen=T=>bard.tid===T.id&&!!bard.facts;
function bardStart(T){bard={tid:T.id,facts:liveFacts(T),reply:'',errors:null}}
function bardPrompt(){return CHRON.chatPrompt(bard.errors&&bard.errors.length?CHRON.retryPrompt(bard.facts,bard.reply,bard.errors):CHRON.firstPrompt(bard.facts))}
function copyText(text,what){
  const done=()=>toast(`${what} copied. Paste it into Claude.`);
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();
    ok?done():toast('Copying is blocked here. Open "See the prompt" and copy it by hand.')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,fallback);else fallback();
}
function bardCheck(T){
  const r=CHRON.parseReply(bard.reply);
  bard.errors=r.ok?CHRON.validate(r.value,bard.facts):[r.error];
  if(bard.errors.length)return;
  T.chronicle=CHRON.toStored(r.value,bard.facts,{by:'Claude, pasted in the game',at:new Date().toISOString()});
  bard={tid:-1,facts:null,reply:'',errors:null};
  toast(`The chronicle of the ${T.title} passed every check and is kept with the world.`);
}
function cxBardAsk(T){
  const f=bard.facts,errs=bard.errors;
  return `<div class="bard-ask">
    <h4>Ask Claude for a chronicle</h4>
    <p class="mnote">The facts are frozen at year ${f.worldYear}: ${f.events.length} recorded events. Claude writes the story; the game checks every name, year and citation before keeping it.</p>
    <p><b>1.</b> Copy the prompt and paste it into Claude (claude.ai, the Claude app or Claude Code).</p>
    <div class="bard-row"><button class="btn sm" data-bard="copy">${errs&&errs.length?'Copy the retry prompt':'Copy prompt'}</button>
      <button class="btn sm" data-bard="cancel">Cancel</button></div>
    <details><summary>See the prompt</summary><textarea class="bard-prompt" readonly rows="6">${esc(bardPrompt())}</textarea></details>
    <p><b>2.</b> Paste Claude's whole reply here.</p>
    <textarea class="bard-reply" rows="6" placeholder='{"title": "...", "verses": [...]}' aria-label="Claude's reply">${esc(bard.reply)}</textarea>
    <div class="bard-row"><button class="btn sm" data-bard="check">Check and keep</button></div>
    ${errs&&errs.length?`<div class="bard-err" role="alert"><p><b>Not kept.</b> The reply broke ${errs.length} rule${errs.length>1?'s':''}:</p>
      <ul>${errs.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>
      <p class="mnote">Copy the retry prompt (it lists these problems for Claude), paste Claude's new reply above and check again.</p></div>`:''}
  </div>`;
}
function cxBard(T){
  const c=T.chronicle,yr=v=>v.from===v.to?`Y${v.from}`:`Y${v.from}–${v.to}`;
  if(bardOpen(T))return cxBardAsk(T);
  const ask=T.hist.length>=CHRON.MIN_EVENTS?`<button class="btn sm" data-bard="start">${c?'Ask Claude for a new chronicle':'✍ Ask Claude for a chronicle'}</button>`:'';
  if(!c)return ask?`<div class="bard-row">${ask}</div>`:'';
  return `<h4>${esc(c.title)}</h4>
  <ol class="log bard">${c.verses.map(v=>`<li><span class="yr">${yr(v)}</span><span>${esc(v.text)}</span></li>`).join('')}</ol>
  <p class="mnote">Told by the court chronicler as of year ${c.year}${year()>c.year?`, ${year()-c.year} year${year()-c.year>1?"s":""} ago`:''}. Written by ${esc(c.by||'Claude')} from this kingdom's recorded events; every name and year was checked against them.</p>
  ${ask?`<div class="bard-row">${ask}</div>`:''}`;
}
function cxHistory(T){
  const par=T.parent>=0?tribes[T.parent]:null;
  return `<p class="legend">${legendOf(T)}</p>
  ${par?`<p class="mnote">Lineage: the ${par.title}${par.alive?'':' (now fallen)'}.</p>`:''}
  ${cxBard(T)}
  <h4>Chronicle</h4>
  <ol class="log">${T.hist.length?T.hist.slice(0,40).map(l=>`<li><span class="yr">Y${l.y}</span><span style="border-left:3px solid ${css(l.c)};padding-left:8px">${l.m}</span></li>`).join(''):'<li class="empty">Nothing recorded yet.</li>'}</ol>`;
}
function renderCodex(force){
  if(!codexT)return;
  const ae=document.activeElement;if(!force&&ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA')&&cxEl('codex').contains(ae))return;
  /* while a chronicle is being asked for, the History tab holds still so a paste or a click is never lost */
  if(!force&&codexTab==='history'&&bardOpen(codexT))return;
  const T=codexT,L=RACES[T.race],d=T.rel.patron,body=cxEl('cxBody'),st=body.scrollTop;
  cxEl('cxHead').innerHTML=`<span class="sw3" style="background:${css(T.color)}"></span>
    <div><h3>${L.icon} ${L.title} ${nmIn(T.name,'king',`data-id="${T.id}"`,'Kingdom name','big')}</h3><p>${d.epi.charAt(0).toUpperCase()+d.epi.slice(1)}${T.alive?'':' (fallen)'} \u00b7 ${T.rel.name}</p></div>
    <div class="cx-actions"><button class="btn sm" id="cxGo" title="Fly to the capital">Go to capital</button><button class="insp-x" id="cxClose" aria-label="Close codex">\u00d7</button></div>`;
  cxEl('cxTabs').innerHTML=CX_TABS.map(([k,n])=>`<button data-tab="${k}" aria-pressed="${k===codexTab}">${n}</button>`).join('');
  body.innerHTML=codexTab==='faith'?cxFaith(T,L):codexTab==='culture'?cxCulture(T,L):codexTab==='history'?cxHistory(T):cxOverview(T,L);
  body.scrollTop=st;
}
cxEl('cxTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;codexTab=b.dataset.tab;cxEl('cxBody').scrollTop=0;renderCodex()});
cxEl('cxHead').addEventListener('click',e=>{
  if(e.target.closest('#cxClose'))closeCodex();
  else if(e.target.closest('#cxGo')&&codexT)flyTo(codexT.cx+.5,codexT.cy+.5,Math.max(cam.tpz,2*dpr));
});
cxEl('cxBody').addEventListener('input',e=>{if(e.target.classList.contains('bard-reply'))bard.reply=e.target.value});
cxEl('cxBody').addEventListener('click',e=>{
  const rb=e.target.closest('[data-rule]');
  if(rb&&codexT){
    const T=codexT,a=rb.dataset.rule;
    if(a==='on'){T.claude=true;T.ruledAt=null;RULER.ping().then(up=>{toast(up?`Claude now rules the ${T.title}.`:'Claude rules this kingdom once the bridge is running: node tools/ruler-bridge/bridge.js');renderCodex(true)})}
    else if(a==='off'){T.claude=false;toast(`The ${T.title} rules itself again.`)}
    else if(a==='now'&&!RULER.status.busy.has(T.id)){T.ruledAt=year();RULER.turn(T)}
    renderCodex(true);return;
  }
  const bb=e.target.closest('[data-bard]');
  if(bb&&codexT){
    const T=codexT,a=bb.dataset.bard;
    if(a==='start')bardStart(T);
    else if(a==='cancel')bard={tid:-1,facts:null,reply:'',errors:null};
    else if(a==='copy'){copyText(bardPrompt(),bard.errors&&bard.errors.length?'The retry prompt':'The prompt');return}
    else if(a==='check'){const ta=cxEl('cxBody').querySelector('.bard-reply');if(ta)bard.reply=ta.value;bardCheck(T)}
    renderCodex(true);return;
  }
  const tw=e.target.closest('.cx-town');if(tw){flyTo(+tw.dataset.x+.5,+tw.dataset.y+.5,Math.max(cam.tpz,2.5*dpr));return}
  const b=e.target.closest('.cx-fly');if(!b)return;
  const i=+b.dataset.i;flyTo(i%W+.5,((i/W)|0)+.5,Math.max(cam.tpz,3*dpr));
  if(window.innerWidth>860)select({i});
});

const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ============ Registry: every kingdom, village, faith, culture and language, with names you can change ============ */
let regOpen=false,regTab='kingdoms',regHTML='';
const regSort={kingdoms:['pop',-1],faiths:['fol',-1],cultures:['pop',-1],langs:['spk',-1]};
const regFilt={kingdoms:{q:'',race:'',st:''},faiths:{q:'',race:''},cultures:{q:'',race:''},langs:{q:'',race:''}};
const RG_TABS=[['kingdoms','🏰 Kingdoms'],['faiths','🛐 Religions'],['cultures','🎭 Cultures'],['langs','🗣️ Languages']];
const RG_NOUN={kingdoms:'kingdoms',faiths:'faiths',cultures:'cultures',langs:'languages'};
const rgSold=T=>((T.jobs&&T.jobs.soldier)||0)+(T.general>0?1:0);
const rgWar=T=>wars.some(w=>w.a===T.id||w.b===T.id);
const rgAlive=()=>tribes.filter(T=>T.alive);
const rgSum=(a,f)=>a.reduce((s,T)=>s+f(T),0);
const RG_SORTS={
  kingdoms:[['pop','Population',o=>o.T.pop],['sol','Soldiers',o=>rgSold(o.T)],['area','Size',o=>o.T.area],['era','Era',o=>o.T.age],['age','Age',o=>year()-o.T.founded],['vil','Villages',o=>o.T.towns.length],['stab','Stability',o=>o.T.stab],['name','Name',o=>o.T.name]],
  faiths:[['fol','Followers',o=>o.pop],['kin','Kingdoms',o=>o.k.length],['sol','Soldiers',o=>o.sol],['area','Size',o=>o.area],['age','Age',o=>year()-o.rel.founded],['name','Name',o=>o.rel.name]],
  cultures:[['pop','Population',o=>o.T.pop],['ren','Renown',o=>o.T.renown],['art','Works of art',o=>o.T.arts.length],['area','Size',o=>o.T.area],['sol','Soldiers',o=>rgSold(o.T)],['age','Age',o=>year()-o.T.founded],['name','Name',o=>cultureName(o.T)]],
  langs:[['spk','Speakers',o=>cnt.race[o.r]||0],['kin','Kingdoms',o=>o.k.length],['area','Size',o=>o.area],['sol','Soldiers',o=>o.sol],['name','Name',o=>LANG[o.r]]]};
function openRegistry(tab){closePanels(closeRegistry);regOpen=true;if(tab)regTab=tab;cxEl('registry').hidden=false;renderRegistry(true)}
function closeRegistry(){regOpen=false;cxEl('registry').hidden=true}
const rgIn=(val,kind,attrs,label)=>`<input class="rg-in" value="${esc(val)}" data-kind="${kind}" ${attrs} aria-label="${esc(label)}" maxlength="40" spellcheck="false">`;
const rgSt=(l,v)=>`<span><i>${l}</i><b>${v}</b></span>`;
const rgRaces=()=>RACE_KEYS.filter(r=>(cnt.race[r]||0)>0||tribes.some(T=>T.alive&&T.race===r));
function rgItems(){
  const F=regFilt[regTab],q=F.q.trim().toLowerCase(),A=rgAlive();let L=[],all=0;
  if(regTab==='kingdoms')L=A.map(T=>({T,r:T.race,nm:[T.name,T.title,T.rel.name,...T.towns.map(H=>H.name)]}));
  else if(regTab==='cultures')L=A.map(T=>({T,r:T.race,nm:[cultureName(T),T.name,T.title]}));
  else if(regTab==='faiths'){const m=new Map();for(const T of A){const v=m.get(T.rel)||{rel:T.rel,k:[]};v.k.push(T);m.set(T.rel,v)}
    L=[...m.values()].map(v=>(v.pop=rgSum(v.k,T=>T.pop),v.sol=rgSum(v.k,rgSold),v.area=rgSum(v.k,T=>T.area),v.rs=v.k.map(T=>T.race),v.nm=[v.rel.name,v.rel.patron.name,...v.k.map(T=>T.name)],v))}
  else L=RACE_KEYS.map(r=>{const k=A.filter(T=>T.race===r);return {r,k,area:rgSum(k,T=>T.area),sol:rgSum(k,rgSold),nm:[LANG[r],RACES[r].plural,...k.map(T=>T.name)]}});
  all=L.length;
  L=L.filter(o=>(!F.race||(o.rs?o.rs.includes(F.race):o.r===F.race))&&(!q||o.nm.some(n=>String(n).toLowerCase().includes(q)))&&(!F.st||(F.st==='war')===rgWar(o.T)));
  const S=RG_SORTS[regTab],cur=S.find(s=>s[0]===regSort[regTab][0])||S[0],d=regSort[regTab][1],f=cur[2];
  L.sort((a,b)=>{const x=f(a),y=f(b);return typeof x==='string'?x.localeCompare(y)*-d:(x-y)*d});
  return {L,all};
}
function renderRgBar(){
  const F=regFilt[regTab],S=RG_SORTS[regTab],sd=regSort[regTab],rs=rgRaces();
  if(F.race&&!rs.includes(F.race))F.race='';
  cxEl('rgBar').innerHTML=`<input type="search" class="rg-q" id="rgQ" placeholder="Search names" value="${esc(F.q)}" aria-label="Search names" maxlength="40" spellcheck="false">
  <select id="rgRace" aria-label="Filter by people"><option value="">All peoples</option>${rs.map(r=>`<option value="${r}"${F.race===r?' selected':''}>${esc(RACES[r].plural)}</option>`).join('')}</select>
  ${regTab==='kingdoms'?`<select id="rgSt" aria-label="Filter by status">${[['','All'],['war','At war'],['peace','At peace']].map(([v,n])=>`<option value="${v}"${F.st===v?' selected':''}>${n}</option>`).join('')}</select>`:''}
  <select id="rgSort" aria-label="Sort by">${S.map(s=>`<option value="${s[0]}"${s[0]===sd[0]?' selected':''}>Sort: ${s[1]}</option>`).join('')}</select>
  <button class="btn sm" id="rgDir" aria-label="Sort order">${sd[1]<0?'↓ high first':'↑ low first'}</button>`;
}
function rgKingdoms(L){
  return L.map(({T})=>{const R=RACES[T.race],foes=wars.filter(w=>w.a===T.id||w.b===T.id).map(w=>tribes[w.a===T.id?w.b:w.a]),al=alliesOf(T);
    return `<div class="rg-row"><span class="sw" style="background:${css(T.color)}"></span><div>
    <label class="rg-lab">${R.icon} ${R.title}</label>${rgIn(T.name,'king',`data-id="${T.id}"`,'Kingdom name')}
    <div class="rg-stats">${rgSt('People',T.pop+' '+esc(R.plural.toLowerCase()))}${rgSt('Soldiers',rgSold(T))}${rgSt('Villages',T.towns.length)}${rgSt('Land',T.area+' tiles, '+sharePct(T)+'%')}${rgSt('Era',AGE_NAME[T.age])}${rgSt('Founded','Y'+T.founded+' ('+(year()-T.founded)+' yrs)')}${rgSt('Faith',esc(T.rel.name))}${rgSt('Stability',Math.round(T.stab))}${rgSt('Devotion',Math.round(T.devo))}${rgSt('Food',T.food)}${rgSt(T.race==='dwarf'?'Stone':'Timber',T.mat)}${rgSt('Livestock',T.stock)}${rgSt('Renown',T.renown)}${rgSt('Wars',foes.length?foes.map(f=>esc(f.name)).join(', '):'none')}${rgSt('Allies',al.length?al.map(f=>esc(f.name)).join(', '):'none')}</div>
    ${T.towns.length>1?`<label class="rg-lab">Villages</label><div class="rg-towns">${T.towns.map((H,k)=>k?rgIn(H.name,'town',`data-id="${T.id}" data-t="${k}"`,'Village name'):'').join('')}</div>`:''}
    <div class="row-btns"><button class="btn sm rg-codex" data-id="${T.id}">Open codex</button><button class="btn sm rg-go" data-id="${T.id}">Go there</button></div></div></div>`}).join('');
}
function rgFaiths(L){
  return L.map(v=>{const rel=v.rel,p=rel.patron;return `<div class="rg-row"><span class="sw" style="background:${css(DOMAINS[rel.domain].c)}"></span><div>
    <label class="rg-lab">Faith</label>${rgIn(rel.name,'faith',`data-rel="${rel.id}"`,'Faith name')}
    <label class="rg-lab">Patron god, ${esc(p.title)}</label>${rgIn(p.name,'god',`data-rel="${rel.id}" data-g="patron"`,'Patron god name')}
    <div class="rg-stats">${rgSt('Doctrine',esc(rel.doc.name))}${rgSt('Domain',esc(p.dom))}${rgSt('Founded','Y'+rel.founded+' ('+(year()-rel.founded)+' yrs)')}${rgSt('Followers',v.pop)}${rgSt('Kingdoms',v.k.map(T=>esc(T.name)).join(', '))}${rgSt('Soldiers',v.sol)}${rgSt('Land',v.area+' tiles')}</div>
    <p class="gdom">${rel.tenets.map(esc).join(' · ')}</p></div></div>`}).join('');
}
function rgCultures(L){
  return L.map(({T})=>{const ar=T.arts.filter(a=>!a.lost).sort((a,b)=>b.q-a.q)[0];return `<div class="rg-row"><span class="sw" style="background:${css(T.color)}"></span><div>
    <label class="rg-lab">Culture of the ${esc(T.title)}</label>${rgIn(cultureName(T),'culture',`data-id="${T.id}"`,'Culture name')}
    <div class="chips2 sm">${T.values.map(v=>`<span class="bchip" title="${esc(v.desc)}">${esc(v.name)}</span>`).join('')}</div>
    <div class="rg-stats">${rgSt('Kingdom',esc(T.name))}${rgSt('Population',T.pop)}${rgSt('Era',AGE_NAME[T.age])}${rgSt('Renown',T.renown)}${rgSt('Works',T.arts.length)}${rgSt('Best work',ar?esc(ar.name)+' '+stars(ar.q):'none')}</div></div></div>`}).join('');
}
function rgLangs(L){
  return L.map(({r,k})=>`<div class="rg-row"><span class="sw" style="background:#8a7fb0"></span><div>
    <label class="rg-lab">${RACES[r].icon} Language of the ${RACES[r].plural.toLowerCase()}</label>${rgIn(LANG[r],'lang',`data-r="${r}"`,'Language name')}
    <div class="rg-stats">${rgSt('Speakers',cnt.race[r]||0)}${rgSt('Kingdoms',k.length?k.map(T=>esc(T.name)).join(', '):'none')}${rgSt('Land',rgSum(k,T=>T.area)+' tiles')}${rgSt('Soldiers',rgSum(k,rgSold))}${k.length?rgSt('Greeting','“'+esc(k[0].motto)+'”'):''}</div>
    <div class="row-btns"><button class="btn sm rg-hear" data-r="${r}">Hear it</button></div></div></div>`).join('');
}
function renderRegistry(force,bar){
  if(!regOpen)return;
  const body=cxEl('rgBody'),ae=document.activeElement,inReg=ae&&cxEl('registry').contains(ae)&&(ae.tagName==='INPUT'||ae.tagName==='SELECT');
  if(!force&&(inReg||body.querySelector(':active')))return;
  if(force&&!bar){
    cxEl('rgHead').innerHTML=`<span class="sw3" style="background:var(--accent)"></span><div><h3>Registry of the World</h3><p>Every name here is yours to change. Type, then press Enter.</p></div>
    <div class="cx-actions"><button class="insp-x" id="rgClose" aria-label="Close registry">×</button></div>`;
    cxEl('rgTabs').innerHTML=RG_TABS.map(([k,n])=>`<button data-tab="${k}" aria-pressed="${k===regTab}">${n}</button>`).join('');
    if(!cxEl('rgBar').innerHTML||!inReg)renderRgBar();
  }
  const {L,all}=rgItems();
  let h;
  if(!all)h=regTab==='kingdoms'?'<p class="empty">No kingdoms yet. Pick a people in the Creatures tab and tap on land.</p>':regTab==='cultures'?'<p class="empty">No cultures yet.</p>':regTab==='faiths'?'<p class="empty">No faiths yet.</p>':'';
  else h=`<p class="rg-count">${L.length<all?`${L.length} of ${all} ${RG_NOUN[regTab]}`:`${all} ${RG_NOUN[regTab]}`}</p>`+(L.length?(regTab==='faiths'?rgFaiths:regTab==='cultures'?rgCultures:regTab==='langs'?rgLangs:rgKingdoms)(L):'<p class="empty">Nothing matches the filters.</p>');
  if(h===regHTML&&!force)return;
  regHTML=h;const st=body.scrollTop;body.innerHTML=h;body.scrollTop=st;
}
/* any name box in the game: class rg-in or nm-in with data-kind */
function applyName(el){
  const k=el.dataset.kind,pet=k==='pet',v=el.value.trim().slice(0,40);
  if(v===el.defaultValue||(!v&&!pet)){el.value=el.defaultValue;return}
  const d=el.dataset;let ok=false;
  if(k==='king'){const T=tribes[+d.id];if(T){const old=T.title;if(T.towns[0].name===T.name)T.towns[0].name=v;T.name=v;T.title=`${RACES[T.race].title} ${v}`;log(`The ${old} is now known as the ${T.title}.`,T.color);ok=true}}
  else if(k==='town'){const T=tribes[+d.id],H=T&&T.towns[+d.t];if(H){H.name=v;ok=true}}
  else if(k==='faith'){const r=religions[+d.rel];if(r){r.name=v;ok=true}}
  else if(k==='god'){const r=religions[+d.rel],g=r&&(d.g==='second'?r.second:r.patron);if(g){g.name=v;if(g===r.patron)r.deity=v;ok=true}}
  else if(k==='culture'){const T=tribes[+d.id];if(T){T.cultureName=v;ok=true}}
  else if(k==='lang'){if(d.r in LANG){LANG[d.r]=v;ok=true}}
  else if(k==='person'||k==='pet'){const id=+d.uid;let u=units.find(x=>x.id===id);
    if(!u)for(const b of boats){u=b.pass.find(x=>x.id===id);if(u)break}
    if(u){if(pet)u.nick=v;else u.name=v;ok=true}}
  else if(k==='art'){const T=tribes[+d.id],a=T&&T.arts[+d.a];if(a){a.name=v;ok=true}}
  if(!ok)return;
  toast(v?`Renamed to “${v}”.`:'Name cleared.');renderPanel(true);
  if(codexOpen())renderCodex(true);if(regOpen)renderRegistry(true,true);inspHTML='';
}
document.addEventListener('change',e=>{if(e.target.matches&&e.target.matches('input.rg-in[data-kind],input.nm-in[data-kind]'))applyName(e.target)});
document.addEventListener('keydown',e=>{const el=e.target;if(!el.matches||!el.matches('input.rg-in[data-kind],input.nm-in[data-kind]'))return;
  if(e.key==='Enter'){el.blur()}else if(e.key==='Escape'){e.stopPropagation();el.value=el.defaultValue;el.blur()}});
cxEl('rgBody').addEventListener('click',e=>{
  const c=e.target.closest('.rg-codex');if(c){const T=tribes[+c.dataset.id];if(T){flyTo(T.cx+.5,T.cy+.5,Math.max(cam.tpz,2*dpr));openCodex(T,'overview')}return}
  const g=e.target.closest('.rg-go');if(g){const T=tribes[+g.dataset.id];if(T)flyTo(T.cx+.5,T.cy+.5,Math.max(cam.tpz,2*dpr));return}
  const h=e.target.closest('.rg-hear');if(h){audioInit();playAt('speak',.9,0,{race:h.dataset.r,child:false})}
});
cxEl('rgTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;regTab=b.dataset.tab;cxEl('rgBody').scrollTop=0;renderRgBar();renderRegistry(true,true);cxEl('rgTabs').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))});
cxEl('rgBar').addEventListener('input',e=>{if(e.target.id==='rgQ'){regFilt[regTab].q=e.target.value;renderRegistry(true,true)}});
cxEl('rgBar').addEventListener('change',e=>{const t=e.target,F=regFilt[regTab];
  if(t.id==='rgRace')F.race=t.value;else if(t.id==='rgSt')F.st=t.value;else if(t.id==='rgSort')regSort[regTab][0]=t.value;else return;
  cxEl('rgBody').scrollTop=0;renderRegistry(true,true)});
cxEl('rgBar').addEventListener('click',e=>{const b=e.target.closest('#rgDir');if(!b)return;const s=regSort[regTab];s[1]=-s[1];b.textContent=s[1]<0?'↓ high first':'↑ low first';renderRegistry(true,true)});
cxEl('rgHead').addEventListener('click',e=>{if(e.target.closest('#rgClose'))closeRegistry()});

/* ============ The Chronicle: the great events of the world, newest first ============ */
let chronOpen=false,chronTop=null;
function openChron(){closePanels(closeChron);chronOpen=true;cxEl('chron').hidden=false;renderChron(true)}
function closeChron(){chronOpen=false;cxEl('chron').hidden=true}
function renderChron(force){
  if(!chronOpen)return;
  if(!force&&logs[0]===chronTop)return;
  chronTop=logs[0];
  cxEl('chHead').innerHTML=`<span class="chbook" aria-hidden="true"></span><div><h3>The Chronicle</h3><p>Year ${year()} · ${logs.length} entries</p></div>
    <div class="cx-actions"><button class="insp-x" id="chClose" aria-label="Close chronicle">×</button></div>`;
  const slot=cxEl('chHead').querySelector('.chbook');if(slot)slot.replaceWith(iconCanvas(WICON.book(),40));
  cxEl('chBody').innerHTML=logs.length?`<ol class="log">${logs.map(l=>`<li><span class="yr">Y${l.y}</span><span style="border-left:3px solid ${css(l.c)};padding-left:8px">${l.m}${l.x!=null?` <button class="btn sm ch-go" data-x="${l.x}" data-y="${l.wy}">Go there</button>`:''}</span></li>`).join('')}</ol>`:'<p class="empty">Nothing has happened yet.</p>';
}
cxEl('chHead').addEventListener('click',e=>{if(e.target.closest('#chClose'))closeChron()});
cxEl('chBody').addEventListener('click',e=>{const b=e.target.closest('.ch-go');if(b){follow=false;flyTo(+b.dataset.x,+b.dataset.y,Math.max(cam.tpz,3*dpr))}});
