"use strict";
/* ============ Interface: tools, inspector, side panel, input, main loop ============ */
let sel=null,follow=false;
const $=id=>document.getElementById(id);
const inspEl=$('inspect'),inspBody=$('inspBody');
const TASKS={forage:'Gathering food',chop:'Cutting wood',gather:'Collecting fallen branches',mine:'Mining stone',plant:'Planting trees',
  build:'Building',hunt:'Hunting',butcher:'Slaughtering livestock',fight:'Fighting',sleep:'Heading home to sleep',
  train:'Training with weapons',teach:'Teaching the young',pray:'Praying at the temple',guard:'On guard duty'};

function pickAt(p){
  let best=null,bd=.9;
  for(const u of units){if(u.inside)continue;const [x,y]=ipos(u),d=Math.hypot(x-p.x,(y-.5)-p.y);if(d<bd){bd=d;best={u}}}
  for(const b of boats){const [x,y]=ipos(b),d=Math.hypot(x-p.x,y-p.y);if(d<bd+.3){bd=d;best={boat:b}}}
  if(best)return best;
  const x=p.x|0,y=p.y|0;
  for(const [dx,dy] of [[0,0],[0,1],[-1,1],[1,1],[0,2],[-1,0],[1,0]]){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return{i:Y*W+X}}
  return inb(x,y)?{t:y*W+x}:null;
}
function tribeUnder(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return null;
  const o=own[y*W+x];if(o>=0&&tribes[o]&&tribes[o].alive)return tribes[o];
  let T=null,bd=36;for(const t of tribes)if(t.alive)for(const H of t.towns){const d=(H.x-x)**2+(H.y-y)**2;if(d<bd){bd=d;T=t}}
  return T;
}
function select(s){sel=s;follow=false;inspEl.hidden=!s;if(s)renderInspect()}
function spriteCanvas(s){
  const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const sc=Math.floor(Math.min(60/s.w,60/s.h));x.drawImage(s.c,(64-s.w*sc)/2,(64-s.h*sc)/2,s.w*sc,s.h*sc);return c;
}
const kingLine=T=>`<span class="sw2" style="background:${css(T.color)}"></span>${T.title}`;
const yrs=u=>{const y=Math.floor(u.age/YEAR);return `${y} ${y===1?'year':'years'}`};
function followBtn(u){
  if(!u.dead)return `<button class="btn" id="followBtn" aria-pressed="${follow}">${follow?'Following':'Follow'}</button>`;
  const h=u.k===0?heirOf(u):null;
  return h?`<button class="btn primary" id="heirBtn">Follow ${h.kin?'':'their child, '}${esc(h.u.name)}${h.kin?` of the ${esc(tribes[h.u.tribe].title)}`:''}</button>`:'';
}
/* a life story goes on: the oldest living child, or else someone from the same kingdom */
function heirOf(u){
  let best=null;
  for(const v of units)if(v.k===0&&!v.dead&&(v.pa===u.id||v.pb===u.id)&&(!best||v.age>best.age))best=v;
  if(best)return{u:best,kin:false};
  for(const v of units){
    if(v.k!==0||v.dead||v.tribe!==u.tribe||!adult(v))continue;
    if((v.town|0)===(u.town|0))return{u:v,kin:true};
    best=best||v;
  }
  return best?{u:best,kin:true}:null;
}
function renderInspect(){
  if(!sel)return;
  let html='',sprite=null;
  if(sel.u){
    const u=sel.u;
    if(u.k===0){
      const T=tribes[u.tribe],L=RACES[u.race],g=u.genes,pct=v=>Math.round(v*100)+'%';
      sprite=spr(`p|${u.race}|${g.skin}|${g.hair}|${T.ci}|0|${adult(u)?u.job||'':''}`,()=>personSprite(u.race,g.skin,g.hair,T.color,0,adult(u)?u.job:null));
      const doing=u.dead?'Resting in peace':u.inside?'Asleep at home':!adult(u)?'Playing':u.target?(u.target.k===1?(u.task==='butcher'?TASKS.butcher:'Hunting'):'Fighting'):(TASKS[u.task]||'Wandering');
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${u.name}</h3><p>${u.dead?'Has died, ':''}${adult(u)?L.name:L.name+' child'} of the ${T.title}</p></div></div>
      <dl><dt>Age</dt><dd>${yrs(u)}</dd><dt>Job</dt><dd>${u.job&&adult(u)?`<span title="${JOBS[u.job].d}">${JOBS[u.job].ic} ${JOBS[u.job].n}</span>`:adult(u)?'Looking for work':'Child'}</dd><dt>Doing</dt><dd>${doing}</dd>
        <dt>Health</dt><dd>${Math.max(0,Math.round(u.hp))} of ${Math.round(u.maxhp)}</dd>
        <dt>Generation</dt><dd>${u.gen}${u.parents?`, child of ${u.parents}`:', founder'}</dd>
        <dt>Faith</dt><dd>${T.rel.name}, ${T.rel.patron.dom.toLowerCase()}</dd><dt>Home</dt><dd>${esc(townOf(u,T).name)}</dd><dt>Culture</dt><dd>${esc(cultureName(T))}</dd><dt>Speaks</dt><dd>${esc(LANG[u.race])}</dd><dt>Victories</dt><dd>${u.kills}</dd></dl>
      ${u.traits.length?`<div class="chips">${u.traits.map(t=>`<span title="${TRAIT_INFO[t]}">${t}</span>`).join('')}</div>`:''}
      <dl><dt>Skin</dt><dd><span class="sw2" style="background:${css(L.skins[g.skin])}"></span>${L.skinNames[g.skin]}</dd>
        <dt>Hair</dt><dd><span class="sw2" style="background:${css(L.hairs[g.hair])}"></span>${L.hairNames[g.hair]}</dd>
        <dt>Strength</dt><dd>${pct(g.str)}</dd><dt>Vitality</dt><dd>${pct(g.vit)}</dd><dt>Agility</dt><dd>${pct(g.agi)}</dd></dl>
      <div class="row-btns">${followBtn(u)}<button class="btn" id="hearBtn">Hear them speak</button></div>`;
    }else{
      const S=SPECIES[u.sp],own=u.owner>=0?tribes[u.owner]:null;
      sprite=animalSpr(u,0);
      const doing=u.dead?'Gone':u.target?'Hunting':u.mode?'Fleeing':own?'Grazing in the pasture':'Roaming';
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${S.name}${u.sp==='deer'&&u.male?' (buck)':''}</h3><p>${own?`Livestock of the ${own.title}`:S.monster?'A monster, hostile to all life':S.dom?'Feral, belongs to no one':'Wild animal'}</p></div></div>
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
  }else if(sel.t!=null){
    const i=sel.t,b=bio(hgt[i]),BN=['Deep ocean','Shallow sea','Sand','Grassland','Highland','Mountain','Snow peak'][b];
    const B=bm[i]?BIOMES[bm[i]]:null,O=ore[i]?ORES[ore[i]]:null,ow=own[i]>=0?tribes[own[i]]:null;
    const col=O?O.c:B&&B.c?B.c:[[28,70,130],[70,150,190],[226,210,152],[100,170,76],[96,132,70],[130,126,120],[236,240,248]][b];
    const g=G(10,10);gr(g,0,0,10,10,col);if(tree[i])gr(g,3,2,4,5,[40,110,56]);sprite=bake(g);
    html=`<div class="insp-head"><span id="ispr"></span><div><h3>${B&&B.name?B.name:BN}</h3><p>${BN}${tree[i]?', with trees':''}${lava[i]?', molten':''}</p></div></div>
      ${B&&B.desc?`<p class="quote" style="font-style:normal">${B.desc}</p>`:''}
      ${O?`<p class="quote" style="font-style:normal"><b>${O.name}</b> deposit, about ${oreAmt[i]} left. ${O.desc}</p>`:''}
      <dl><dt>Domain</dt><dd>${ow?kingLine(ow)+` (${sharePct(ow)}% of the land)`:b>=2?'Unclaimed':'Open water'}</dd></dl>${ow?'<button class="btn" id="codexBtn">Open realm codex</button>':''}`;
  }else{
    const i=sel.i;
    if(bld[i]<0){html=`<div class="insp-head"><span id="ispr"></span><div><h3>Ruins</h3><p>All that remains of a fallen kingdom</p></div></div>`;sprite=spr('ruin',ruinSprite)}
    else{
      const T=tribes[bld[i]],L=RACES[T.race],ty=btype[i];
      const names={human:['Cottage','Great hall','Chapel','Statue'],elf:['Tree home','Elder tree hall','Moon shrine','Spirit stone'],
        dwarf:['Stone house','Mountain hall','Forge temple','Rune-pillar'],orc:['Hide tent','War lodge','Totem shrine','Skull totem']}[RB(T.race)];
      sprite=buildingSprite(T.race,ty,T.ci,T.rel.domain,btier[i]);
      const art=ty===4?T.arts.find(x=>x.i===i):null;
      const fol=units.filter(u=>u.k===0&&tribes[u.tribe].rel===T.rel).length;
      const sleepers=units.filter(u=>u.inside&&u.home===i).length;
      html=`<div class="insp-head"><span id="ispr"></span><div><h3>${art?art.name:names[ty]}</h3><p>${kingLine(T)}</p></div></div>
      ${art?`<p class="quote" style="font-style:normal">${art.form} by ${art.creator}, year ${art.year}. ${art.desc} ${stars(art.q)}</p>`:''}${ty===2?`<p class="quote" style="font-style:normal">Sacred to ${T.rel.patron.name}, ${T.rel.patron.title}. ${T.rel.patron.dom}.</p>`:''}<p class="quote">“${T.motto}” they say in greeting.</p>
      <dl><dt>People</dt><dd>${T.pop} ${T.pop===1?L.name.toLowerCase():L.plural.toLowerCase()}${sleepers?`, ${sleepers} asleep here`:''}</dd>
        <dt>Buildings</dt><dd>${T.houses}</dd><dt>Livestock</dt><dd>${T.stock}</dd>
        <dt>Stores</dt><dd>${T.food} food, ${T.mat} ${T.race==='dwarf'?'stone':'timber'}</dd>
        <dt>Faith</dt><dd>${T.rel.name} (${fol} followers)</dd>
        <dt>Built of</dt><dd>${ty<3?TIER_MAT[btier[i]]:'stone'}</dd>
        <dt>Age</dt><dd>${AGE_NAME[T.age]}</dd><dt>Domain</dt><dd>${sharePct(T)}% of the land</dd>
        <dt>Founded</dt><dd>Year ${T.founded}${T.parent>=0?` by settlers of the ${tribes[T.parent].title}`:''}</dd></dl>
      <p class="quote" style="font-style:normal">${L.lore}</p><button class="btn" id="codexBtn">Open realm codex</button>`;
    }
  }
  inspBody.innerHTML=html;
  const slot=$('ispr');if(slot&&sprite)slot.replaceWith(spriteCanvas(sprite));
  const cxb=$('codexBtn');if(cxb)cxb.addEventListener('click',()=>{const t=sel&&sel.i!=null&&bld[sel.i]>=0?tribes[bld[sel.i]]:sel&&sel.t!=null&&own[sel.t]>=0?tribes[own[sel.t]]:null;if(t)openCodex(t)});
  const fb=$('followBtn');
  if(fb)fb.addEventListener('click',()=>{follow=!follow;if(follow&&cam.tpz<2*dpr)zoomTo(cw/2,ch/2,3*dpr);renderInspect()});
  const hr=$('heirBtn');
  if(hr)hr.addEventListener('click',()=>{const h=sel&&sel.u&&heirOf(sel.u);if(!h)return;select({u:h.u});follow=true;renderInspect()});
  const hb=$('hearBtn');
  if(hb)hb.addEventListener('click',()=>{audioInit();const u=sel&&sel.u;if(!u)return;if(u.k===0)playAt('speak',.9,0,{race:u.race,child:!adult(u)});else playAt('call',.9,0,u.sp)});
}
$('inspClose').addEventListener('click',()=>select(null));

/* ---------- tray: six tabs of powers, drawn in the style of a god-game toolbox ---------- */
function iconCanvas(sp,size=48){
  const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const raw=Math.min((size-6)/sp.w,(size-6)/sp.h),sc=raw>=2?Math.floor(raw):raw;
  x.drawImage(sp.c,Math.round((size-sp.w*sc)/2),Math.round((size-sp.h*sc)/2),Math.round(sp.w*sc),Math.round(sp.h*sc));return c;
}
/* small hand-drawn pixel icons for the weapons */
const WICON={
  book:()=>{const g=G(16,12),cv=[150,52,44],cl=[178,66,54],pg=[244,236,216],pl=[252,248,232],ln=[160,148,126];
    gr(g,0,1,8,11,cv);gr(g,8,1,8,11,cl);gr(g,1,1,6,9,pg);gr(g,9,1,6,9,pl);for(let y=3;y<9;y+=2){gr(g,2,y,4,1,ln);gr(g,10,y,4,1,ln)}
    gr(g,7,0,2,12,[108,34,30]);gp(g,3,10,CL.gold);gp(g,12,10,CL.gold);gr(g,12,0,1,4,CL.red);return bake(g)},
  grenade:()=>{const g=G(12,13),o=[96,112,58],d=[62,78,40],l=[140,158,88];
    gr(g,5,0,3,1,CL.steel);gp(g,8,1,CL.steelL);gr(g,4,1,1,2,CL.steelD);gr(g,5,2,3,1,CL.steelD);
    gell(g,6,8,4.6,4.8,o);gr(g,3,7,6,1,d);gr(g,2,9,8,1,d);gr(g,4,5,4,1,d);gp(g,4,6,l);gp(g,5,5,l);gp(g,3,8,l);gr(g,5,3,3,1,CL.stoneD);return bake(g)},
  molotov:()=>{const g=G(12,15);
    gp(g,6,0,CL.fire1);gr(g,5,1,3,2,CL.fire2);gr(g,5,2,3,1,CL.fire3);gp(g,6,1,CL.fire1);
    gr(g,5,3,3,1,[230,210,170]);gr(g,5,4,3,3,CL.glass);gr(g,3,7,7,6,[110,200,150]);gr(g,3,7,1,6,[160,230,190]);gr(g,3,12,7,1,[60,130,90]);
    gr(g,4,8,5,3,[238,226,190]);gp(g,5,9,CL.red);gp(g,7,9,CL.red);return bake(g)},
  antimatter:()=>{const g=G(14,14);gell(g,7,7,6.6,6.6,[170,90,240]);gell(g,7,7,5.4,5.4,[18,6,32]);gell(g,7,7,3.2,3.2,[2,0,8]);
    gp(g,3,3,[240,200,255]);gp(g,10,4,[240,200,255]);gp(g,4,10,[200,140,255]);gp(g,10,10,[240,200,255]);gp(g,7,0,[255,255,255]);return bake(g)},
  laser:()=>{const g=G(16,14);for(let k=0;k<14;k++){gr(g,k,13-k-1,3,2,[255,70,70]);gr(g,k,13-k,2,1,[255,255,255])}
    gr(g,0,12,3,2,CL.steelD);gr(g,0,11,2,1,CL.steel);gp(g,13,0,[255,255,255]);gp(g,15,2,[255,200,200]);return bake(g)},
  nuke:()=>{const g=G(14,14);
    gmap(g,0,0,["...oooooo...","..oyyyyyyo..",".oyyOOOOyyo.",".oyOOOOOOyo.","..oyyOOyyo..","....oOOo....",".....OO.....",".....OO.....","....OOOO....","...OOOOOO...","..oooooooo.."],{o:[200,90,40],y:[255,224,110],O:[255,150,50]});
    gr(g,3,12,6,1,[90,60,40]);return bake(g)},
  tsar:()=>{const g=G(16,16);
    gmap(g,0,0,["....oooooooo....","..ooyyyyyyyyoo..",".oyywwwwwwwwyyo.",".oywwwwwwwwwwyo.","oyywwwoOOowwwyyo",".oywwOOOOOOwwyo.","..oyywwOOwwyyo..","....oyywwyyo....","......oWWo......","......oWWo......",".....oWWWWo.....","....oWWWWWWo....","...oWWWWWWWWo...","..oooooooooooo.."],{o:[190,70,36],y:[255,214,96],w:[255,250,214],O:[255,120,40],W:[255,200,120]});
    return bake(g)},
};
const TABS=[
  {ic:'🏔️',name:'World shaping',items:[
    ['raise','⛰️','Raise land','Drag to lift the land. Keep going to build hills and peaks.'],
    ['lower','🕳️','Lower land','Drag to sink the land into lakes and seas.'],
    ['mountain','🏔️','Mountains','Raise a mountain range. Dwarves love them; snowy peaks block travel.'],
    ['hills','🏞️','Hills','Paint rolling highland. Pines grow here and it is easy to build on.'],
    ['snowpeak','🗻','Snow peaks','Paint frozen peaks. Nothing can walk or build on them.'],
    ['land','🌱','Plain soil','Paint plain soil, the meadow where villages thrive. Also heals burnt ground, cools lava and clears biomes.'],
    ['forestsoil','🌲','Forest soil','Paint dark forest soil. Trees grow thick and fast here.'],
    ['trees','🌳','Plant trees','Plant trees on fertile ground, in whatever style the local biome grows.'],
    ['sand','🏖️','Sand','Paint beach sand.'],
    ['shallow','🏝️','Shallow sea','Paint shallow water. Crabs and turtles wade here; boats still sail it.'],
    ['water','🌊','Sea','Paint ocean. Boats will sail it; anyone standing there drowns.'],
    ['deep','🔵','Deep ocean','Paint the deep sea.'],
  ]},
  {ic:'🐾',name:'Creatures',items:[
    ...RACE_KEYS.map(r=>[r,{race:r},RACES[r].plural,RACES[r].tip?RACES[r].tip+' Tap inside another people\u2019s kingdom to send settlers to live among them.':{
      human:'Tap land to found a human kingdom, or near one to add to it. Adaptable, quick to grow.',
      elf:'Tap land to found an elven realm. Long-lived archers who plant forests.',
      dwarf:'Tap land, ideally highlands near mountains, to found a dwarf hold. Tough miners.',
      orc:'Tap land to found an orc horde. Fierce hunters, always spoiling for war.'}[r]+' Tap inside another people’s kingdom to send settlers to live among them.']),
    ...SPECIES_KEYS.map(s=>[s,{sp:s},SPECIES[s].name,
      `${SPECIES[s].desc} ${SPECIES[s].monster?'Hostile to everything alive.':SPECIES[s].dom?'Release near a village and they become its livestock.':'Wild.'}`]),
  ]},
  {ic:'🕊️',name:'Diplomacy & Noosphere',items:[
    ['reg_kingdoms','🏰','All kingdoms','See every kingdom and its villages, and rename them.'],
    ['reg_faiths','🛐','All religions','See every faith and its patron god, and rename them.'],
    ['reg_cultures','🎭','All cultures','See every culture and its values, and rename them.'],
    ['reg_langs','🗣️','All languages','Hear every language and rename it.'],
    ['peace','🕊️','Peace','Tap a kingdom to end every war it is fighting.'],
    ['war','⚔️','Declare war','Tap the aggressor, then tap the kingdom it should attack.'],
    ['alliance','🤝','Alliance','Tap one kingdom, then another, to bind them in an alliance. Ends any war between them.'],
    ['breakpact','💔','Break pacts','Tap a kingdom to cancel all of its alliances.'],
    ['inspire','🎨','Inspire','Tap a kingdom: artists create a work of art at once, and devotion and calm rise.'],
    ['enlighten','💡','Enlighten','Tap a kingdom to hand it the knowledge of the next age: stone, bronze, iron, steel, gold.'],
    ['dbless','🙏','Bless','Tap a kingdom: heals its people, lifts stability and devotion and feeds the hungry.'],
    ['dcurse','😈','Curse','Tap a kingdom: stability and devotion plummet and stores are spoiled.'],
    ['revolt','🔥','Spark revolt','Tap a restless kingdom and part of it breaks away to found a rival realm.'],
    ['missionary','📿','Missionary','Tap a kingdom to convert it to the faith of the nearest temple of its people.'],
    ['gift','🎁','Gift','Tap a kingdom to send it food and timber.'],
    ['colonize','⛵','Send settlers','Tap a kingdom: settlers march or sail out to found a new village of the same kingdom.'],
  ]},
  {ic:'🌿',name:'Nature & Disasters',items:[
    ...Array.from({length:BM.CORRUPT-BM.SAV+1},(_,k)=>BM.SAV+k).map(b=>['seed_'+BIOMES[b].k,BIOMES[b].icon,BIOMES[b].name+' seeds','Paint '+BIOMES[b].name.toLowerCase()+' on grass and hills, with its own trees and grass. '+BIOMES[b].desc]),
    ...[ORE.STONE,ORE.COPPER,ORE.IRON,ORE.COAL,ORE.SILVER,ORE.GOLD,ORE.GEMS].map(o=>['ore_'+ORES[o].k,ORES[o].icon,ORES[o].name+' ore','Paint '+ORES[o].name.toLowerCase()+' deposits on land. '+ORES[o].desc+' Kingdoms mine them to advance their metallurgy.']),
    ['rain','🌧️','Rain','Drag to put out fires, cool lava and help forests grow back.'],
    ['lightning','⚡','Lightning','Tap to strike. Kills whatever it hits and sets the ground alight.'],
    ['fire','🔥','Fire','Drag to start fires. Forests and houses burn fast.'],
    ['earthquake','🏚️','Earthquake','Tap to shake the ground: buildings collapse and the land buckles.'],
    ['volcano','🌋','Volcano','Tap to raise a volcano that spews lava for years.'],
    ['flood','💧','Flood','Tap to drown the land in a great flood.'],
    ['plague','🦠','Plague','Tap near a kingdom: a plague sweeps it and some of the dead rise as zombies.'],
    ...FAUNA_ITEMS.nature,
  ]},
  {ic:'💥',name:'Chaos',items:[
    ['meteor','☄️','Meteor','Tap to call down a meteor. It leaves a crater of lava.'],
    ['grenade',WICON.grenade,'Grenade','Tap to throw a grenade: a small blast.'],
    ['bomb','💣','Bomb','Tap to drop a bomb. A big crater and fires.'],
    ['molotov',WICON.molotov,'Molotov','Tap to hurl a firebomb: no crater, but fire everywhere.'],
    ['laser',WICON.laser,'Laser beam','Tap to fire an orbital laser. It slices a long line through everything.'],
    ['nuke',WICON.nuke,'Nuke','Tap for a nuclear bomb: huge blast and a wasteland of fallout.'],
    ['tsar',WICON.tsar,'Tsar bomb','Tap for the biggest bomb ever built. Expect a very different map.'],
    ['antimatter',WICON.antimatter,'Antimatter','Tap to annihilate everything in a wide circle, leaving only a deep pit.'],
    ['tornado','🌪️','Tornado','Tap to start a tornado that wanders for a while, flinging creatures and tearing up trees and homes.'],
    ['blackhole','⚫','Black hole','Tap to open a black hole that drags in everything nearby, then collapses into a pit.'],
    ['cluster','💥','Cluster bomb','Tap to scatter a string of small blasts across the area.'],
    ['shower','🌌','Meteor shower','Tap to bring down a shower of meteors around the spot.'],
    ['tstorm','⛈️','Thunderstorm','Tap to park a thunderstorm overhead. Lightning strikes again and again.'],
    ['acid','☣️','Acid rain','Tap for acid rain: it hurts every living thing, kills trees, eats homes and leaves wasteland.'],
    ...FAUNA_ITEMS.chaos,
  ]},
  {ic:'✨',name:'Wonders & Oddities',items:[
    ['monolith',()=>monolithSprite(),'Monolith','Place a black monolith anywhere. Every 10 seconds its beam turns any animal or monster nearby into a brand-new sapient people, with its own kingdom, language and faith. Tap it again to remove it.'],
    ['w_wish','🌠','Wishing star','Tap for a surprise. Anything can happen: a dragon, a rain of gold, a meteor shower, the dead…'],
    ['w_elixir','⚗️','Elixir of life','Splash people with an elixir: they never grow old and are fully healed.'],
    ['w_giant','🧪','Giant potion','Splash people to make them towering giants with triple health.'],
    ['w_tiny','🍄','Shrink mushroom','Splash people to shrink them: quick, but fragile.'],
    ['w_bless','😇','Halo','Splash people with a halo: they heal steadily.'],
    ['w_curse','☠️','Hex','Splash people with a hex: they slowly waste away.'],
    ['w_mad','🤪','Madness','Splash people with madness: they attack anyone nearby.'],
    ['w_hero','🎖️','Hero’s mantle','Splash people to make them mighty, brave heroes.'],
    ['w_fountain','⛲','Fountain of youth','Heals everything nearby, turns back the years and lifts curses.'],
    ['w_love','💞','Love potion','Tap near two adults and they will have children.'],
    ['w_mutate','🧬','Mutation','Splash people to scramble their genes and give them a new trait.'],
    ['w_portal','🌀','Portal','Splash people to teleport them to a random place.'],
    ['w_midas','🪙','Midas touch','Turns the trees around the tap into gold ore.'],
    ['w_lush','🌸','Garden blessing','Turns the land to a flower meadow and heals everything in it.'],
    ['w_chest','🎁','Treasure chest','Leaves a deposit of gold, silver or gems at the tap.'],
    ['w_feast','🎉','Feast','Tap a kingdom to hold a festival at once: devotion, blessings and rites.'],
    ['w_freeze','🧊','Freeze','Freezes every creature nearby solid for a while.'],
    ['w_shield','🛡️','Divine shield','Every creature nearby is untouchable for a while.'],
    ['w_haste','💨','Haste','Every creature nearby moves much faster for a while.'],
    ['w_aging','👴','Age blast','Every creature nearby grows many years older at once.'],
    ['w_clone','👯','Cloning','Makes an exact copy of each creature or person nearby.'],
    ['w_charm','💘','Charm','Animals and monsters nearby come to serve the closest kingdom. Charmed monsters fight its enemies.'],
    ['w_time','⏳','Hourglass','Tap to let a whole year pass in a blink.'],
    ...FAUNA_ITEMS.wonders,
  ]},
];
const PINNED=[
  ['inspect','🔍','Inspect','Tap anyone or anything to see who they are: genes, faith, family, what the ground holds, and who owns it.'],
  ['move','✋','Move view','Drag to pan, or use WASD / arrow keys anywhere. Scroll or pinch to zoom.'],
  ['chronicle',WICON.book,'Chronicle','Open the Chronicle: every great event of the world, year by year.'],
];
const HINT={},NAMES={};
[...TABS.flatMap(t=>t.items),...PINNED].forEach(t=>{HINT[t[0]]=t[3];NAMES[t[0]]=t[2]});
const BRUSH=new Set(Object.keys(BRUSHFN));
const SPAWNABLE=new Set([...RACE_KEYS,...SPECIES_KEYS]);
const REPEAT=new Set([...SPAWNABLE,'lightning']);
let tool='inspect',brushSize=3,tab=0;
const trayTabs=$('trayTabs'),trayGrid=$('trayGrid'),trayPin=$('trayPin'),trayName=$('trayName');
function mkTile(t){
  const b=document.createElement('button');b.className='tile';b.dataset.tool=t[0];b.setAttribute('aria-pressed',t[0]===tool);b.setAttribute('aria-label',t[2]);b.title=t[2];
  const ic=t[1];
  if(typeof ic==='function')b.appendChild(iconCanvas(ic()));
  else if(ic&&ic.sp)b.appendChild(iconCanvas(animalSprite(ic.sp,0,0,true,null)));
  else if(ic&&ic.race)b.appendChild(iconCanvas(personSprite(ic.race,0,0,KCOL[0],0)));
  else{const s=document.createElement('span');s.className='emo';s.textContent=ic;b.appendChild(s)}
  return b;
}
trayTabs.insertAdjacentHTML('afterbegin',TABS.map((t,k)=>`<button class="tab" role="tab" data-tab="${k}" aria-selected="${k===tab}" title="${t.name} (${k+1})"><span aria-hidden="true">${t.ic}</span><span class="sr">${t.name}</span></button>`).join(''));
const panes=TABS.map((t,k)=>{
  const d=document.createElement('div');d.className='pane';d.hidden=k!==tab;d.setAttribute('role','tabpanel');
  t.items.forEach(it=>d.appendChild(mkTile(it)));trayGrid.appendChild(d);return d;
});
PINNED.forEach(it=>trayPin.appendChild(mkTile(it)));
function showTab(k){
  tab=k;
  trayTabs.querySelectorAll('.tab').forEach((b,i)=>b.setAttribute('aria-selected',i===k));
  panes.forEach((p,i)=>p.hidden=i!==k);trayGrid.scrollLeft=0;trayName.textContent=TABS[k].name;
}
showTab(tab);
trayTabs.addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)showTab(+b.dataset.tab)});
const trayEl=$('tray');
trayEl.addEventListener('click',e=>{
  const b=e.target.closest('.tile');if(!b)return;const id=b.dataset.tool;
  if(id==='chronicle'){chronOpen?closeChron():openChron();return}
  if(id.startsWith('reg_')){openRegistry(id.slice(4));return}
  setTool(id);
});
trayEl.addEventListener('mouseover',e=>{const b=e.target.closest('.tile');if(b&&performance.now()>toastUntil){hintEl.textContent=`${NAMES[b.dataset.tool]}: ${HINT[b.dataset.tool]}`;hintEl.classList.remove('toast')}});
trayEl.addEventListener('mouseout',e=>{if(e.target.closest('.tile'))showHint()});
function setTool(t){
  tool=t;dipPending=null;
  trayEl.querySelectorAll('.tile').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===t));
  stage.classList.toggle('pan',t==='move');stage.classList.toggle('look',t==='inspect');showHint();
}
const hintEl=$('hint');let toastUntil=0;
function showHint(){if(performance.now()>toastUntil){hintEl.textContent=`${NAMES[tool]}: ${HINT[tool]}`;hintEl.classList.remove('toast')}}
function toast(m){hintEl.textContent=m;hintEl.classList.add('toast');toastUntil=performance.now()+2800;setTimeout(showHint,2900)}
$('brush').addEventListener('input',e=>brushSize=+e.target.value);

/* speed, time, weather, sound */
let speed=1,stepMs=2;const SPS=[0,20,60,180],SIM_BUDGET=10;
const segBtns=document.querySelectorAll('.seg button');
function setSpeed(s){speed=s;segBtns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.speed===s))}
segBtns.forEach(b=>b.addEventListener('click',()=>setSpeed(+b.dataset.speed)));
$('clockBtn').addEventListener('click',()=>{const target=Math.ceil((tod*4+.01))/4;let add=Math.round(((target-tod+1)%1)*DAY);step+=add;updateTimeWeather();toast(`Skipped ahead to ${phaseName().toLowerCase()}.`)});
$('weatherBtn').addEventListener('click',()=>{const i=(WT_KEYS.indexOf(WX.type)+1)%WT_KEYS.length;setWeather(WT_KEYS[i]);toast(`The weather turns: ${WTYPES[WT_KEYS[i]].name.toLowerCase()}.`)});
$('seasonBtn').addEventListener('click',()=>{
  seasonLock=seasonLock>=3?-1:seasonLock+1;
  toast(seasonLock<0?'The seasons turn with the years again.':`The world is held in ${SEASONS[seasonLock].toLowerCase()}. ${SEASON_TEXT[seasonLock]}`);
  for(const T of tribes)if(T.alive)T.fx=computeFx(T);renderHeader();
});
$('domainBtn').addEventListener('click',()=>{showDomains=!showDomains;if(showDomains)ovDirty=true;renderHeader();toast(showDomains?'Showing each kingdom\u2019s domain.':'Domains hidden.')});
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
  else if(k==='escape'){select(null);closePanels();closeWelcome();closeWorldPop();dipPending=null}
  else if(e.key==='?'||(k==='/'&&e.shiftKey))helpEl.hidden?openHelp():closeHelp();
  else if(k==='c')chronOpen?closeChron():openChron();
  else if(k>='1'&&k<='6')showTab(+k-1);
});
document.addEventListener('pointerdown',()=>audioInit(),{capture:true});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
/* the world panel: seed, save, load, and a new world only from inside it, so one stray click can't erase a world */
const worldPop=$('worldPop'),worldBtn=$('worldBtn');
function openWorldPop(){
  $('seedNow').textContent=worldSeed;worldPop.hidden=false;worldBtn.setAttribute('aria-expanded','true');
  const r=worldBtn.getBoundingClientRect();
  worldPop.style.top=`${Math.round(r.bottom+6)}px`;
  worldPop.style.left=`${Math.round(clamp(r.right-worldPop.offsetWidth,8,window.innerWidth-worldPop.offsetWidth-8))}px`;
  $('saveBtn').focus();
}
function closeWorldPop(){
  if(worldPop.hidden)return;
  const had=worldPop.contains(document.activeElement);
  worldPop.hidden=true;worldBtn.setAttribute('aria-expanded','false');if(had)worldBtn.focus();
}
worldPop.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeWorldPop()}});
worldBtn.addEventListener('click',()=>worldPop.hidden?openWorldPop():closeWorldPop());
document.addEventListener('pointerdown',e=>{if(!worldPop.hidden&&!worldPop.contains(e.target)&&!worldBtn.contains(e.target))closeWorldPop()});
$('seedCopy').addEventListener('click',()=>{
  try{navigator.clipboard.writeText(worldSeed).then(()=>toast(`Seed ${worldSeed} copied.`),()=>toast(`The seed is ${worldSeed}.`))}catch(e){toast(`The seed is ${worldSeed}.`)}
});
$('seedIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('newWorld').click()});
/* what every fresh or loaded world needs from the interface */
function afterWorld(){
  initFlocks();select(null);closePanels();dipPending=null;follow=false;
  cam.fit=fitPz();cam.vx=cam.vy=0;cam.flyTo=null;renderPanel(true);warmSprites();
}
$('newWorld').addEventListener('click',()=>{
  genWorld($('seedIn').value);syncRaceTiles(new Set());afterWorld();
  cam.pz=cam.tpz=Math.max(cam.fit,2*dpr);centerOn(startFocus[0],startFocus[1]);
  $('seedIn').value='';closeWorldPop();toast(`A new world rises. Its seed is ${worldSeed}.`);
});

/* first-run card and help */
const welcomeEl=$('welcome'),helpEl=$('help');
function closeWelcome(){welcomeEl.hidden=true}
$('welcomeGo').addEventListener('click',closeWelcome);
$('welcomeHelp').addEventListener('click',()=>{closeWelcome();openHelp()});
/* the codex, registry, chronicle and help share one spot on the map, so opening one closes the others */
function closePanels(keep){for(const f of [closeCodex,closeRegistry,closeChron,closeHelp])if(f!==keep)f()}
function openHelp(){closePanels(closeHelp);closeWelcome();helpEl.hidden=false;$('helpClose').focus()}
function closeHelp(){if(helpEl.hidden)return;helpEl.hidden=true;if(helpEl.contains(document.activeElement))$('helpBtn').focus()}
$('helpBtn').addEventListener('click',()=>helpEl.hidden?openHelp():closeHelp());
$('helpClose').addEventListener('click',closeHelp);
$('chronBtn').addEventListener('click',()=>chronOpen?closeChron():openChron());
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
  lastPress=performance.now();closeWelcome();
  if(tool==='inspect'&&cam.pz<1.25*dpr){const T=tribeUnder(p);if(T){select(null);openCodex(T,'overview');return}}
  if(tool==='inspect'){const s=pickAt(p);select(s);if(s&&s.u&&AU.ready){if(s.u.k===0)playAt('speak',.7,0,{race:s.u.race,child:!adult(s.u)});else playAt('call',.7,0,s.u.sp)}}
  else if(SPAWNABLE.has(tool))spawnAt(p,tool);
  else if(TAPS[tool])TAPS[tool](p);
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
  if(painting&&REPEAT.has(tool)&&performance.now()-lastPress>180)press(hover);
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
  e.preventDefault();
  const p=toTile(e),d=e.deltaMode===1?e.deltaY*30:e.deltaY;
  zoomTo(p.sx,p.sy,cam.tpz*Math.exp(-clamp(d,-240,240)*.0018));
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
const SEASON_IC=['🌱','☀️','🍂','❄️'];
function renderHeader(){
  $('year').textContent=`Year ${year()} · ${SEASON_IC[season()]} ${SEASONS[season()]}${seasonLock>=0?' 🔒':''}`;
  $('seasonBtn').textContent=seasonLock<0?'🔄 Seasons turn':`🔒 Always ${SEASONS[seasonLock].toLowerCase()}`;
  $('seasonBtn').setAttribute('aria-pressed',seasonLock>=0);
  $('domainBtn').setAttribute('aria-pressed',showDomains);
  $('clockBtn').textContent=`${phaseIcon()} ${phaseName()}`;
  $('weatherBtn').textContent=`${WTYPES[WX.type].ic} ${WTYPES[WX.type].name}`;
}
function renderPanel(force){
  renderHeader();
  const alive=tribes.filter(T=>T.alive);
  let animals=0;for(const k in cnt.sp)animals+=cnt.sp[k];
  $('cPeople').textContent=cnt.people;$('cKings').textContent=alive.length;
  $('cBoats').textContent=boats.length;$('cAnimals').textContent=animals;
  let claimed=0;for(const T of alive)claimed+=T.area;
  $('claimed').textContent=`${Math.round(claimed/landTiles*100)}% of the land is claimed by a kingdom.`;
  $('races').innerHTML=RACE_KEYS.filter(r=>cnt.race[r]||!RACES[r].base).map(r=>`<span title="${RACES[r].plural}">${RACES[r].icon} <b>${cnt.race[r]||0}</b></span>`).join('');
  if(!force&&window.innerWidth<=860&&!side.classList.contains('open'))return;
  $('fauna').innerHTML=SPECIES_KEYS.filter(s=>cnt.sp[s]).map(s=>`<span title="${SPECIES[s].name}">${SPECIES[s].icon} ${cnt.sp[s]}</span>`).join('')||'<span>No animals</span>';
  alive.sort((a,b)=>b.pop-a.pop);
  $('kings').innerHTML=alive.length?alive.map(T=>{
    const foes=wars.filter(w=>w.a===T.id||w.b===T.id).map(w=>tribes[w.a===T.id?w.b:w.a].name);
    return `<li><button class="king" data-id="${T.id}"><span class="sw" style="background:${css(T.color)}"></span><span class="nm">${RACES[T.race].icon} ${T.title}</span>
      <span class="meta">${T.pop} ${RACES[T.race].plural.toLowerCase()} / ${(T.jobs&&T.jobs.soldier)||0} soldiers, ${T.houses} ${T.houses===1?'building':'buildings'}, ${T.stock} livestock${T.fish?`, ${T.fish} boats`:''}</span>
      <span class="meta">${AGE_NAME[T.age]} · holds ${sharePct(T)}% of the land</span>
      <span class="dom"><i style="width:${Math.min(100,Math.max(2,sharePct(T)*3))}%;background:${css(T.color)}"></i></span>
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
    renderMiniLog();
    logDirty=false;
  }
}
/* the last few events, quietly, at the foot of the tray; a place-tagged one can be tapped to fly there */
function renderMiniLog(){
  const el=$('miniLog');if(!el)return;
  el.innerHTML=logs.length?logs.slice(0,3).map((l,k)=>{
    const t=`<span class="yr">Y${l.y}</span> ${l.m}`;
    return l.x!=null?`<button class="ml" data-x="${l.x}" data-y="${l.wy}" style="border-left-color:${css(l.c)}" title="Go there">${t}</button>`
      :`<p class="ml" style="border-left-color:${css(l.c)}">${t}</p>`}).join(''):'<p class="ml empty">Nothing has happened yet.</p>';
}
$('miniLog').addEventListener('click',e=>{const b=e.target.closest('button.ml');if(b){follow=false;flyTo(+b.dataset.x,+b.dataset.y,Math.max(cam.tpz,3*dpr))}});

/* main loop: fixed-rate simulation, rendering interpolated in between */
let last=performance.now(),acc=0,panelT=0,inspT=0;
function frame(t){
  const dt=Math.min(100,t-last);last=t;
  if(speed>0){
    /* the sim gets a time budget per frame: a busy world runs a little slower rather than dropping frames.
       A step only starts if the average step still fits in what is left of the budget */
    acc+=dt*SPS[speed]/1000;let n=0;const t0=performance.now();
    while(acc>=1&&n<12&&(n===0||performance.now()-t0+stepMs<SIM_BUDGET)){const s=performance.now();simStep();stepMs+=(performance.now()-s-stepMs)*.1;acc--;n++}
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
  if(chronOpen&&frameN%40===0)renderChron();
  if(regOpen&&frameN%60===0)renderRegistry();
  requestAnimationFrame(frame);
}
genWorld();initFlocks();resize();setTool('inspect');renderPanel(true);warmSprites();
requestAnimationFrame(frame);

/* a people newly awakened by the monolith gets its own tile in the Creatures tab */
/* after a load or a new world, the Creatures tab lists exactly the woken peoples that world knows */
function syncRaceTiles(keep){
  for(const k of RACE_KEYS.slice()){
    if(!RACES[k].uplift||keep.has(k))continue;
    RACE_KEYS.splice(RACE_KEYS.indexOf(k),1);delete RACES[k];delete LANG[k];SPAWNABLE.delete(k);REPEAT.delete(k);
    const t=trayEl.querySelector(`.tile[data-tool="${k}"]`);if(t)t.remove();
    if(tool===k)setTool('inspect');
  }
  for(const k of keep)addRaceTile(k,true);
}
function addRaceTile(key,quiet){
  if(SPAWNABLE.has(key))return;
  const t=[key,{race:key},RACES[key].plural,RACES[key].tip+' Tap inside another people\u2019s kingdom to send settlers to live among them.'];
  HINT[key]=t[3];NAMES[key]=t[2];SPAWNABLE.add(key);REPEAT.add(key);
  const pane=panes[1],tile=mkTile(t);
  const races=[...pane.querySelectorAll('.tile')].filter(b=>RACES[b.dataset.tool]);
  const last=races[races.length-1];if(last)last.after(tile);else pane.prepend(tile);
  if(!quiet)toast(`A new people has awoken: the ${RACES[key].plural}! You can now place them from the Creatures tab.`);
}
