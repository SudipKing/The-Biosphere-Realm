"use strict";
/* ============ Save and load: the whole world in one file ============
   Typed arrays travel as base64. Kingdoms point at faiths by index, faiths point into the god tables by index, and
   units point at each other by id. A load builds the whole world first and swaps it in only when the file checks out,
   so a bad file never harms the world on screen. New world state must be added to saveWorld and buildWorld. */
const SAVE_FORMAT='biosphere-realm',SAVE_VERSION=1;
/* the tile layers that are saved, with their types. own is saved too, so a loaded world carries on exactly where it was
   instead of redrawing its borders early; ownScore is scratch space for computeDomains */
const SAVE_ARRAYS={hgt:Float32Array,tree:Uint8Array,fire:Uint8Array,lava:Uint16Array,bld:Int16Array,btype:Uint8Array,burnt:Uint32Array,
  bm:Uint8Array,ore:Uint8Array,oreAmt:Uint8Array,btier:Uint8Array,own:Int16Array};
const tileLayers=()=>({hgt,tree,fire,lava,bld,btype,burnt,bm,ore,oreAmt,btier,own});

function toB64(a){
  const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let s='';
  for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
  return btoa(s);
}
function fromB64(b,C,name){
  let s;try{s=atob(b)}catch(e){s=''}
  if(s.length!==N*C.BYTES_PER_ELEMENT)throw new Error(`its ${name} layer is damaged`);
  const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
  return new C(u.buffer);
}
/* a unit as plain data: render caches (fields starting with _) are dropped, its target becomes an id. A target that
   died this step stays a target until its hunter next acts (and drops its task), so it is kept as a ghost. */
function plainUnit(u){
  const o={};
  for(const k in u){if(k[0]==='_')continue;o[k]=k==='target'?(u.target?u.target.id:null):u[k]}
  return o;
}
function ghostsOf(list){
  const live=new Set(list),out=new Map();
  for(const u of list){const t=u.target;if(t&&!live.has(t)&&!out.has(t.id))out.set(t.id,Object.assign(plainUnit(t),{target:null}))}
  return [...out.values()];
}
function saveWorld(){
  const tribeOut=tribes.map(T=>{const o={};for(const k in T)if(k!=='members'&&k!=='jobs'&&k[0]!=='_')o[k]=k==='rel'?T.rel.id:T[k];
    /* a hunt in progress, the pause after one and the last beast that raided it: runtime references, saved as ids */
    if(T._hunt)o.hunt=Object.assign({},T._hunt,{m:T._hunt.m.id});
    if(T._huntCd>0)o.huntCd=T._huntCd;
    if(T._raid&&T._raid.m&&!T._raid.m.dead)o.raid={m:T._raid.m.id,at:T._raid.at};
    return o});
  const relOut=religions.map(r=>{
    const P=PANTHEON[r.race],o={};
    for(const k in r)if(k!=='patron'&&k!=='second'&&k!=='doc'&&k!=='tenets')o[k]=r[k];
    o.patron=P.indexOf(r.patron);o.patronName=r.patron.name;
    o.second=r.second?P.indexOf(r.second):-1;o.secondName=r.second?r.second.name:null;
    o.tenets=r.tenets.map(t=>TENETS[r.race].indexOf(t));
    return o;
  });
  const bombKey=o=>Object.keys(BOMBS).find(k=>BOMBS[k]===o);
  const [cx,cy]=viewCenter(),L=tileLayers(),arrays={};
  const alive=units.filter(u=>!u.dead),liveBoats=boats.filter(b=>!b.dead);
  for(const k in SAVE_ARRAYS)arrays[k]=toB64(L[k]);
  return {
    format:SAVE_FORMAT,version:SAVE_VERSION,W,H,savedAt:new Date().toISOString(),year:year(),
    seedText:worldSeed,rng:rngS,salt:seed,step,uid,seasonLock,dayLock,wxLock,startFocus,story,lastDomains,ownDirty,landTiles,
    WX:Object.assign({},WX),
    arrays,
    races:RACE_KEYS.filter(k=>RACES[k].uplift).map(k=>({key:k,def:RACES[k]})),
    lang:Object.assign({},LANG),
    religions:relOut,tribes:tribeOut,
    units:alive.map(plainUnit),
    boats:liveBoats.map(b=>Object.assign({},b,{pass:b.pass.map(plainUnit)})),
    ghosts:ghostsOf(alive.concat(...liveBoats.map(b=>b.pass))),
    /* fires and lava are walked in the order they started (with random draws), so that order is kept */
    fireOrder:[...fires],lavaOrder:[...lavas],
    wars,alliances,logs,volcanoes,monoliths,
    wfx:wfx.map(f=>f.o?Object.assign({},f,{o:bombKey(f.o)}):f),
    cam:{x:cx,y:cy,pz:cam.tpz/dpr},
  };
}

/* a kingdom's chronicle comes from tools/chronicler, outside the game, so only a well-formed one is kept */
function cleanChronicle(c){
  if(!c||typeof c.title!=='string'||!Array.isArray(c.verses)||!c.verses.length)return undefined;
  const verses=c.verses.filter(v=>v&&typeof v.text==='string'&&Number.isFinite(v.from)&&Number.isFinite(v.to)).slice(0,8)
    .map(v=>({text:v.text.slice(0,900),from:v.from|0,to:v.to|0}));
  if(!verses.length)return undefined;
  return {title:c.title.slice(0,100),verses,year:c.year|0,by:typeof c.by==='string'?c.by.slice(0,80):'Claude',at:typeof c.at==='string'?c.at:''};
}
/* check everything and build the new world in local variables; nothing global changes until applyWorld */
function buildWorld(o){
  if(!o||o.format!==SAVE_FORMAT)throw new Error('it is not a Biosphere Realm save');
  if(!(o.version>=1))throw new Error('it has no version');
  if(o.version>SAVE_VERSION)throw new Error('it was made by a newer version of the game');
  if(o.W!==W||o.H!==H)throw new Error('its map is a different size');
  for(const k of ['tribes','religions','units','boats'])if(!Array.isArray(o[k]))throw new Error(`its ${k} are missing`);
  const A=o.arrays||{},arr={};
  for(const k in SAVE_ARRAYS)arr[k]=fromB64(A[k],SAVE_ARRAYS[k],k);
  const nT=o.tribes.length,nR=o.religions.length;
  for(const T of o.tribes)if(!(T.rel>=0&&T.rel<nR)||!Array.isArray(T.towns)||!T.towns.length)throw new Error('a kingdom in it is broken');
  const known=r=>!!RACES[r]||(o.races||[]).some(x=>x.key===r);
  for(const u of o.units){
    if(u.k===0&&!(u.tribe>=0&&u.tribe<nT&&known(u.race)))throw new Error('a person in it belongs to no kingdom');
    if(u.k===1&&(!SPECIES[u.sp]||u.owner>=nT))throw new Error('an animal in it is broken');
  }
  for(let i=0;i<N;i++)if(arr.bld[i]>=nT||arr.own[i]>=nT)throw new Error('a building or border in it belongs to no kingdom');
  const races=o.races||[];
  for(const r of races)if(!/^up_[a-z]+$/.test(r.key)||!r.def||!r.def.base||!RACES[r.def.base])throw new Error('a people in it is broken');
  /* faiths of woken peoples use the god tables of the people they are based on */
  const tableOf=race=>{const r=races.find(x=>x.key===race);return r?r.def.base:race};
  const religions=o.religions.map(s=>{
    const P=PANTHEON[tableOf(s.race)],TN=TENETS[tableOf(s.race)],doc=DOCTRINES[s.docId];
    if(!P||!doc||!P[s.patron])throw new Error('a faith in it is broken');
    const {patronName,secondName,...rest}=s;
    return Object.assign(rest,{patron:P[s.patron],second:s.second>=0?P[s.second]:null,doc,tenets:(s.tenets||[]).map(i=>TN[i]).filter(Boolean),
      names:[patronName,secondName]});
  });
  const tribes=o.tribes.map(s=>Object.assign({},s,{chronicle:cleanChronicle(s.chronicle),sci:s.sci||0,general:s.general??-1,age:Math.min(ERA_MAX,s.age|0),rel:religions[s.rel],members:[],jobs:{},_gen:null,fx:s.fx&&typeof s.fx==='object'?Object.assign(zeroFx(),s.fx):null}));
  const byId=new Map(),mk=s=>{const u=Object.assign(blankUnit(),s);byId.set(u.id,u);return u};
  const units=o.units.map(mk);
  const boats=o.boats.map(b=>Object.assign({},b,{pass:(b.pass||[]).map(mk)}));
  /* ghosts are only looked up as targets; they never join the world */
  for(const g of Array.isArray(o.ghosts)?o.ghosts:[])if(g&&g.id!=null&&!byId.has(g.id))mk(g);
  for(const u of byId.values())u.target=u.target!=null?byId.get(u.target)||null:null;
  for(const T of tribes){
    if(T.hunt){const m=byId.get(T.hunt.m);if(m&&!m.dead)T._hunt=Object.assign({},T.hunt,{m})}
    if(T.raid){const m=byId.get(T.raid.m);if(m&&!m.dead)T._raid={m,at:T.raid.at}}
    T._huntCd=T.huntCd|0;delete T.hunt;delete T.raid;delete T.huntCd;
  }
  let maxId=0;for(const u of byId.values())maxId=Math.max(maxId,u.id);for(const b of boats)maxId=Math.max(maxId,b.id);
  return {o,arr,races,religions,tribes,units,boats,uid:Math.max(o.uid|0,maxId+1)};
}

/* swap the built world in, then rebuild everything that is derived from it */
function applyWorld(w){
  const o=w.o,a=w.arr;
  ({hgt,tree,fire,lava,bld,btype,burnt,bm,ore,oreAmt,btier}=a);
  resetWorldState();
  /* borders come back as saved, with the same countdown to their next redraw */
  own=a.own;ownSnap=Int16Array.from(own);ownTSnap=null;brDirty=true;ovFull=true;lastDomains=o.lastDomains??-99;ownDirty=o.ownDirty??true;
  if(o.landTiles)landTiles=o.landTiles;
  /* peoples woken by the monolith come back exactly as they were saved */
  for(const r of w.races){RACES[r.key]=r.def;if(!RACE_KEYS.includes(r.key))RACE_KEYS.push(r.key);aliasRace(r.key)}
  religions=w.religions;tribes=w.tribes;units=w.units;boats=w.boats;uid=w.uid;
  /* gods renamed in the Registry keep their names */
  for(const r of religions){const [p,s]=r.names;delete r.names;if(p)r.patron.name=p;if(r.second&&s)r.second.name=s}
  worldSeed=String(o.seedText||'');rngS=o.rng|0;seed=o.salt|0;step=o.step|0;seasonLock=o.seasonLock??-1;dayLock=typeof o.dayLock==='number'&&o.dayLock>=0&&o.dayLock<1?o.dayLock:-1;wxLock=!!o.wxLock;
  startFocus=o.startFocus||[W/2,H/2];if(o.story)story=Object.assign(newStory(),o.story);
  Object.assign(WX,o.WX||{});
  wars=o.wars||[];alliances=o.alliances||[];logs=o.logs||[];
  volcanoes.push(...(o.volcanoes||[]));monoliths.push(...(o.monoliths||[]));
  for(const f of o.wfx||[])if(f.type!=='delay'||BOMBS[f.o])wfx.push(f.o?Object.assign({},f,{o:BOMBS[f.o]}):f);
  Object.assign(LANG,o.lang||{});
  for(const i of Array.isArray(o.fireOrder)?o.fireOrder:[])if(fire[i])fires.add(i);
  for(const i of Array.isArray(o.lavaOrder)?o.lavaOrder:[])if(lava[i])lavas.add(i);
  for(let i=0;i<N;i++){if(fire[i])fires.add(i);if(lava[i])lavas.add(i);if(burnt[i]>step)burnSet.add(i)}
  updateLight();census();rebuildGrid();
  for(const T of tribes)if(!T.fx)T.fx=computeFx(T);
  if(o.landTiles==null)computeDomains();
  initTerrain();
  syncRaceTiles(new Set(w.races.map(r=>r.key)));
}

async function saveToFile(){
  const json=JSON.stringify(saveWorld()),name=`realm-${worldSeed}-year-${year()}.biosphere`;
  let blob=new Blob([json],{type:'application/json'});
  if(typeof CompressionStream==='function'){
    try{blob=await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob()}catch(e){}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
  toast(`Saved year ${year()} as ${name}.`);
}
async function loadFromFile(file){
  try{
    const buf=new Uint8Array(await file.arrayBuffer());let text;
    if(buf[0]===0x1f&&buf[1]===0x8b){
      if(typeof DecompressionStream!=='function')throw new Error('this browser cannot open compressed saves');
      text=await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    }else text=new TextDecoder().decode(buf);
    let o;try{o=JSON.parse(text)}catch(e){throw new Error('it is not a Biosphere Realm save')}
    const w=buildWorld(o);
    applyWorld(w);afterWorld();
    const c=o.cam||{};
    cam.pz=cam.tpz=clamp((c.pz||2)*dpr,cam.fit*.9,maxPz());centerOn(c.x??startFocus[0],c.y??startFocus[1]);
    toast(`Welcome back to year ${year()}.`);
  }catch(e){toast(`That file could not be loaded: ${e.message}.`)}
}
$('saveBtn').addEventListener('click',()=>{closeWorldPop();saveToFile()});
$('loadBtn').addEventListener('click',()=>$('loadFile').click());
$('loadFile').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f){closeWorldPop();loadFromFile(f)}});
