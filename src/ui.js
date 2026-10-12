"use strict";
/* ============ Interface: tools, inspector, side panel, input, main loop ============ */
let sel=null,follow=false;
const $=id=>document.getElementById(id);
const inspEl=$('inspect'),inspBody=$('inspBody');
const TASKS={forage:'Gathering food',chop:'Cutting wood',gather:'Collecting fallen branches',mine:'Mining stone',plant:'Planting trees',
  build:'Building',hunt:'Hunting',butcher:'Slaughtering livestock',fight:'Fighting',sleep:'Heading home to sleep'};

function pickAt(p){
  let best=null,bd=.9;
  for(const u of units){if(u.inside)continue;const [x,y]=ipos(u),d=Math.hypot(x-p.x,(y-.5)-p.y);if(d<bd){bd=d;best={u}}}
  for(const b of boats){const [x,y]=ipos(b),d=Math.hypot(x-p.x,y-p.y);if(d<bd+.3){bd=d;best={boat:b}}}
  if(best)return best;
  const x=p.x|0,y=p.y|0;
  for(const [dx,dy] of [[0,0],[0,1],[-1,1],[1,1],[0,2],[-1,0],[1,0]]){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return{i:Y*W+X}}
  return null;
}
function select(s){sel=s;follow=false;inspEl.hidden=!s;if(s)renderInspect()}
function spriteCanvas(s){
  const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const sc=Math.floor(Math.min(60/s.w,60/s.h));x.drawImage(s.c,(64-s.w*sc)/2,(64-s.h*sc)/2,s.w*sc,s.h*sc);return c;
}
const kingLine=T=>`<span class="sw2" style="background:${css(T.color)}"></span>${T.title}`;
const yrs=u=>{const y=Math.floor(u.age/YEAR);return `${y} ${y===1?'year':'years'}`};
function followBtn(u){return u.dead?'':`<button class="btn" id="followBtn" aria-pressed="${follow}">${follow?'Following':'Follow'}</button>`}
function renderInspect(){
  if(!sel)return;
  let html='',sprite=null;
  if(sel.u){
    const u=sel.u;
    if(u.k===0){
      const T=tribes[u.tribe],L=RACES[u.race],g=u.genes,pct=v=>Math.round(v*100)+'%';
      sprite=spr(`p|${u.race}|${g.skin}|${g.hair}|${T.ci}|0`,()=>personSprite(u.race,g.skin,g.hair,T.color,0));
      const doing=u.dead?'Resting in peace':u.inside?'Asleep at home':!adult(u)?'Playing':u.target?(u.target.k===1?(u.task==='butcher'?TASKS.butcher:'Hunting'):'Fighting'):(TASKS[u.task]||'Wandering');
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${u.name}</h3><p>${u.dead?'Has died, ':''}${adult(u)?L.name:L.name+' child'} of the ${T.title}</p></div></div>
      <dl><dt>Age</dt><dd>${yrs(u)}</dd><dt>Doing</dt><dd>${doing}</dd>
        <dt>Health</dt><dd>${Math.max(0,Math.round(u.hp))} of ${Math.round(u.maxhp)}</dd>
        <dt>Generation</dt><dd>${u.gen}${u.parents?`, child of ${u.parents}`:', founder'}</dd>
        <dt>Faith</dt><dd>${T.rel.name}, ${T.rel.patron.dom.toLowerCase()}</dd><dt>Culture</dt><dd>${T.values.map(v=>v.name).join(', ')}</dd><dt>Victories</dt><dd>${u.kills}</dd></dl>
      ${u.traits.length?`<div class="chips">${u.traits.map(t=>`<span title="${TRAITS[t]}">${t}</span>`).join('')}</div>`:''}
      <dl><dt>Skin</dt><dd><span class="sw2" style="background:${css(L.skins[g.skin])}"></span>${L.skinNames[g.skin]}</dd>
        <dt>Hair</dt><dd><span class="sw2" style="background:${css(L.hairs[g.hair])}"></span>${L.hairNames[g.hair]}</dd>
        <dt>Strength</dt><dd>${pct(g.str)}</dd><dt>Vitality</dt><dd>${pct(g.vit)}</dd><dt>Agility</dt><dd>${pct(g.agi)}</dd></dl>
      <div class="row-btns">${followBtn(u)}<button class="btn" id="hearBtn">Hear them speak</button></div>`;
    }else{
      const S=SPECIES[u.sp],own=u.owner>=0?tribes[u.owner]:null;
      sprite=animalSpr(u,0);
      const doing=u.dead?'Gone':u.target?'Hunting':u.mode?'Fleeing':own?'Grazing in the pasture':'Roaming';
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${S.name}${u.sp==='deer'&&u.male?' (buck)':''}</h3><p>${own?`Livestock of the ${own.title}`:S.dom?'Feral, belongs to no one':'Wild animal'}</p></div></div>
      <p class="quote" style="font-style:normal">${S.desc}</p>
      <dl><dt>Age</dt><dd>${adult(u)?yrs(u):'Young'}</dd><dt>Doing</dt><dd>${doing}</dd>
      <dt>Health</dt><dd>${Math.max(0,Math.round(u.hp))} of ${u.maxhp}</dd>
      <dt>Hunger</dt><dd>${u.hunger<400?'Well fed':u.hunger<1000?'Hungry':'Starving'}</dd></dl>
      <div class="row-btns">${followBtn(u)}<button class="btn" id="hearBtn">Hear it</button></div>`;
    }
  }else if(sel.boat){
    const b=sel.boat,T=tribes[b.tribe];
    sprite=boatSprite(b.kind,b.race,b.ci);
    html=`<div class="insp-head"><span id="ispr"></span><div><h3>${b.kind==='fish'?'Fishing boat':'Settler ship'}</h3><p>${b.dead?'Gone':kingLine(T)}</p></div></div>
    <dl>${b.kind==='fish'?`<dt>Work</dt><dd>Brings fish home to the village</dd>`:`<dt>Aboard</dt><dd>${b.pass.map(p=>p.name).join(', ')}</dd><dt>Voyage</dt><dd>${Math.round(b.pi/b.path.length*100)}% of the way to new land</dd>`}</dl>`;
  }else{
    const i=sel.i;
    if(bld[i]<0){html=`<div class="insp-head"><span id="ispr"></span><div><h3>Ruins</h3><p>All that remains of a fallen kingdom</p></div></div>`;sprite=spr('ruin',ruinSprite)}
    else{
      const T=tribes[bld[i]],L=RACES[T.race],ty=btype[i];
      const names={human:['Cottage','Great hall','Chapel','Statue'],elf:['Tree home','Elder tree hall','Moon shrine','Spirit stone'],
        dwarf:['Stone house','Mountain hall','Forge temple','Rune-pillar'],orc:['Hide tent','War lodge','Totem shrine','Skull totem']}[T.race];
      sprite=buildingSprite(T.race,ty,T.ci,T.rel.domain);
      const art=ty===4?T.arts.find(x=>x.i===i):null;
      const fol=units.filter(u=>u.k===0&&tribes[u.tribe].rel===T.rel).length;
      const sleepers=units.filter(u=>u.inside&&u.home===i).length;
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${art?art.name:names[ty]}</h3><p>${kingLine(T)}</p></div></div>
      ${art?`<p class="quote" style="font-style:normal">${art.form} by ${art.creator}, year ${art.year}. ${art.desc} ${stars(art.q)}</p>`:''}${ty===2?`<p class="quote" style="font-style:normal">Sacred to ${T.rel.patron.name}, ${T.rel.patron.title}. ${T.rel.patron.dom}.</p>`:''}<p class="quote">“${T.motto}” they say in greeting.</p>
      <dl><dt>People</dt><dd>${T.pop} ${T.pop===1?L.name.toLowerCase():L.plural.toLowerCase()}${sleepers?`, ${sleepers} asleep here`:''}</dd>
        <dt>Buildings</dt><dd>${T.houses}</dd><dt>Livestock</dt><dd>${T.stock}</dd>
        <dt>Stores</dt><dd>${T.food} food, ${T.mat} ${T.race==='dwarf'?'stone':'timber'}</dd>
        <dt>Faith</dt><dd>${T.rel.name} (${fol} followers)</dd>
        <dt>Founded</dt><dd>Year ${T.founded}${T.parent>=0?` by settlers of the ${tribes[T.parent].title}`:''}</dd></dl>
      <p class="quote" style="font-style:normal">${L.lore}</p><button class="btn" id="codexBtn">Open realm codex</button>`;
    }
  }
  inspBody.innerHTML=html;
  const slot=$('ispr');if(slot&&sprite)slot.replaceWith(spriteCanvas(sprite));
  const cxb=$('codexBtn');if(cxb)cxb.addEventListener('click',()=>{const t=sel&&sel.i!=null&&bld[sel.i]>=0?tribes[bld[sel.i]]:null;if(t)openCodex(t)});
  const fb=$('followBtn');
  if(fb)fb.addEventListener('click',()=>{follow=!follow;if(follow&&cam.tpz<2*dpr)zoomTo(cw/2,ch/2,3*dpr);renderInspect()});
  const hb=$('hearBtn');
  if(hb)hb.addEventListener('click',()=>{audioInit();const u=sel&&sel.u;if(!u)return;if(u.k===0)playAt('speak',.9,0,{race:u.race,child:!adult(u)});else playAt('call',.9,0,u.sp)});
}
$('inspClose').addEventListener('click',()=>select(null));

/* tools */
const TOOLS=[
  {g:'Explore',items:[
    ['inspect','🔍','Inspect','Tap anyone or anything to see who they are: genes, faith, family, and what they sound like.'],
    ['move','✋','Move view','Drag to pan, or use WASD / arrow keys anywhere. Scroll or pinch to zoom.'],
  ]},
  {g:'Peoples',items:RACE_KEYS.map(r=>[r,RACES[r].icon,RACES[r].plural,{
    human:'Tap land to found a human kingdom, or near one to add to it. Adaptable, quick to grow.',
    elf:'Tap land to found an elven realm. Long-lived archers who plant forests.',
    dwarf:'Tap land, ideally highlands near mountains, to found a dwarf hold. Tough miners.',
    orc:'Tap land to found an orc horde. Fierce hunters, always spoiling for war.'}[r]])},
  {g:'Animals',cls:'two',items:SPECIES_KEYS.map(s=>[s,SPECIES[s].icon,SPECIES[s].name,
    `${SPECIES[s].desc} ${SPECIES[s].dom?'Release near a village and they become its livestock.':'Wild.'}`])},
  {g:'Shape the land',items:[
    ['trees','🌳','Forest','Plant forest on grass.'],
    ['raise','⛰️','Raise land','Drag to lift the land. Keep going to build hills and peaks.'],
    ['lower','🕳️','Lower land','Drag to sink the land into lakes and seas.'],
    ['water','🌊','Ocean','Paint ocean. Boats will sail it; anyone standing there drowns.'],
    ['land','🌱','Grassland','Paint fresh grassland. Also heals burnt ground and cools lava.'],
    ['mountain','🏔️','Mountains','Raise a mountain range. Dwarves love them; snowy peaks block travel.'],
  ]},
  {g:'Powers',items:[
    ['rain','🌧️','Rain','Drag to put out fires, cool lava and help forests grow back.'],
    ['fire','🔥','Fire','Drag to start fires. Forests and houses burn fast.'],
    ['lightning','⚡','Lightning','Tap to strike. Kills whatever it hits and sets the ground alight.'],
    ['meteor','☄️','Meteor','Tap to call down a meteor. It leaves a crater of lava.'],
  ]},
];
const HINT={};TOOLS.forEach(g=>g.items.forEach(t=>HINT[t[0]]=t[3]));
const BRUSH=new Set(['raise','lower','water','land','mountain','trees','fire','rain']);
const SPAWNABLE=new Set([...RACE_KEYS,...SPECIES_KEYS]);
let tool='inspect',brushSize=3;
const toolsEl=$('tools');
toolsEl.innerHTML=TOOLS.map(g=>`<div class="group"><h2>${g.g}</h2><div class="grid ${g.cls||''}">${
  g.items.map(t=>`<button class="tool" data-tool="${t[0]}" aria-pressed="${t[0]===tool}" title="${t[3]}"><span class="ic" aria-hidden="true">${t[1]}</span><span>${t[2]}</span></button>`).join('')
}</div></div>`).join('');
toolsEl.addEventListener('click',e=>{const b=e.target.closest('.tool');if(b)setTool(b.dataset.tool)});
function setTool(t){
  tool=t;
  toolsEl.querySelectorAll('.tool').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===t));
  stage.classList.toggle('pan',t==='move');stage.classList.toggle('look',t==='inspect');showHint();
}
const hintEl=$('hint');let toastUntil=0;
function showHint(){if(performance.now()>toastUntil){hintEl.textContent=HINT[tool];hintEl.classList.remove('toast')}}
function toast(m){hintEl.textContent=m;hintEl.classList.add('toast');toastUntil=performance.now()+2500;setTimeout(showHint,2600)}
$('brush').addEventListener('input',e=>brushSize=+e.target.value);

/* speed, time, weather, sound */
let speed=1;const SPS=[0,20,60,180];
const segBtns=document.querySelectorAll('.seg button');
function setSpeed(s){speed=s;segBtns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.speed===s))}
segBtns.forEach(b=>b.addEventListener('click',()=>setSpeed(+b.dataset.speed)));
$('clockBtn').addEventListener('click',()=>{const target=Math.ceil((tod*4+.01))/4;let add=Math.round(((target-tod+1)%1)*DAY);step+=add;updateTimeWeather();toast(`Skipped ahead to ${phaseName().toLowerCase()}.`)});
$('weatherBtn').addEventListener('click',()=>{const i=(WT_KEYS.indexOf(WX.type)+1)%WT_KEYS.length;setWeather(WT_KEYS[i]);toast(`The weather turns: ${WTYPES[WT_KEYS[i]].name.toLowerCase()}.`)});
function soundBtns(){
  $('musicBtn').setAttribute('aria-pressed',AU.music);$('sfxBtn').setAttribute('aria-pressed',AU.sfx);
  $('musicBtn').title=AU.music?'Music on':'Music off';$('sfxBtn').title=AU.sfx?'Sound effects on':'Sound effects off';
}
$('musicBtn').addEventListener('click',()=>{audioInit();setMusic(!AU.music);soundBtns()});
$('sfxBtn').addEventListener('click',()=>{audioInit();setSfx(!AU.sfx);soundBtns()});
soundBtns();
let lastSpeed=1;
document.addEventListener('keydown',e=>{
  audioInit();
  if(e.target.closest&&e.target.closest('input'))return;
  const k=e.key.toLowerCase();
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);e.preventDefault();return}
  if(e.code==='Space'){e.preventDefault();if(speed){lastSpeed=speed;setSpeed(0)}else setSpeed(lastSpeed)}
  else if(k==='+'||k==='=')stepZoom(cw/2,ch/2,1);
  else if(k==='-')stepZoom(cw/2,ch/2,-1);
  else if(k==='0')fitView();
  else if(k==='escape'){select(null);closeCodex()}
});
document.addEventListener('pointerdown',()=>audioInit(),{capture:true});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
$('newWorld').addEventListener('click',()=>{
  genWorld();initFlocks();select(null);closeCodex();cam.fit=fitPz();cam.pz=cam.tpz=Math.max(cam.fit,2*dpr);centerOn(startFocus[0],startFocus[1]);renderPanel(true);
});
$('zin').addEventListener('click',()=>stepZoom(cw/2,ch/2,1));
$('zout').addEventListener('click',()=>stepZoom(cw/2,ch/2,-1));
$('zfit').addEventListener('click',fitView);
const side=$('side');
$('openSide').addEventListener('click',()=>{side.classList.add('open');renderPanel(true)});
$('closeSide').addEventListener('click',()=>side.classList.remove('open'));

/* pointer input with inertia */
const pointers=new Map();let pinch=null,drag=null,hover=null,painting=false,lastPress=0,wheelAcc=0;
function toTile(e){
  const r=cv.getBoundingClientRect(),sx=(e.clientX-r.left)*dpr,sy=(e.clientY-r.top)*dpr;
  return {x:(sx-cam.ox)/(cam.pz*TS),y:(sy-cam.oy)/(cam.pz*TS),sx,sy};
}
function pinchInfo(){
  const [a,b]=[...pointers.values()],r=cv.getBoundingClientRect();
  return {d:Math.hypot(a.x-b.x,a.y-b.y),mx:((a.x+b.x)/2-r.left)*dpr,my:((a.y+b.y)/2-r.top)*dpr};
}
function press(p){
  lastPress=performance.now();
  if(tool==='inspect'){const s=pickAt(p);select(s);if(s&&s.u&&AU.ready){if(s.u.k===0)playAt('speak',.7,0,{race:s.u.race,child:!adult(s.u)});else playAt('call',.7,0,s.u.sp)}}
  else if(SPAWNABLE.has(tool))spawnAt(p,tool);
  else if(tool==='lightning')strike(p);
  else if(tool==='meteor'){if(inb(p.x|0,p.y|0)){effects.push({type:'meteor',x:p.x|0,y:p.y|0,t:0,dur:52});SFXQ.push({t:'boom',x:null,y:null})}}
}
cv.addEventListener('pointerdown',e=>{
  audioInit();
  cv.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  cam.vx=cam.vy=0;cam.flyTo=null;
  if(pointers.size===2){painting=false;drag=null;pinch=pinchInfo();return}
  if(tool==='move'||e.button===1||e.button===2){drag={x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0};follow=false;return}
  painting=true;hover=toTile(e);
  if(!BRUSH.has(tool))press(hover);
});
cv.addEventListener('pointermove',e=>{
  if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  hover=toTile(e);
  if(pinch&&pointers.size===2){
    const n=pinchInfo(),nz=clamp(cam.pz*n.d/pinch.d,cam.fit*.9,maxPz());
    zoomRaw(n.mx,n.my,nz);cam.tpz=nz;cam.ox+=n.mx-pinch.mx;cam.oy+=n.my-pinch.my;pinch=n;follow=false;return;
  }
  if(drag){
    const now=performance.now(),dx=(e.clientX-drag.x)*dpr,dy=(e.clientY-drag.y)*dpr,dtm=Math.max(1,now-drag.t);
    cam.ox+=dx;cam.oy+=dy;
    drag.vx=drag.vx*.6+(dx/dtm)*.4;drag.vy=drag.vy*.6+(dy/dtm)*.4;
    drag.x=e.clientX;drag.y=e.clientY;drag.t=now;return;
  }
  if(painting&&tool!=='meteor'&&tool!=='inspect'&&!BRUSH.has(tool)&&performance.now()-lastPress>180)press(hover);
});
function endPointer(e){
  pointers.delete(e.pointerId);
  if(pointers.size<2&&pinch){pinch=null;if(cam.pz>1)zoomTo(cw/2,ch/2,Math.round(cam.pz))}
  if(pointers.size===0){
    if(drag&&performance.now()-drag.t<80){cam.vx=drag.vx;cam.vy=drag.vy}
    painting=false;drag=null;
  }
}
cv.addEventListener('pointerup',endPointer);
cv.addEventListener('pointercancel',endPointer);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hover=null});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{
  e.preventDefault();wheelAcc+=e.deltaY;
  if(Math.abs(wheelAcc)>=40){const p=toTile(e);stepZoom(p.sx,p.sy,wheelAcc<0?1:-1);wheelAcc=0}
},{passive:false});

/* side panel */
$('kings').addEventListener('click',e=>{
  const b=e.target.closest('.king');if(!b)return;
  const T=tribes[+b.dataset.id];if(!T)return;
  flyTo(T.cx+.5,T.cy+.5,Math.max(cam.tpz,2*dpr));
  if(window.innerWidth>860&&T.hall>=0)select({i:T.hall});else select(null);
  openCodex(T);
  side.classList.remove('open');
});
function renderHeader(){
  $('year').textContent=`Year ${year()} · ${SEASONS[season()]}`;
  $('clockBtn').textContent=`${phaseIcon()} ${phaseName()}`;
  $('weatherBtn').textContent=`${WTYPES[WX.type].ic} ${WTYPES[WX.type].name}`;
}
function renderPanel(force){
  renderHeader();
  const alive=tribes.filter(T=>T.alive);
  let animals=0;for(const k in cnt.sp)animals+=cnt.sp[k];
  $('cPeople').textContent=cnt.people;$('cKings').textContent=alive.length;
  $('cBoats').textContent=boats.length;$('cAnimals').textContent=animals;
  $('races').innerHTML=RACE_KEYS.map(r=>`<span title="${RACES[r].plural}">${RACES[r].icon} <b>${cnt.race[r]||0}</b></span>`).join('');
  if(!force&&window.innerWidth<=860&&!side.classList.contains('open'))return;
  $('fauna').innerHTML=SPECIES_KEYS.filter(s=>cnt.sp[s]).map(s=>`<span title="${SPECIES[s].name}">${SPECIES[s].icon} ${cnt.sp[s]}</span>`).join('')||'<span>No animals</span>';
  alive.sort((a,b)=>b.pop-a.pop);
  $('kings').innerHTML=alive.length?alive.map(T=>{
    const foes=wars.filter(w=>w.a===T.id||w.b===T.id).map(w=>tribes[w.a===T.id?w.b:w.a].name);
    return `<li><button class="king" data-id="${T.id}"><span class="sw" style="background:${css(T.color)}"></span><span class="nm">${RACES[T.race].icon} ${T.title}</span>
      <span class="meta">${T.pop} ${RACES[T.race].plural.toLowerCase()}, ${T.houses} ${T.houses===1?'building':'buildings'}, ${T.stock} livestock${T.fish?`, ${T.fish} boats`:''}</span>
      <span class="faith">${T.rel.name} · ${T.rel.patron.dom}</span>
      ${foes.length?`<span class="war">At war with ${foes.join(' and ')}</span>`:''}${alliesOf(T).length?`<span class="ally">Allied with ${alliesOf(T).map(a=>a.name).join(' and ')}</span>`:''}</button></li>`;
  }).join(''):`<li><p class="empty">No one lives here yet. Pick a people and tap on green land to begin.</p></li>`;
  const fc=new Map();
  for(const T of alive){const v=fc.get(T.rel)||{n:0,k:0};v.n+=T.pop;v.k++;fc.set(T.rel,v)}
  const fl=[...fc.entries()].filter(e=>e[1].n>0).sort((a,b)=>b[1].n-a[1].n);
  $('faiths').innerHTML=fl.length?fl.map(([rel,v])=>`<div class="faithrow"><span class="sw" style="background:${css(DOMAINS[rel.domain].c)};margin-top:0"></span>
    <span title="${rel.patron.dom}">${rel.name} <small style="color:var(--muted)">${rel.doc.name}</small></span><span class="n">${v.n} in ${v.k}</span></div>`).join(''):`<p class="empty">No faiths yet.</p>`;
  if(logDirty||force){
    $('log').innerHTML=logs.slice(0,40).map(l=>`<li><span class="yr">Y${l.y}</span><span style="border-left:3px solid ${css(l.c)};padding-left:8px">${l.m}</span></li>`).join('');
    logDirty=false;
  }
}

/* main loop: fixed-rate simulation, rendering interpolated in between */
let last=performance.now(),acc=0,panelT=0,inspT=0;
function frame(t){
  const dt=Math.min(100,t-last);last=t;
  if(speed>0){
    acc+=dt*SPS[speed]/1000;let n=0;
    while(acc>=1&&n<12){simStep();acc--;n++}
    if(acc>=1)acc=.99;
    alpha=acc;
  }else alpha=1;
  if(painting&&hover&&BRUSH.has(tool))applyBrush(hover,dt);
  updEffects(dt);
  draw(dt);
  panelT+=dt;inspT+=dt;
  if(panelT>700){panelT=0;renderPanel(false)}
  if(inspT>450){inspT=0;if(sel&&!inspEl.hidden)renderInspect()}
  if(codexOpen()&&frameN%70===0)renderCodex();
  requestAnimationFrame(frame);
}
genWorld();initFlocks();resize();setTool('inspect');renderPanel(true);
requestAnimationFrame(frame);
