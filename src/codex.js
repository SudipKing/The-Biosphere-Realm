"use strict";
/* ============ Realm Codex: faith, culture, art and history of one kingdom ============ */
let codexT=null,codexTab='overview';
const cxEl=id=>document.getElementById(id);
const CX_TABS=[['overview','Overview'],['faith','Faith'],['culture','Culture & Art'],['history','History']];
const codexOpen=()=>!!codexT;
function openCodex(T,tab){codexT=T;if(tab)codexTab=tab;cxEl('codex').hidden=false;renderCodex(true)}
function closeCodex(){codexT=null;cxEl('codex').hidden=true}

function glyphSVG(sym,size){
  const D=DOMAINS[sym];let r='';
  D.sym.forEach((row,y)=>{for(let x=0;x<5;x++)if(row[x]==='#')r+=`<rect x="${x}" y="${y}" width="1.03" height="1.03"/>`});
  return `<svg class="glyph" viewBox="-.6 -.6 6.2 6.2" width="${size}" height="${size}" fill="${css(D.c)}" aria-hidden="true">${r}</svg>`;
}
const meter=(label,v,color,note)=>`<div class="meter"><span>${label}</span><div class="mbar"><i style="width:${Math.round(v)}%;background:${color}"></i></div><b>${Math.round(v)}</b></div>${note?`<p class="mnote">${note}</p>`:''}`;
const buffChips=(b,scale)=>Object.keys(b).map(k=>`<span class="bchip">${fmtBuff(k,b[k]*(scale||1))}</span>`).join('');
const stars=q=>'\u2605'.repeat(q)+'\u2606'.repeat(5-q);
const fxKeys=fx=>Object.keys(fx).filter(k=>Math.abs(fx[k])>.004).sort((a,b)=>Math.abs(fx[b])-Math.abs(fx[a]));

function cxOverview(T,L){
  const foes=wars.filter(w=>w.a===T.id||w.b===T.id).map(w=>tribes[w.a===T.id?w.b:w.a]);
  const al=alliesOf(T),fx=T.fx,keys=fxKeys(fx);
  const st=T.stab>=70?'Steady and orderly.':T.stab>=45?'Mostly calm.':T.stab>=28?'Restless. Whispers of discontent.':'On the brink of rebellion.';
  return `${meter('Stability',T.stab,T.stab<28?'#d4533a':T.stab<45?'#e0a23a':'#5cb86a',st)}
  ${meter('Devotion',T.devo,css(DOMAINS[T.rel.domain].c),T.temple?'The temple strengthens their blessings.':'No temple yet: blessings are only 65% effective.')}
  <dl><dt>People</dt><dd>${T.pop} ${T.pop===1?L.name.toLowerCase():L.plural.toLowerCase()}</dd>
    <dt>Buildings</dt><dd>${T.houses}${T.temple?', with a temple':''}${T.hall>=0?', great hall raised':''}</dd>
    <dt>Monuments</dt><dd>${T.monuments} standing, renown ${T.renown}</dd>
    <dt>Livestock</dt><dd>${T.stock}${T.fish?`, ${T.fish} fishing boats`:''}</dd>
    <dt>Stores</dt><dd>${T.food} food, ${T.mat} ${T.race==='dwarf'?'stone':'timber'}</dd>
    <dt>Founded</dt><dd>Year ${T.founded}${T.parent>=0?`, by ${T.rebel?'rebels of':'settlers of'} the ${tribes[T.parent].title}`:''}</dd></dl>
  <h4>Active blessings</h4>
  <div class="chips2">${keys.length?keys.map(k=>`<span class="bchip" title="From faith, culture and season">${fmtBuff(k,fx[k])}</span>`).join(''):'<span class="empty">None yet.</span>'}</div>
  ${T.race==='elf'?`<p class="mnote">${SEASONS[season()]}: ${SEASON_TEXT[season()]}</p>`:''}
  ${T.bless>step?`<p class="mnote">Blessed: the recent rite is boosting the patron\u2019s gift.</p>`:''}${T.frenzy>step?`<p class="mnote">The horde is in a war-frenzy: +25% damage.</p>`:''}
  <h4>Relations</h4>
  <p>${foes.length?`<span class="warc">At war with ${foes.map(f=>'the '+f.title).join(' and ')}.</span>`:'At peace.'}${al.length?` <span class="allyc">Allied with ${al.map(f=>'the '+f.title).join(' and ')}.</span>`:''}</p>
  ${T.heroes.length?`<h4>Heroes</h4><ul class="plain">${T.heroes.slice(-5).reverse().map(h=>`<li><b>${h.name}</b>, ${h.kills} victories, fell in year ${h.y}</li>`).join('')}</ul>`:''}`;
}
function cxFaith(T,L){
  const rel=T.rel,d=rel.patron,sec=rel.second,fol=units.filter(u=>u.k===0&&tribes[u.tribe].rel===rel).length;
  const seasonNote=d.season>=0?`<p class="mnote">Strongest in ${SEASONS[d.season]}${season()===d.season?' (now: +50% gift)':''}.</p>`:'';
  const next=T.temple?(year()>=T.nextFest?'Soon':`Year ${T.nextFest}`):'Needs a temple';
  return `<div class="godcard">${glyphSVG(d.sym,52)}<div><h4 class="gname">${d.name}, ${d.title}</h4><p class="gdom">${d.dom}</p></div></div>
  <p>${d.desc}</p><div class="chips2">${buffChips(d.buff,1)}</div>${seasonNote}
  <dl><dt>Faith</dt><dd>${rel.name}</dd><dt>Doctrine</dt><dd><b>${rel.doc.name}</b>. ${rel.doc.desc}</dd>
  <dt>Followers</dt><dd>${fol} across ${(n=>n+(n===1?' realm':' realms'))(tribes.filter(t=>t.alive&&t.rel===rel).length)}</dd>
  <dt>Devotion</dt><dd>${Math.round(T.devo)} of 100, scaling every blessing</dd></dl>
  ${sec?`<h4>Second god</h4><div class="godcard">${glyphSVG(sec.sym,36)}<div><b>${sec.name}, ${sec.title}</b><p class="gdom">${sec.dom}. Half of their gift is shared.</p></div></div>`:''}
  <h4>Tenets</h4><ul class="plain">${rel.tenets.map(t=>`<li>${t}</li>`).join('')}</ul>
  <h4>Sacred rite</h4><p><b>${d.rite}</b> \u2014 ${d.ritedesc}</p><p class="mnote">Next celebration: ${next}. Rites raise devotion and grant a blessing for a time${{dwarf:', plus a tribute of stone',elf:', healing everyone and waking new trees',human:', plus a feast and calmer streets',orc:', plus a war-frenzy for the horde'}[T.race]}.</p>
  <h4>Pantheon of the ${L.plural.toLowerCase()}</h4>
  ${PANTHEON[T.race].map(g=>`<div class="pg${g===d?' cur':''}">${glyphSVG(g.sym,30)}<div><b>${g.name}, ${g.title}</b>${g===d?' <span class="tag">patron</span>':''}${g===sec?' <span class="tag">second</span>':''}<p class="gdom">${g.dom}</p><div class="chips2 sm">${buffChips(g.buff,1)}</div></div></div>`).join('')}`;
}
function cxCulture(T,L){
  return `<h4>Values</h4>${T.values.map(v=>`<div class="val"><b>${v.name}</b><p class="gdom">${v.desc}</p><div class="chips2 sm">${buffChips(v.buff,1)}</div></div>`).join('')}
  <h4>Artistic traditions</h4><p>${ART_FORMS[T.race].map(f=>f.n).join(', ')}.</p>
  <p class="mnote">Renown ${T.renown}. Art lifts stability, devotion and diplomacy. Physical works stand on the map, like ${{human:'statues',elf:'living sculptures',dwarf:'rune-pillars',orc:'skull totems'}[T.race]}.</p>
  <h4>Works of art (${T.arts.length})</h4>
  ${T.arts.length?T.arts.map(a=>`<div class="art"><div class="arth"><b>${a.name}</b><span class="stars" aria-label="${a.q} of 5">${stars(a.q)}</span></div>
    <p class="gdom">${a.form} by ${a.creator}, year ${a.year}. ${a.desc}${a.lost?' (Destroyed.)':''}</p>
    ${a.i!=null&&!a.lost?`<button class="btn sm cx-fly" data-i="${a.i}">Show on map</button>`:''}</div>`).join(''):'<p class="empty">No works yet. Artists need a great hall, full stores and peace of mind.</p>'}`;
}
function cxHistory(T){
  const par=T.parent>=0?tribes[T.parent]:null;
  return `<p class="legend">${legendOf(T)}</p>
  ${par?`<p class="mnote">Lineage: the ${par.title}${par.alive?'':' (now fallen)'}.</p>`:''}
  <h4>Chronicle</h4>
  <ol class="log">${T.hist.length?T.hist.slice(0,40).map(l=>`<li><span class="yr">Y${l.y}</span><span style="border-left:3px solid ${css(l.c)};padding-left:8px">${l.m}</span></li>`).join(''):'<li class="empty">Nothing recorded yet.</li>'}</ol>`;
}
function renderCodex(){
  if(!codexT)return;
  const T=codexT,L=RACES[T.race],d=T.rel.patron,body=cxEl('cxBody'),st=body.scrollTop;
  cxEl('cxHead').innerHTML=`<span class="sw3" style="background:${css(T.color)}"></span>
    <div><h3>${L.icon} ${T.title}</h3><p>${d.epi.charAt(0).toUpperCase()+d.epi.slice(1)}${T.alive?'':' (fallen)'} \u00b7 ${T.rel.name}</p></div>
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
cxEl('cxBody').addEventListener('click',e=>{
  const b=e.target.closest('.cx-fly');if(!b)return;
  const i=+b.dataset.i;flyTo(i%W+.5,((i/W)|0)+.5,Math.max(cam.tpz,3*dpr));
  if(window.innerWidth>860)select({i});
});
