"use strict";
/* ============ Simulation: people, animals, kingdoms, boats, nature ============ */
function placeName(r){const L=RACES[r];for(let t=0;t<25;t++){const n=pick(L.p1)+pick(L.p2);if(!tribes.some(T=>T.name===n))return n}return pick(L.p1)+pick(L.p2)}
function personName(r){const L=RACES[r];return pick(L.n1)+pick(L.n2)}
function word(r,n){let s='';for(let i=0;i<n;i++)s+=pick(RACES[r].ph);return s}
function phrase(r){const ws=[];const n=2+((R()*2)|0);for(let i=0;i<n;i++)ws.push(word(r,1+((R()*2)|0)));return cap(ws.join(' '))+(r==='orc'?'!':'.')}

function newTribe(race,x,y,parent,opts){
  const id=tribes.length,used=new Set(tribes.filter(t=>t.alive).map(t=>t.ci));
  let ci=0;while(used.has(ci)&&ci<KCOL.length-1)ci++;
  if(used.has(ci))ci=id%KCOL.length;
  const rebel=!!(opts&&opts.rebel);
  let rel,schism=false;
  if(parent&&!rebel){if(R()<.4){rel=newReligion(race,parent.rel);schism=true}else rel=parent.rel}
  else if(parent&&rebel)rel=newReligion(race,parent.rel);
  else rel=newReligion(race);
  const name=placeName(race);
  const T={id,race,name,title:`${RACES[race].title} ${name}`,color:KCOL[ci],ci,food:16,mat:8,cx:x,cy:y,
    houses:0,hall:-1,temple:false,templeAt:-1,pop:0,members:[],alive:true,rel,motto:phrase(race),founded:year(),
    parent:parent?parent.id:-1,fish:0,stock:0,rebel,
    devo:50+((R()*20)|0),stab:55,values:rollValues(race),arts:[],renown:0,hist:[],foes:[],heroes:[],monuments:0,
    nextFest:year()+3,bless:0,frenzy:0,legendIdx:(R()*2)|0,fx:zeroFx(),age:0,res:{stone:0,copper:0,iron:0,coal:0,silver:0,gold:0,gems:0},area:0,jobs:{},know:0,colonies:0,towns:[{x,y,name,founded:year(),houses:0,pop:0}]};
  tribes.push(T);
  T.fx=computeFx(T);
  if(schism)log(`A schism split the ${parent.title}: the ${T.title} turned to the ${rel.name}, in the name of ${rel.patron.name}.`,DOMAINS[rel.domain].c,false,newsAt(T,'⛪',2));
  return T;
}
function hostile(a,b){return wars.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a))}

/* ---------- creatures ---------- */
function mkUnit(k,x,y){
  const u={id:uid++,k,x:x+.3+R()*.4,y:y+.3+R()*.4,tx:0,ty:0,px:0,py:0,hp:10,maxhp:10,dmg:5,spd:.08,age:0,life:1e9,
    hunger:(R()*300)|0,cd:(R()*10)|0,atk:0,task:null,target:null,dead:false,busy:0,dir:R()<.5?1:-1,moving:false,inside:false,mode:0};
  u.tx=u.px=u.x;u.ty=u.py=u.y;units.push(u);return u;
}
function addAnimal(sp,x,y,owner=-1,baby=false){
  const S=SPECIES[sp],u=mkUnit(1,x,y);
  u.sp=sp;u.owner=owner;u.maxhp=u.hp=S.hp;u.dmg=S.dmg||0;u.life=S.life*YEAR*(.7+R()*.6);
  u.age=baby?0:(YEAR*2+R()*u.life*.3)|0;u.spd=S.spd;u.v=(R()*4)|0;u.male=R()<.5;u.amph=!!S.amph;u.fly=!!S.fly;u.fcd=0;
  return u;
}
function randGenes(r){const L=RACES[r];return{skin:(R()*L.skins.length)|0,hair:(R()*L.hairs.length)|0,str:.85+R()*.3,vit:.85+R()*.3,agi:.9+R()*.2}}
function childGenes(a,b,r){
  const L=RACES[r],m=v=>Math.max(.6,Math.min(1.5,v+(R()-.5)*.12));
  const g={skin:pick([a,b]).skin,hair:pick([a,b]).hair,str:m((a.str+b.str)/2),vit:m((a.vit+b.vit)/2),agi:m((a.agi+b.agi)/2)};
  if(R()<.05)g.hair=(R()*L.hairs.length)|0;
  if(R()<.03)g.skin=(R()*L.skins.length)|0;
  return g;
}
function childTraits(a,b){const s=new Set();for(const t of a.concat(b))if(R()<.4)s.add(t);if(R()<.08)s.add(pick(TRAIT_KEYS));return [...s].slice(0,3)}
function addPerson(T,x,y,pa,pb,race){
  pb=pb||pa;
  const r=race||(pa?(pb.race!==pa.race?pick([pa.race,pb.race]):pa.race):T.race),L=RACES[r];
  const u=mkUnit(0,x,y);
  u.race=r;u.tribe=T.id;u.town=pa?(pa.town|0):0;u.job=null;u.xp=0;u.jhp=1;u.jdmg=1;
  u.genes=pa&&pa.race===r&&pb.race===r?childGenes(pa.genes,pb.genes,r):randGenes(r);
  u.traits=pa?childTraits(pa.traits,pb.traits):(R()<.5?[pick(TRAIT_KEYS)]:[]);
  u.name=personName(r);u.gen=pa?Math.max(pa.gen,pb.gen)+1:1;
  u.parents=pa?(pa===pb?pa.name:`${pa.name} and ${pb.name}`):null;u.pa=pa?pa.id:0;u.pb=pb?pb.id:0;
  u.born=year();u.kills=0;
  u.age=pa?0:(18*YEAR+((R()*10*YEAR)|0));
  const has=t=>u.traits.includes(t),g=u.genes;
  u.maxhp=u.hp=L.hp*g.str*(has('Tough')?1.3:1);
  u.dmg=L.dmg*g.str*(has('Strong')?1.3:1);
  u.spd=L.spd*g.agi*(has('Swift')?1.15:1);
  u.life=L.life*YEAR*g.vit*(has('Long-lived')?1.3:1)*(.85+R()*.3);
  return u;
}
function die(u){
  if(u.dead)return;u.dead=true;
  if(u.k===0&&u.kills>=5){const T=tribes[u.tribe];log(`${u.name}, hero of the ${T.title}, has fallen after ${u.kills} victories.`,T.color,false,{x:u.x,y:u.y,ic:'🎖️',p:1});T.heroes.push({name:u.name,kills:u.kills,y:year()});T.renown+=1}
}
function setT(u,i){u.tx=(i%W)+.5;u.ty=((i/W)|0)+.5}
const canStand=(u,i)=>{if(SPECIES[u.sp]&&SPECIES[u.sp].fly)return true;const b=bio(hgt[i]);if(u.amph)return b>=1&&b<=3&&!lava[i];return walk(i)};
function wander(u,cx,cy,r){const i=sampleNear(cx,cy,r,j=>canStand(u,j),15);if(i>=0)setT(u,i)}
function moveToward(u,spd){
  const dx=u.tx-u.x,dy=u.ty-u.y,d=Math.hypot(dx,dy);
  if(u.haste>step)spd*=1.6;
  const bi=bm[tileOf(u)];if(bi){const f=BIOMES[bi].spd;if(f)spd*=f;if(bi===BM.PARA&&u.boost>step)spd*=1.6}
  if(Math.abs(dx)>.05)u.dir=dx>0?1:-1;
  if(d<=spd){u.x=u.tx;u.y=u.ty;return true}
  const nx=u.x+dx/d*spd,ny=u.y+dy/d*spd;
  if(!inb(nx|0,ny|0)||!canStand(u,(ny|0)*W+(nx|0))){u.target=null;u.task=null;u.cd=0;wander(u,u.x,u.y,5);return false}
  u.x=nx;u.y=ny;u.moving=true;return false;
}
function hit(t,dmg,src){
  if(t.shield>step)return;
  if(t.k===0){const df=tribes[t.tribe].fx;if(df.def)dmg/=1+df.def}
  if(src.k===0||src.k===1){const sb=bm[tileOf(src)];if(sb===BM.CLOVER)dmg*=1.2}
  if(t.k===0&&t.traits.includes('Giant'))dmg*=.8
  if(src.k===0&&t.k===0){const sf=tribes[src.tribe].fx;
    if(sf.raze&&R()<.12*sf.raze){const b=ringFind(t.x,t.y,3,i=>bld[i]===t.tribe&&btype[i]<4&&!fire[i]);if(b>=0)ignite(b,true)}}
  t.hp-=dmg;
  sfx(src.k===0&&t.k===0?'clang':'thud',t.x,t.y);
  if(t.hp<=0){
    die(t);
    if(src.k===1&&src.sp==='zombie'&&t.k===0&&units.length<1600){const z=addAnimal('zombie',t.x|0,t.y|0);z.x=z.px=t.x;z.y=z.py=t.y;sfx('cry',t.x,t.y,'zombie')}
    if(t.k===1){const f=SPECIES[t.sp].food;if(src.k===0)tribes[src.tribe].food+=f;else src.hunger=0}
    else{if(src.k===1)src.hunger=0;else{src.kills=(src.kills||0)+1;const f=tribes[src.tribe].fx;if(f.lifesteal)src.hp=Math.min(src.maxhp,src.hp+src.maxhp*f.lifesteal)}}
    src.target=null;src.task=null;src.cd=0;
  }else if(t.k===1&&!SPECIES[t.sp].pred){t.tx=t.x+(t.x-src.x)*3;t.ty=t.y+(t.y-src.y)*3;t.mode=1;t.cd=20;sfx('cry',t.x,t.y,t.sp)}
  else if(!t.target&&adult(t))t.target=src;
}
function chase(u,spd,dmg,range){
  const t=u.target,d=Math.hypot(t.x-u.x,t.y-u.y);
  if(Math.abs(t.x-u.x)>.05)u.dir=t.x>u.x?1:-1;
  if(d>15){u.target=null;u.task=null;return}
  if(d<range){
    if(--u.atk<=0){
      u.atk=10;
      if(range>2){if(effects.length<300)effects.push({type:'arrow',x0:u.x,y0:u.y-.7,x1:t.x,y1:t.y-.5,t:0,dur:7,c:u.k===0?magicColor(u):null});sfx('arrow',u.x,u.y)}
      hit(t,dmg,u);
    }
  }else{u.tx=t.x;u.ty=t.y;moveToward(u,spd)}
}
const isThreat=v=>v.k===1&&SPECIES[v.sp].pred&&!SPECIES[v.sp].minor;
function enemyNear(u,r){return nearest(u,r,v=>(isThreat(v)&&v.charm!==u.tribe)||(v.k===0&&v.tribe!==u.tribe&&hostile(v.tribe,u.tribe)))}

/* ---------- people ---------- */
function updPerson(u){
  const T=tribes[u.tribe],fx=T.fx;
  if(fx.regen&&u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+fx.regen*.05);
  if(!u.job&&adult(u)&&(u.id+step)%9===0)setJob(u,pickJob(T,u));
  if(u.odd){
    if(u.traits.includes('Blessed')&&u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+.06);
    if(u.traits.includes('Cursed')){u.hp-=.03;if(u.hp<=0){die(u);return}}
  }
  if(u.inside){
    if(bld[u.home]!==u.tribe||!isNight()){u.inside=false;u.cd=(R()*30)|0;u.task=null}
    else return;
  }
  u.hunger++;
  if(u.hunger>500&&T.food>0){T.food--;u.hunger=0}
  if(u.hunger>1400){die(u);return}
  if(u.target&&u.target.dead){u.target=null;u.task=null;u.cd=0}
  if(--u.cd<=0){
    u.cd=12+((R()*10)|0);
    if(!u.target){
      if(u.odd&&u.traits.includes('Berserk')){const e=nearest(u,6,v=>v!==u&&!v.dead);if(e){u.target=e;u.task='fight'}}
      if(u.target){}
      else if(u.task&&++u.busy<20){if(adult(u)){const e=enemyNear(u,4);if(e){u.target=e;u.task='fight'}}}
      else{u.busy=0;decide(u,T)}
    }
  }
  const sp=u.spd*(1+fx.spd);
  if(u.target){
    let dm=u.dmg*(1+fx.dmg);
    if(RACES[u.race].range>2)dm*=1+fx.ranged;
    if(fx.frenzy&&u.hp<u.maxhp*.5)dm*=1+fx.frenzy;
    if(T.frenzy>step)dm*=1.25;
    dm*=1+.09*T.age+Math.min(.4,u.xp*.008);
    if(u.odd){if(u.traits.includes('Berserk'))dm*=1.5}
    chase(u,sp*1.1,dm,u.task==='butcher'||u.task==='hunt'?Math.min(1.2,RACES[u.race].range):RACES[u.race].range);return;
  }
  if(moveToward(u,sp)&&u.task)doTask(u,T);
}
function decide(u,T){
  const kid=!adult(u),H=townOf(u,T),hx=H.x,hy=H.y;
  if(!kid){const e=enemyNear(u,u.traits.includes('Brave')?9:6);if(e){u.target=e;u.task='fight';return}}
  if(isNight()&&R()<.85&&H.houses>0){
    const h=sampleNear(hx,hy,Math.min(18,4+Math.sqrt(H.houses)*2.2),i=>bld[i]===T.id&&btype[i]<2,40);
    if(h>=0){setT(u,h);u.task='sleep';return}
  }
  const forage=()=>{
    const t=sampleNear(hx,hy,u.job==='farmer'?13:10,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&!fire[i]&&(own[i]<0||own[i]===T.id),30);
    if(t>=0){setT(u,t);u.task='forage';return true}return false;
  };
  if(kid){if(R()<.4&&forage())return;u.task=null;wander(u,hx,hy,5);return}
  const getFood=()=>{
    if(T.stock>T.houses&&R()<.35){
      const a=nearest(u,16,v=>v.k===1&&v.owner===T.id&&!SPECIES[v.sp].nosl&&adult(v));
      if(a){u.target=a;u.task='butcher';return true}
    }
    if(R()<(u.race==='orc'?.65:.35)){
      const s=nearest(u,14,v=>v.k===1&&!SPECIES[v.sp].pred&&v.owner<0);
      if(s){u.target=s;u.task='hunt';return true}
    }
    return forage();
  };
  if(u.job&&R()<.82&&jobWork(u,T,forage))return;
  const r=R();
  if(T.food<T.pop*2+3&&getFood())return;
  if(r<.45&&tryBuild(u,T))return;
  if(r<.4&&getOre(u,T))return;
  if(r<.75&&T.mat<16&&getMat(u,T))return;
  if(u.race==='elf'&&R()<.15){
    const t=sampleNear(hx,hy,13,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&burnt[i]<=step&&!nearBld(i),20);
    if(t>=0){setT(u,t);u.task='plant';return}
  }
  if(T.food<T.pop*5+10&&getFood())return;
  u.task=null;wander(u,hx,hy,7);
}
const townOf=(u,T)=>T.towns[u.town|0]||T.towns[0];
function nearestTown(T,x,y){let b=0,bd=1e9;for(let k=0;k<T.towns.length;k++){const t=T.towns[k],d=(t.x-x)**2+(t.y-y)**2;if(d<bd){bd=d;b=k}}return b}
function nearBld(i){const x=i%W,y=(i/W)|0;for(const [dx,dy] of N8){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return true}return false}
function getMat(u,T,mineFirst,woodFirst){
  const mine=()=>{const t=ringFind(u.x,u.y,16,i=>bio(hgt[i])===5);if(t>=0){setT(u,t);u.task='mine';return true}return false};
  const wood=()=>{const t=ringFind(u.x,u.y,14,i=>tree[i]&&!fire[i]);if(t>=0){setT(u,t);u.task=u.race==='elf'?'gather':'chop';return true}return false};
  if(woodFirst)return wood()||mine();
  if(mineFirst||u.race==='dwarf')return mine()||wood();
  return wood()||mine();
}
/* ---------- job classes ---------- */
function jobTargets(T){
  const war=wars.some(w=>w.a===T.id||w.b===T.id);
  return{farmer:.28,miner:T.age<5?.14:.1,woodcutter:.13,builder:.1,hunter:.07,soldier:war?.3:.14,teacher:T.hall>=0?.06:0,priest:T.temple?.05:0};
}
function pickJob(T,u){
  const tg=jobTargets(T),n=Math.max(8,T.pop),have=T.jobs||{};
  let best='farmer',bs=-9;
  for(const j of JOB_KEYS){
    let sc=tg[j]*n-(have[j]||0);
    if(!tg[j])continue;
    if(j==='soldier'&&(u.traits.includes('Strong')||u.traits.includes('Brave')||u.race==='orc'))sc+=1.2;
    if(j==='teacher'&&(u.traits.includes('Wise')||u.race==='elf'))sc+=1.2;
    if(j==='miner'&&u.race==='dwarf')sc+=1.5;
    if((j==='woodcutter'||j==='hunter')&&u.race==='elf')sc+=.7;
    if(j==='farmer'&&u.race==='human')sc+=.6;
    sc+=R()*.8;
    if(sc>bs){bs=sc;best=j}
  }
  return best;
}
function setJob(u,j){
  u.maxhp/=u.jhp;u.dmg/=u.jdmg;
  u.jhp=j==='soldier'?1.15:j==='miner'?1.1:1;u.jdmg=j==='soldier'?1.2:1;
  u.maxhp*=u.jhp;u.dmg*=u.jdmg;u.hp=Math.min(u.maxhp,u.hp*u.jhp);u.job=j;
}
function patrol(u,T){
  const e=enemyNear(u,12);if(e){u.target=e;u.task='fight';return true}
  const w=wars.find(x=>x.a===T.id||x.b===T.id);
  if(w&&R()<.5){
    const O=tribes[w.a===T.id?w.b:w.a];
    if(O.alive){const d=Math.hypot(O.cx-T.cx,O.cy-T.cy)||1,k=Math.min(d*.5,16);
      const j=sampleNear(T.cx+(O.cx-T.cx)/d*k,T.cy+(O.cy-T.cy)/d*k,5,walk,12);if(j>=0){setT(u,j);u.task='guard';return true}}
  }
  if(T.hall>=0&&R()<.35){const j=sampleNear(T.hall%W,(T.hall/W)|0,4,walk,12);if(j>=0){setT(u,j);u.task='train';return true}}
  const H=townOf(u,T),j=sampleNear(H.x,H.y,Math.min(14,6+Math.sqrt(H.houses+1)*2),walk,12);
  if(j>=0){setT(u,j);u.task='guard';return true}
  return false;
}
function jobWork(u,T,forage){
  switch(u.job){
    case'farmer':return forage();
    case'hunter':{
      const p=nearest(u,16,v=>v.k===1&&!SPECIES[v.sp].pred&&v.owner<0);
      if(p){u.target=p;u.task='hunt';return true}
      return forage();
    }
    case'miner':return getOre(u,T)||getMat(u,T,true);
    case'woodcutter':return getMat(u,T,false,true);
    case'builder':return tryBuild(u,T)||getMat(u,T);
    case'soldier':return patrol(u,T);
    case'teacher':case'priest':{
      const at=u.job==='priest'?T.templeAt:(T.hall>=0?T.hall:T.templeAt);
      if(at<0)return false;
      const t=sampleNear(at%W,(at/W)|0,3,i=>walk(i)&&bld[i]===-1,12);
      if(t<0)return false;
      setT(u,t);u.task=u.job==='priest'?'pray':'teach';return true;
    }
  }
  return false;
}
/* which deposit a kingdom needs next to climb the ages */
function wantOre(T){
  const r=T.res;
  if(T.age===0)return ORE.STONE;
  if(T.age===1)return ORE.COPPER;
  if(T.age===2)return ORE.IRON;
  if(T.age===3)return r.coal<10?ORE.COAL:ORE.IRON;
  if(T.age===4)return r.gold<8?ORE.GOLD:ORE.SILVER;
  return r.gems<20?ORE.GEMS:(R()<.5?ORE.GOLD:ORE.SILVER);
}
function getOre(u,T){
  const want=wantOre(T);
  const ok=i=>!fire[i]&&!lava[i]&&bld[i]===-1&&(own[i]<0||own[i]===T.id);
  let t=ringFind(u.x,u.y,24,i=>ore[i]===want&&ok(i));
  if(t<0)t=ringFind(u.x,u.y,16,i=>ore[i]>0&&ore[i]!==ORE.GEMS&&ok(i));
  if(t<0)return false;
  setT(u,t);u.task='mine';return true;
}
function bCost(T,type){const b=type===1?Math.max(4,RACES[T.race].cost):type===2?10:RACES[T.race].cost;return Math.max(2,Math.ceil(b*(1-clamp(T.fx.craft,0,.6))))}
function tryBuild(u,T){
  const H=townOf(u,T),cap=H===T.towns[0];
  let type=0;
  if(cap&&T.hall<0)type=1;
  else if(cap&&T.houses>=6&&!T.temple)type=2;
  else if(H.houses>=Math.ceil(H.pop/3)+1)return false;
  if(T.mat<bCost(T,type))return false;
  const rad=type===1?4:Math.min(18,4+Math.sqrt(H.houses)*2.2);
  const t=sampleNear(H.x,H.y,rad,i=>canBuild(i,T.race,T.id),60);
  if(t<0)return false;
  setT(u,t);u.task='build';u.btype=type;return true;
}
function canBuild(i,race,tid){
  if(fire[i]||lava[i]||tree[i]||bld[i]!==-1||burnt[i]>step||bm[i]===BM.WASTE)return false;
  if(tid!=null&&own[i]>=0&&own[i]!==tid&&!hostile(own[i],tid))return false;
  if(ore[i]&&ore[i]!==ORE.STONE)return false;
  const b=bio(hgt[i]);if(!(b===3||b===4||(race==='dwarf'&&b===5)))return false;
  const x=i%W,y=(i/W)|0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return false}
  return true;
}
function doTask(u,T){
  const i=tileOf(u);
  switch(u.task){
    case'forage':if(fertile(i)&&R()<.85){const bf=bm[i]?BIOMES[bm[i]].food:1;T.food+=gain((u.traits.includes('Wise')?2:1)*(u.job==='farmer'?1.5:1)*(1+T.fx.food)*(bm[i]===BM.PARA?.5+R()*1.5:bf))}break;
    case'train':u.xp=Math.min(60,u.xp+1);if(R()<.25)sfx('clang',u.x,u.y);break;
    case'teach':T.know=(T.know||0)+1;break;
    case'pray':T.devo=Math.min(100,T.devo+.12);break;
    case'guard':break;
    case'chop':if(tree[i]&&!fire[i]){tree[i]=0;markTile(i);T.mat+=(u.job==='woodcutter'?1:0)+3+(bm[i]===BM.BIRCH?2:bm[i]===BM.JUNGLE||bm[i]===BM.FOREST?1:0);sfx('chop',u.x,u.y)}break;
    case'gather':if(tree[i]){T.mat+=2;sfx('rustle',u.x,u.y)}break;
    case'mine':
      if(ore[i]){
        const o=ore[i],mult=(1+T.fx.mine)*(bm[i]===BM.ROCK?1.5:1)*(u.race==='dwarf'?1.4:1)*(u.job==='miner'?1.4:1);
        const n=Math.min(oreAmt[i],gain(2*mult));
        T.res[ORES[o].k]+=n;T.mat+=o===ORE.STONE?n*2:n;oreAmt[i]-=n;sfx('mine',u.x,u.y);
        if(o===ORE.GOLD||o===ORE.GEMS||o===ORE.SILVER)T.food+=n;
        if(oreAmt[i]<=0){ore[i]=0;markTile(i)}
      }else if(bio(hgt[i])===5){T.mat+=gain(3*(1+T.fx.mine)*(bm[i]===BM.ROCK?1.5:1));sfx('mine',u.x,u.y)}
      break;
    case'plant':if(fertile(i)&&!tree[i]&&bld[i]===-1){tree[i]=1;markTile(i)}break;
    case'sleep':if(bld[i]===T.id&&isNight()){u.inside=true;u.home=i;u.px=u.x;u.py=u.y;return}break;
    case'build':{
      const type=u.btype||0,cost=bCost(T,type);
      if(T.mat<cost||!canBuild(i,T.race,T.id))break;
      if(type===1&&T.hall>=0)break;
      if(type===2&&T.temple)break;
      bld[i]=T.id;btype[i]=type;btier[i]=T.age;T.houses++;townOf(u,T).houses++;T.mat-=cost;bDirty=true;ownDirty=true;markDirty(i);sfx('build',u.x,u.y);
      if(type===1){T.hall=i;if(!T.hadHall){T.hadHall=true;log(`The ${T.title} raised a great hall.`,T.color);sfx('fanfare',u.x,u.y)}}
      if(type===2){T.temple=true;T.templeAt=i;log(`The ${T.title} consecrated a temple to ${T.rel.patron.name}, ${T.rel.patron.title}.`,DOMAINS[T.rel.domain].c);sfx('bell',u.x,u.y);effects.push({type:'rite',x:i%W+.5,y:((i/W)|0)+.5,c:DOMAINS[T.rel.domain].c,t:0,dur:60})}
      break;
    }
  }
  u.task=null;u.cd=0;
}

/* ---------- animals ---------- */
function updAnimal(u){
  const S=SPECIES[u.sp];
  if(u.odd&&u.traits){
    if(u.traits.includes('Blessed')&&u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+.06);
    if(u.traits.includes('Cursed')){u.hp-=.03;if(u.hp<=0){die(u);return}}
    if(u.traits.includes('Berserk')&&!u.target&&R()<.05){const e=nearest(u,6,v=>v!==u);if(e)u.target=e}
  }
  u.hunger++;
  const i=tileOf(u);
  if(S.monster)u.hunger=0;
  else if(!S.pred&&fertile(i)&&R()<.06)u.hunger=Math.max(0,u.hunger-30);
  if(bm[i]===BM.SAV&&!S.pred)u.hunger=Math.max(0,u.hunger-.4);
  if(u.hunger>(S.pred?2400:1800)){die(u);return}
  if(u.owner>=0&&!tribes[u.owner].alive)u.owner=-1;
  if(u.target&&u.target.dead)u.target=null;
  if(--u.cd<=0){
    u.cd=15+((R()*25)|0);u.mode=0;
    if(S.monster){
      if(!u.target){const c=u.charm,p=nearest(u,S.sight||9,c==null?v=>!isMon(v):v=>(isMon(v)&&v.charm!==c)||(v.k===0&&v.tribe!==c&&hostile(v.tribe,c)));if(p)u.target=p}
      if(!u.target)wander(u,u.x,u.y,8);
    }else if(S.pred){
      if(!u.target){
        const night=isNight();
        if(u.hunger>(night?200:350)){
          let p=nearest(u,12,v=>v.k===1&&S.prey.includes(v.sp));
          if(!p&&S.people&&u.charm==null&&u.hunger>(night?S.people*.7:S.people))p=nearest(u,10,v=>v.k===0);
          if(p)u.target=p;
        }
        if(!u.target&&S.territorial&&u.charm==null){const p=nearest(u,3,v=>v.k===0&&adult(v));if(p&&R()<.5){u.target=p;sfx('cry',u.x,u.y,u.sp)}}
      }
      if(!u.target)wander(u,u.x,u.y,7);
    }else{
      const thr=nearest(u,5,v=>(v.k===1&&SPECIES[v.sp].pred&&SPECIES[v.sp].prey.includes(u.sp))||(S.wild&&v.k===0&&adult(v)&&R()<.4));
      if(thr){u.tx=u.x+(u.x-thr.x)*2.5;u.ty=u.y+(u.y-thr.y)*2.5;u.mode=1;u.cd=12}
      else if(u.owner>=0){const T=tribes[u.owner],H=T.towns[u.town|0]||T.towns[0];const r=Math.min(16,8+Math.sqrt(H.houses+1)*1.5);if(Math.hypot(u.x-H.x,u.y-H.y)>r)wander(u,H.x,H.y,r*.7);else wander(u,u.x,u.y,4)}
      else wander(u,u.x,u.y,6);
    }
  }
  if(adult(u)&&u.hunger<400&&(cnt.sp[u.sp]||0)<S.cap&&R()<S.breed*(bm[i]===BM.FLOWER?1.6:1)){addAnimal(u.sp,u.x|0,u.y|0,u.owner,true);cnt.sp[u.sp]=(cnt.sp[u.sp]||0)+1}
  if(u.sp==='dragon'&&u.target&&--u.fcd<=0){
    const t=u.target,d=Math.hypot(t.x-u.x,t.y-u.y);
    if(d<7){u.fcd=34+((R()*30)|0);breathe(u,t)}else u.fcd=0;
  }
  if(u.target){chase(u,S.chase||S.flee,(u.dmg||S.dmg||2)*(u.odd&&u.traits&&u.traits.includes('Berserk')?1.5:1),u.sp==='dragon'?1.6:1.2);return}
  moveToward(u,u.mode?S.flee:S.spd);
}

function breathe(u,t){
  effects.push({type:'flame',x0:u.x,y0:u.y-.9,x1:t.x,y1:t.y-.3,t:0,dur:16});
  const tx=t.x|0,ty=t.y|0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=tx+dx,Y=ty+dy;if(inb(X,Y)&&R()<.8)ignite(Y*W+X,true)}
  hit(t,u.dmg*.5,u);sfx('cry',u.x,u.y,'dragon');
}
function paradox(u){
  const r=R();
  if(r<.55){const j=sampleNear(u.x,u.y,9,k=>canStand(u,k),12);if(j>=0){u.x=u.px=j%W+.5;u.y=u.py=((j/W)|0)+.5;u.tx=u.x;u.ty=u.y;u.target=null;u.task=null;u.cd=0;effects.push({type:'rite',x:u.x,y:u.y,c:[200,140,255],t:0,dur:30})}}
  else if(r<.75)u.hp=u.maxhp;
  else if(r<.9)u.hp*=.7;
  else u.boost=step+200;
}
function biomeTick(u,b){
  const B=BIOMES[b];
  if(B.hp&&!isMon(u)){u.hp=Math.min(u.maxhp,u.hp-B.hp);if(u.hp<=0){die(u);return}}
  if(b===BM.CORRUPT&&isMon(u))u.hp=Math.min(u.maxhp,u.hp+.1);
  if(b===BM.PARA&&R()<.0015)paradox(u);
}
function updateUnits(){
  rebuildGrid();
  let dead=false;
  for(const u of units){
    if(u.dead){dead=true;continue}
    u.age++;u.moving=false;
    if(!u.inside){
      const i=tileOf(u);
      if(!u.fly&&(lava[i]||!canStand(u,i)||(fire[i]&&R()<.15))){die(u);dead=true;continue}
      const b=bm[i];if(b){biomeTick(u,b);if(u.dead){dead=true;continue}}
    }
    if(u.age>u.life&&!(u.odd&&u.traits.includes('Immortal'))){die(u);dead=true;continue}
    if(u.frozen>step){u.moving=false;continue}
    if(u.k===0)updPerson(u);else updAnimal(u);
    if(u.dead)dead=true;
  }
  if(dead)units=units.filter(u=>!u.dead);
  census();
}
/* head counts per kingdom, village, people and species, rebuilt from the unit list */
function census(){
  for(const T of tribes){T.pop=0;T.members.length=0;T.stock=0;T.jobs={};for(const t of T.towns)t.pop=0}
  const rc={},sp={};for(const r of RACE_KEYS)rc[r]=0;
  for(const u of units){
    if(u.k===0){const T=tribes[u.tribe];T.pop++;T.members.push(u);(T.towns[u.town|0]||T.towns[0]).pop++;rc[u.race]++;if(u.job)T.jobs[u.job]=(T.jobs[u.job]||0)+1}
    else{sp[u.sp]=(sp[u.sp]||0)+1;if(u.owner>=0)tribes[u.owner].stock++}
  }
  cnt.race=rc;cnt.sp=sp;let np=0;for(const r in rc)np+=rc[r];cnt.people=np;
}

/* ---------- kingdoms ---------- */
function updateTribes(){
  for(const T of tribes)T.fish=0;
  for(const b of boats)if(!b.dead&&b.kind==='fish')tribes[b.tribe].fish++;
  for(const T of tribes){
    if(!T.alive)continue;
    if(T.pop===0){
      T.alive=false;
      for(let i=0;i<N;i++)if(bld[i]===T.id){bld[i]=-2;btype[i]=3;markTile(i)}
      T.houses=0;T.hall=-1;bDirty=true;ownDirty=true;
      wars=wars.filter(w=>w.a!==T.id&&w.b!==T.id);alliances=alliances.filter(a=>a.a!==T.id&&a.b!==T.id);
      log(`The ${T.title} has fallen into ruin.`,T.color,false,newsAt(T,'🏚️',3));
      continue;
    }
    if(R()<T.houses*.0025)T.food++;
    if(T.temple&&R()<.004)T.food++;
    if(R()<T.stock*.0015)T.food++;
    if((step+T.id)%20===0){checkAge(T);T.fx=computeFx(T)}
    if((step+T.id*13)%(YEAR>>1)===0)rebalanceJobs(T);
    if(T.age>0&&T.mat>=3&&R()<.012){
      const H=pick(T.towns),b=sampleNear(H.x,H.y,Math.min(20,5+Math.sqrt(H.houses+1)*2.4),i=>bld[i]===T.id&&btype[i]<3&&btier[i]<T.age,30);
      if(b>=0){btier[b]++;T.mat-=2;bDirty=true;sfx('build',b%W+.5,((b/W)|0)+.5)}
    }
    if(T.stab>70&&R()<.002*T.houses)T.food++;
    if(T.fx.grow>0&&R()<.025*T.fx.grow){const g=sampleNear(T.cx,T.cy,14,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&burnt[i]<=step&&!fire[i]&&!nearBld(i),10);if(g>=0){tree[g]=1;markTile(g)}}
    culturalTick(T);
    if(T.food>=8&&T.pop<Math.min(70,T.houses*3+2)&&cnt.people<800&&T.members.length&&!isNight()){
      const m=T.towns.length>1&&R()<.5?pickSmallTown(T):pick(T.members);
      if(m&&adult(m)&&!m.inside&&R()<.014*RACES[T.race].fert*(1+T.fx.fert)*(m.traits.includes('Fertile')?1.6:1)*(bm[tileOf(m)]===BM.FLOWER?1.5:1)){
        let mate=m;for(let k=0;k<8;k++){const c=pick(T.members);if(adult(c)&&c!==m&&(c.town|0)===(m.town|0)){mate=c;break}}
        addPerson(T,m.x|0,m.y|0,m,mate);T.food-=8;
      }
    }
    if(T.houses>=3&&T.stock<Math.min(24,T.houses*1.2)&&R()<.004){
      const ti=(R()*T.towns.length)|0,H=T.towns[ti];
      if(H.houses>0){const i=sampleNear(H.x,H.y,10,j=>walk(j)&&bld[j]===-1,20);
      if(i>=0){const a=addAnimal(pick(RACES[T.race].stock),i%W,(i/W)|0,T.id,true);a.town=ti}}
    }
    if(T.houses>=3&&T.fish<Math.min(3,1+((T.houses/6)|0))&&T.mat>=8&&R()<.004){
      const dock=findDock(T,pick(T.towns));
      if(dock>=0){makeBoat('fish',T,dock);T.mat-=8;sfx('splash',dock%W,(dock/W)|0)}
    }
    if(step%YEAR===T.id%YEAR)tendTowns(T);
    if(T.pop>=14&&T.houses>=5&&T.food>=T.pop+6&&T.towns.length<8&&R()<.0016*(1+T.fx.expand)*(T.pop>=26?2:1))settle(T);
  }
}
function rebalanceJobs(T){
  const tg=jobTargets(T),n=Math.max(8,T.pop);
  for(const j of JOB_KEYS){
    const have=T.jobs[j]||0,want=tg[j]*n;
    if(have>want*1.5+1){
      let drop=Math.ceil(have-want*1.2);
      for(const m of T.members)if(drop>0&&m.job===j&&!m.inside&&R()<.6){m.job=null;m.task=null;drop--}
    }
  }
  /* soldiers also stand down when the war is over, and the workshops fill up again */
}
const AGE_REQ=[null,T=>T.res.stone>=60,T=>T.res.copper>=70,T=>T.res.iron>=80,T=>T.res.coal>=60&&T.res.iron>=180,T=>T.res.gold>=60&&T.res.silver>=60];
const AGE_COL=[[170,130,80],[170,170,176],[214,128,64],[130,140,160],[190,200,220],[246,204,70]];
function checkAge(T){
  while(T.age<5&&AGE_REQ[T.age+1](T)){
    T.age++;
    log(`The ${T.title} entered the ${AGE_NAME[T.age]}. ${AGE_WHY[T.age]}`,AGE_COL[T.age],false,newsAt(T,'⚒️',T.age>1?2:1));
    const at=T.hall>=0?T.hall:-1;if(at>=0){effects.push({type:'rite',x:at%W+.5,y:((at/W)|0)+.5,c:AGE_COL[T.age],t:0,dur:80,big:true});sfx('fanfare',at%W,(at/W)|0)}
    T.fx=computeFx(T);
  }
}
function lineOK(x0,y0,x1,y1,ok){
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0));
  for(let k=0;k<=n;k++){const x=(x0+(x1-x0)*k/n)|0,y=(y0+(y1-y0)*k/n)|0;if(!inb(x,y)||!ok(y*W+x))return false}
  return true;
}
const farFromOthers=(j,d,T)=>{const x=j%W,y=(j/W)|0;return tribes.every(o=>o===T||!o.alive||o.towns.every(t=>Math.hypot(t.x-x,t.y-y)>d))};
const farFrom=(j,d)=>farFromOthers(j,d,null);
/* expansion: settlers found a new village that stays part of the same kingdom, under the same banner */
function addTown(T,x,y){
  const H={x,y,name:placeName(T.race),founded:year(),houses:0,pop:0};
  T.towns.push(H);T.colonies=T.towns.length-1;ownDirty=true;return H;
}
function settle(T){
  if(T.towns.length>=8)return;
  let si=0;T.towns.forEach((t,k)=>{if(t.pop>T.towns[si].pop)si=k});
  const src=T.towns[si];if(src.pop<10)return;
  const far=j=>T.towns.every(t=>Math.hypot(t.x-j%W,t.y-((j/W)|0))>15);
  const i=sampleNear(src.x,src.y,40,j=>fertile(j)&&(own[j]<0||own[j]===T.id)&&far(j)&&farFromOthers(j,22,T)&&lineOK(src.x,src.y,j%W,(j/W)|0,walk),200);
  if(i<0){seaSettle(T,si);return}
  const x=i%W,y=(i/W)|0,H=addTown(T,x,y),ti=T.towns.length-1;
  const adults=T.members.filter(m=>adult(m)&&!m.inside&&(m.town|0)===si);
  const movers=adults.sort(()=>R()-.5).slice(0,Math.max(5,Math.min(9,(adults.length*.4)|0)));
  for(const m of movers){m.town=ti;m.target=null;m.task=null;setT(m,i);m.cd=60}
  log(`Settlers of the ${T.title} founded the village of ${H.name}.`,T.color);sfx('fanfare',x,y);
}
/* a member of one of the smaller villages, so births are spread across the kingdom */
function pickSmallTown(T){
  const small=T.towns.findIndex((t,k)=>k>0&&t.pop>0&&t.pop<12&&R()<.6);if(small<0)return pick(T.members);
  for(let k=0;k<10;k++){const c=pick(T.members);if((c.town|0)===small)return c}
  return pick(T.members);
}
/* yearly: villages that emptied out are abandoned, and the capital sends a family to any village close to dying */
function tendTowns(T){
  for(let k=T.towns.length-1;k>=1;k--){
    const H=T.towns[k];
    if(H.pop===0&&H.houses===0&&year()-H.founded>=2){
      T.towns.splice(k,1);
      for(const u of units)if(u.k===0?u.tribe===T.id:u.owner===T.id){if((u.town|0)===k)u.town=0;else if((u.town|0)>k)u.town--}
      log(`The village of ${H.name} of the ${T.title} was abandoned.`,T.color,true);
    }
  }
  T.colonies=T.towns.length-1;
  let big=0;T.towns.forEach((t,k)=>{if(t.pop>T.towns[big].pop)big=k});
  T.towns.forEach((H,k)=>{
    if(k===big||H.pop>=4||T.towns[big].pop<10)return;
    let n=0;for(const m of T.members)if(n<2&&(m.town|0)===big&&adult(m)&&!m.inside&&R()<.3){m.town=k;m.task=null;m.target=null;setT(m,H.y*W+H.x);m.cd=40;n++}
  });
}
function findDock(T,H){H=H||T.towns[0];return ringFind(H.x,H.y,12,i=>bio(hgt[i])===1)}
function makeBoat(kind,T,dock){
  const x=dock%W+.5,y=((dock/W)|0)+.5;
  const b={id:uid++,kind,tribe:T.id,race:T.race,ci:T.ci,x,y,px:x,py:y,tx:x,ty:y,hx:x,hy:y,dir:1,t:0,dead:false,path:null,pi:0,pass:[],land:-1};
  boats.push(b);return b;
}
/* breadth-first search over the sea for free land; the buffers are reused and each shore tile is judged once */
const srPrev=new Int32Array(N),srDist=new Int32Array(N),srQ=new Int32Array(N),srSeen=new Uint8Array(N);
function seaRoute(start){
  const prev=srPrev.fill(-1),dist=srDist,q=srQ;srSeen.fill(0);
  let h=0,t=0;q[t++]=start;prev[start]=start;dist[start]=0;
  while(h<t){
    const i=q[h++],x=i%W,y=(i/W)|0;
    for(let k=0;k<4;k++){
      const X=x+N4[k][0],Y=y+N4[k][1];if(!inb(X,Y))continue;const j=Y*W+X;
      if(dist[i]>=14&&!srSeen[j]&&fertile(j)&&own[j]<0&&(srSeen[j]=1)&&farFrom(j,26)){
        const path=[];let c=i;while(c!==start){path.push(c);c=prev[c]}path.reverse();
        return {path,land:j};
      }
      if(prev[j]<0&&isWater(j)){prev[j]=i;dist[j]=dist[i]+1;q[t++]=j}
    }
  }
  return null;
}
function seaSettle(T,si){
  if(boats.some(b=>!b.dead&&b.kind==='settler'&&b.tribe===T.id))return;
  si=si|0;const dock=findDock(T,T.towns[si]);if(dock<0)return;
  const adults=T.members.filter(m=>adult(m)&&!m.inside&&(m.town|0)===si);if(adults.length<8)return;
  const route=seaRoute(dock);if(!route)return;
  const movers=adults.sort(()=>R()-.5).slice(0,5),ms=new Set(movers);
  units=units.filter(u=>!ms.has(u));
  for(const m of movers){m.task=null;m.target=null}
  const b=makeBoat('settler',T,dock);b.path=route.path;b.land=route.land;b.pass=movers;
  log(`Settlers of the ${T.title} set sail across the sea.`,T.color);sfx('horn',b.x,b.y);
}
function moveBoat(b,spd){
  const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);
  if(Math.abs(dx)>.05)b.dir=dx>0?1:-1;
  if(d<=spd){b.x=b.tx;b.y=b.ty;return true}
  const nx=b.x+dx/d*spd,ny=b.y+dy/d*spd;
  if(!inb(nx|0,ny|0)||!isWater((ny|0)*W+(nx|0)))return null;
  b.x=nx;b.y=ny;return false;
}
function updateBoats(){
  let any=false;
  for(const b of boats){
    if(b.dead){any=true;continue}
    const T=tribes[b.tribe];
    if(!isWater(tileOf(b))){b.dead=true;any=true;continue}
    if(b.kind==='fish'){
      if(!T.alive){b.dead=true;any=true;continue}
      const r=moveBoat(b,.06);
      if(r!==false){
        const j=sampleNear(b.hx,b.hy,12,k=>isWater(k)&&lineOK(b.x,b.y,k%W,(k/W)|0,isWater),20);
        if(j>=0){b.tx=j%W+.5;b.ty=((j/W)|0)+.5}
      }
      if(++b.t%180===0&&Math.hypot(b.x-b.hx,b.y-b.hy)<30)T.food+=2;
    }else{
      if(b.pi>=b.path.length){landSettlers(b);any=true;continue}
      const j=b.path[b.pi];b.tx=j%W+.5;b.ty=((j/W)|0)+.5;
      const r=moveBoat(b,.13);
      if(r===true)b.pi++;else if(r===null){b.dead=true;any=true;log(`A settler ship of the ${T.title} was lost at sea.`,T.color)}
    }
  }
  if(any)boats=boats.filter(b=>!b.dead);
}
function landSettlers(b){
  const T=tribes[b.tribe],x=b.land%W,y=(b.land/W)|0;
  if(!T.alive){b.dead=true;return}
  const H=addTown(T,x,y),ti=T.towns.length-1;
  for(const m of b.pass){m.town=ti;m.x=m.px=x+.3+R()*.4;m.y=m.py=y+.3+R()*.4;m.tx=m.x;m.ty=m.y;m.cd=0;units.push(m)}
  log(`Settlers from the ${T.title} landed on new shores and founded the village of ${H.name}.`,T.color,false,{x:x+.5,y:y+.5,ic:'⛵',p:1});
  sfx('fanfare',x,y);
  b.dead=true;
}

/* ---------- fire, lava, growth ---------- */
function ignite(i,force){
  if(fire[i]||lava[i])return;
  const b=bio(hgt[i]);if(b<2||b>=5)return;
  const fuel=tree[i]||bld[i]!==-1;
  if(!fuel&&!force&&!((b===3||b===4)&&R()<.12*(1-WX.rain)))return;
  fire[i]=fuel?(30+R()*35)|0:(8+R()*8)|0;fires.add(i);
}
function destroyBld(i){
  if(bld[i]>=0){
    const T=tribes[bld[i]];
    if(btype[i]===4){T.monuments=Math.max(0,T.monuments-1);const a=T.arts.find(x=>x.i===i);if(a)a.lost=year()}else T.houses=Math.max(0,T.houses-1);
    if(btype[i]===1&&T.hall===i)T.hall=-1;
    if(btype[i]===2){T.temple=false;T.templeAt=-1}
  }
  if(bld[i]!==-1){bDirty=true;ownDirty=true;markDirty(i)}
  bld[i]=-1;btype[i]=0;
}
function burn(i,dur){burnt[i]=step+dur;burnSet.add(i);markTile(i)}
function updateFire(){
  const wet=WX.rain>.3?.012*WX.rain:0;
  for(const i of [...fires]){
    if(!fire[i]){fires.delete(i);continue}
    fire[i]--;
    if(wet&&R()<wet)fire[i]=0;
    if(R()<.3*(1-WX.rain*.6)){
      const [dx,dy]=N8[(R()*8)|0],x=i%W+dx,y=((i/W)|0)+dy;
      if(inb(x,y)){const j=y*W+x;if(tree[j]||bld[j]!==-1){if(R()<.6)ignite(j)}else ignite(j)}
    }
    if(!fire[i]){
      tree[i]=0;if(bld[i]!==-1)destroyBld(i);
      burn(i,1200+((R()*1200)|0));fires.delete(i);
    }
  }
  for(const i of [...lavas]){
    if(!lava[i]){lavas.delete(i);continue}
    lava[i]-=WX.rain>.3?3:1;if(lava[i]>60000)lava[i]=0;
    if(R()<.05){const [dx,dy]=N8[(R()*8)|0],x=i%W+dx,y=((i/W)|0)+dy;if(inb(x,y))ignite(y*W+x)}
    if(!lava[i]){hgt[i]=Math.max(hgt[i],.76);lavas.delete(i);burn(i,800);markDirty(i)}
  }
}
function growth(){
  const n=WX.rain>.3?120:80;
  for(let k=0;k<n;k++){
    const i=(R()*N)|0;
    if(tree[i]&&R()<.03){
      const [dx,dy]=N8[(R()*8)|0],x=i%W+dx,y=((i/W)|0)+dy;
      if(inb(x,y)){const j=y*W+x;if(fertile(j)&&!tree[j]&&bld[j]===-1&&!fire[j]&&burnt[j]<=step&&!nearBld(j)&&!(bm[j]===BM.ROCK&&R()<.85)){tree[j]=1;markTile(j)}}
    }else if(!tree[i]&&R()<.0006*(bm[i]===BM.FOREST?6:bm[i]===BM.ROCK?.15:bm[i]?BIOMES[bm[i]].trees*1.5+.3:1)&&fertile(i)&&bld[i]===-1&&burnt[i]<=step&&!fire[i]&&!nearBld(i)){tree[i]=1;markTile(i)}
    if(bld[i]===-2&&R()<.01){bld[i]=-1;btype[i]=0;bDirty=true;markDirty(i)}
    if(bm[i])biomeLife(i);
  }
  if(step%40===0)for(const i of burnSet){
    if(burnt[i]<=step){burnSet.delete(i);markTile(i)}
    else if(burnt[i]-step<640)markTile(i);
  }
}

/* biomes creep outward and some of them give birth to creatures */
const AGGR_BM=new Set([BM.CORRUPT,BM.WASTE,BM.PARA]);
const WILD_PICK=SPECIES_KEYS.filter(k=>!SPECIES[k].monster&&!SPECIES[k].dom&&k!=='eagle'&&k!=='wolf'&&k!=='bear');
function spawnMon(sp,i){if(units.length<1500&&(cnt.sp[sp]||0)<SPECIES[sp].cap){addAnimal(sp,i%W,(i/W)|0);cnt.sp[sp]=(cnt.sp[sp]||0)+1}}
function biomeLife(i){
  const b=bm[i],B=BIOMES[b];
  if(B.spread&&R()<B.spread){
    const [dx,dy]=N8[(R()*8)|0],x=i%W+dx,y=((i/W)|0)+dy;
    if(inb(x,y)){
      const j=y*W+x,bj=bio(hgt[j]);
      if((bj===3||bj===4)&&bm[j]!==b&&bld[j]===-1&&!nearBld(j)&&(bm[j]===0||bm[j]===BM.FOREST||(AGGR_BM.has(b)&&bm[j]!==BM.WASTE&&bm[j]!==BM.CORRUPT)||(b===BM.WASTE&&R()<.3))){
        setBiome(j,b,B.trees*.4);
      }
    }
  }
  if(b===BM.CORRUPT){
    if(R()<.006)spawnMon('skeleton',i);else if(R()<.0015)spawnMon('zombie',i);
  }else if(b===BM.JUNGLE){if(R()<.002)spawnMon('spider',i)}
  else if(b===BM.PARA){if(R()<.0015&&units.length<1500){const sp=pick(WILD_PICK);addAnimal(sp,i%W,(i/W)|0)}}
}
function setBiome(i,b,treeP){
  bm[i]=b;
  if(b===BM.WASTE||b===BM.CORRUPT){if(R()<.5)tree[i]=0}
  if(treeP!=null&&!tree[i]&&bld[i]===-1&&R()<treeP&&bio(hgt[i])<=4&&!ore[i])tree[i]=1;
  else if(treeP!=null&&tree[i]&&R()<.5&&BIOMES[b].trees<.1)tree[i]=0;
  if(BIOMES[b].gems&&R()<BIOMES[b].gems&&!ore[i]&&bld[i]===-1){ore[i]=ORE.GEMS;oreAmt[i]=20+((R()*25)|0)}
  markDirty(i);
}

/* ---------- time & weather ---------- */
function setWeather(type){
  WX.type=type;WX.until=step+900+((R()*1800)|0);WX.wind=(R()<.5?-1:1)*(.5+R());
  if(type==='storm')log('A storm is rolling in.',[120,140,200]);
  if(type==='snow')log('Snow begins to fall.',[200,210,240]);
}
function updateLight(){
  tod=((step+DAY*.3)%DAY)/DAY;
  sunH=Math.sin((tod-.25)*Math.PI*2);
  light=smooth(-.28,.3,sunH);
}
function updateTimeWeather(){
  updateLight();
  if(step>=WX.until){
    const sw=SEASON_WX[season()];let tot=0;for(const k of WT_KEYS)tot+=WTYPES[k].w*(sw[k]??1);
    let r=R()*tot,t='clear';for(const k of WT_KEYS){r-=WTYPES[k].w*(sw[k]??1);if(r<=0){t=k;break}}
    setWeather(t);
  }
  const tg=WTYPES[WX.type].t;
  for(const k of ['cloud','rain','snow','fog','storm'])WX[k]+=((tg[k]||0)-WX[k])*.004;
  if(WX.storm>.5&&R()<.004*WX.storm){
    const i=randomLand(j=>!isWater(j),60);
    if(i>=0)strike({x:i%W+.5,y:((i/W)|0)+.5},true);
  }
}
const phaseName=()=>tod<.2||tod>=.82?'Night':tod<.3?'Dawn':tod<.45?'Morning':tod<.56?'Noon':tod<.72?'Afternoon':'Dusk';
const phaseIcon=()=>({Night:'🌙',Dawn:'🌅',Morning:'🌤️',Noon:'☀️',Afternoon:'🌤️',Dusk:'🌇'})[phaseName()];

/* ---------- history ---------- */
function yearly(){
  const y=year();
  culturalYear();
  /* wild animals wander in from beyond the map edge when numbers run low */
  for(const sp of ['wolf','bear','fox','deer','rabbit']){
    const S=SPECIES[sp];
    if((cnt.sp[sp]||0)<S.cap*.2&&R()<.35){
      const i=randomLand(j=>fertile(j)&&farFrom(j,30)&&(sp!=='bear'||bio(hgt[j])===4),200);
      if(i>=0)for(let m=0;m<(sp==='bear'?1:3);m++)addAnimal(sp,i%W,(i/W)|0);
    }
  }
  for(const w of wars.slice())if(y>=w.until){
    wars.splice(wars.indexOf(w),1);
    log(`The ${tribes[w.a].title} and the ${tribes[w.b].title} made peace.`,[120,190,120],false,newsAt(tribes[w.b],'🕊️',1));
  }
  diplomacyYear();
  storyYear();
  for(const T of tribes){
    if(!T.alive||!T.temple||T.templeAt<0)continue;
    const cx=T.templeAt%W,cy=(T.templeAt/W)|0;let n=0;
    for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){
      const X=cx+dx,Y=cy+dy;if(!inb(X,Y)||dx*dx+dy*dy>64)continue;
      const j=Y*W+X;if((bm[j]===BM.CORRUPT||(bm[j]===BM.WASTE&&T.age>=3))&&R()<.35){bm[j]=0;markDirty(j);n++}
    }
    if(n>3)log(`The temple of the ${T.title} cleansed the land of its blight.`,DOMAINS[T.rel.domain].c,true);
  }
}
/* a big event can carry a place (at) so the interface can call it out on the map */
const newsAt=(T,ic,p)=>({x:T.cx+.5,y:T.cy+.5,ic,p});
function log(m,c,local,where){
  const col=c||[150,140,170];
  if(!local){logs.unshift({y:year(),m,c:col});if(logs.length>240)logs.pop();logDirty=true}
  if(where&&!local){news.push({y:year(),m,c:col,x:where.x,y2:where.y,ic:where.ic,p:where.p,s:step});if(news.length>24)news.shift()}
  for(const T of tribes)if(T.hist&&m.includes(T.title)){T.hist.unshift({y:year(),m,c:col});if(T.hist.length>70)T.hist.pop()}
}

function simStep(){
  for(const u of units){u.px=u.x;u.py=u.y}
  for(const b of boats){b.px=b.x;b.py=b.y}
  step++;
  updateTimeWeather();
  updateUnits();updateTribes();updateBoats();updateFire();growth();updateWorldFx();
  /* a burst of building only redraws borders every 10 steps */
  if(ownDirty&&step-lastDomains>=10||step-lastDomains>=40)computeDomains();
  if(step%YEAR===0)yearly();
}

/* ---------- world generation ---------- */
function genBiomes(){
  const picks=[BM.SAV,BM.BIRCH,BM.JUNGLE,BM.FLOWER,BM.CLOVER,BM.FOREST,BM.ROCK,BM.LEMON,BM.SAV,BM.FOREST];
  const cs=[];
  for(let k=0;k<picks.length;k++){const c=randomLand(j=>fertile(j),400);if(c>=0)cs.push({x:c%W,y:(c/W)|0,r:9+R()*13,b:picks[k]})}
  for(let i=0;i<N;i++){
    const b0=bio(hgt[i]);if(b0!==3&&b0!==4)continue;
    const x=i%W,y=(i/W)|0,nz=fbm(x/7+900,y/7+900,3);
    let best=null,bs=1;
    for(const c of cs){const d=Math.hypot(c.x-x,c.y-y)/(c.r*(.65+nz*.7));if(d<bs){bs=d;best=c}}
    if(!best||(best.b===BM.ROCK&&b0!==4))continue;
    bm[i]=best.b;const B=BIOMES[best.b];
    tree[i]=R()<B.trees?1:(R()<.2?tree[i]:0);
  }
}
function oreVeins(type,count,pred,rad,amt){
  for(let k=0;k<count;k++){
    const c=randomLand(pred,2500);if(c<0)continue;
    const cx=c%W,cy=(c/W)|0,r=rad*(.7+R()*.6);
    for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
      const X=cx+dx,Y=cy+dy;if(!inb(X,Y)||Math.hypot(dx,dy)>r*(.55+R()*.5))continue;
      const j=Y*W+X,b=bio(hgt[j]);
      if(b>=3&&b<=5&&!ore[j]){ore[j]=type;oreAmt[j]=amt+((R()*22)|0);tree[j]=0}
    }
  }
}
function genOres(){
  const hi=j=>bio(hgt[j])>=4&&bio(hgt[j])<=5,mt=j=>bio(hgt[j])===5,any=j=>bio(hgt[j])>=3&&bio(hgt[j])<=5;
  oreVeins(ORE.STONE,16,hi,2.2,34);oreVeins(ORE.STONE,10,any,1.6,30);
  oreVeins(ORE.COPPER,14,hi,2,30);oreVeins(ORE.IRON,12,hi,2,32);oreVeins(ORE.COAL,10,hi,2,30);
  oreVeins(ORE.SILVER,7,mt,1.5,26);oreVeins(ORE.GOLD,6,mt,1.4,24);
}
/* what a new or loaded world starts without: derived layers, caches, transient effects and the storyteller's memory */
function resetWorldState(){
  own=new Int16Array(N).fill(-1);ownScore=new Float32Array(N).fill(9);ownDirty=true;ovDirty=true;lastDomains=-99;ownSnap=null;
  fires=new Set();lavas=new Set();burnSet=new Set();news=[];effects=[];story=newStory();
  bList=[];bDirty=true;logDirty=true;volcanoes.length=0;wfx.length=0;monoliths.length=0;dipPending=null;
}
function genWorld(seedText){
  worldSeed=seedText!=null&&String(seedText).trim()?String(seedText).trim().slice(0,40):randomSeed();
  rngS=seedValue(worldSeed);
  seedNoise();
  hgt=new Float32Array(N);tree=new Uint8Array(N);fire=new Uint8Array(N);lava=new Uint16Array(N);
  bld=new Int16Array(N).fill(-1);btype=new Uint8Array(N);burnt=new Uint32Array(N);
  bm=new Uint8Array(N);ore=new Uint8Array(N);oreAmt=new Uint8Array(N);btier=new Uint8Array(N);
  resetWorldState();
  units=[];tribes=[];religions=[];boats=[];step=0;logs=[];wars=[];alliances=[];
  WX.type='clear';WX.until=900;WX.cloud=WX.rain=WX.snow=WX.fog=WX.storm=0;
  const ox=R()*100,oy=R()*100;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x,nx=x/W-.5,ny=y/H-.5,d=Math.hypot(nx*1.3,ny*1.7);
    let e=fbm(x/38+ox,y/38+oy);e=(e-.5)*1.9+.5;
    hgt[i]=Math.max(0,Math.min(1,.16+e*.9-d*d*.95));
  }
  for(let i=0;i<N;i++){
    const x=i%W,y=(i/W)|0;
    if(fertile(i)&&((fbm(x/12+500,y/12+500,3)>.53&&R()<.7)||R()<.03))tree[i]=1;
  }
  genBiomes();genOres();
  const spots=[];
  const placeRace=r=>{
    const ok=j=>{
      if(!fertile(j)||tree[j])return false;
      const x=j%W,y=(j/W)|0;
      if(spots.some(s=>Math.hypot(s[0]-x,s[1]-y)<34))return false;
      if(r==='dwarf')return bio(hgt[j])===4&&ringFind(x,y,8,k=>bio(hgt[k])===5)>=0;
      return true;
    };
    let i=randomLand(ok);
    if(i<0)i=randomLand(j=>fertile(j)&&!tree[j]);
    if(i<0)return;
    const x=i%W,y=(i/W)|0;spots.push([x,y]);
    const T=newTribe(r,x,y);
    for(let k=0;k<6;k++)addPerson(T,x,y);
    log(`The ${T.title} awoke in the world.`,T.color);
    if(r==='human')startFocus=[x+.5,y+.5];
  };
  RACE_KEYS.filter(r=>!RACES[r].uplift).forEach(placeRace);
  const herd=(sp,groups,size,pred)=>{for(let k=0;k<groups;k++){const i=randomLand(j=>(pred?pred(j):fertile(j))&&farFrom(j,sp==='wolf'||sp==='bear'?35:8));if(i>=0)for(let m=0;m<size;m++)addAnimal(sp,i%W,(i/W)|0)}};
  herd('sheep',8,3);herd('deer',7,3,j=>fertile(j)&&ringFind(j%W,(j/W)|0,3,k=>tree[k])>=0);herd('rabbit',10,3);
  herd('wolf',3,3);herd('bear',3,1,j=>bio(hgt[j])===4);herd('fox',4,1);herd('horse',3,3);
  herd('buffalo',3,3,j=>bm[j]===BM.SAV||fertile(j));herd('crow',5,3,j=>!isWater(j));herd('eagle',2,1,j=>!isWater(j));herd('rat',3,2);
  herd('crab',5,2,j=>bio(hgt[j])===2);herd('turtle',3,1,j=>bio(hgt[j])===2||bio(hgt[j])===1);
  updateUnits();
  initTerrain();
}

/* ---------- god powers ---------- */
function spawnAt(p,kind){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
  const S0=SPECIES[kind];
  const i=S0&&S0.amph?ringFind(x,y,3,j=>bio(hgt[j])>=1&&bio(hgt[j])<=3):S0&&S0.fly?ringFind(x,y,2,j=>true):ringFind(x,y,2,walk);
  if(i<0){toast('They need dry land to stand on.');return}
  if(units.length>1600){toast('The world is crowded. Let nature thin things out first.');return}
  const tx=i%W,ty=(i/W)|0;
  if(RACES[kind]){
    let T=null,bd=18*18;
    const ow=own[ty*W+tx];
    if(ow>=0&&tribes[ow].alive){
      T=tribes[ow];bd=0;
      if(T.race!==kind){
        {const ti=nearestTown(T,tx,ty);for(let k=0;k<2;k++)addPerson(T,tx,ty,null,null,kind).town=ti}
        T.pop+=2;sfx('spawn',tx,ty);
        toast(`Two ${RACES[kind].plural.toLowerCase()} settled among the ${T.title}.`);
        log(`${RACES[kind].plural} arrived to live among the ${T.title}.`,T.color,true);
        return;
      }
    }
    for(const t of tribes){if(!t.alive||t.race!==kind)continue;const d=(t.cx-tx)**2+(t.cy-ty)**2;if(d<bd){bd=d;T=t}}
    if(!T){T=newTribe(kind,tx,ty);log(`The ${T.title} appeared in the world.`,T.color)}
    {const ti=nearestTown(T,tx,ty);for(let k=0;k<2;k++)addPerson(T,tx,ty).town=ti}
    T.pop+=2;sfx('spawn',tx,ty);
  }else{
    const S=SPECIES[kind];let owner=-1;
    if(S.dom){let bd=14*14;for(const t of tribes){if(!t.alive)continue;const d=(t.cx-tx)**2+(t.cy-ty)**2;if(d<bd){bd=d;owner=t.id}}}
    const n=kind==='bear'||kind==='dragon'||kind==='ogre'||kind==='eagle'?1:kind==='horse'||kind==='cow'||kind==='wolf'||kind==='buffalo'?2:3;
    for(let k=0;k<n;k++)addAnimal(kind,tx,ty,owner);
    sfx('cry',tx+.5,ty+.5,kind);
  }
}
function nearTribeText(x,y){
  let T=null,bd=30*30;
  for(const t of tribes){if(!t.alive)continue;const d=(t.cx-x)**2+(t.cy-y)**2;if(d<bd){bd=d;T=t}}
  return T?`near the ${T.title}`:'the wilds';
}
function impact(x,y){
  x|=0;y|=0;if(!inb(x,y))return;
  shake=reduceMotion?0:16;
  const wet=isWater(y*W+x);
  for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;
    const i=Y*W+X,d=Math.hypot(dx,dy);
    if(d<=5.5){
      destroyBld(i);tree[i]=0;if(fire[i]){fire[i]=0;fires.delete(i)}
      if(d<2.5&&!wet&&bio(hgt[i])>=2){lava[i]=(250+R()*200)|0;lavas.add(i)}
      else hgt[i]=Math.max(0,hgt[i]-.08*(1-d/6));
      burn(i,2500);markDirty(i);
    }else if(d<=9&&(tree[i]||bld[i]!==-1)&&R()<.55)ignite(i);
  }
  for(const u of units)if(Math.hypot(u.x-x,u.y-y)<6.5)die(u);
  for(const b of boats)if(Math.hypot(b.x-x,b.y-y)<6.5)b.dead=true;
  sfx('boom',x,y);
  log(`A meteor struck ${nearTribeText(x,y)}.`,[236,120,40]);
  omen(x,y);
}
function strike(p,natural){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
  const pts=[];const px=x+(R()-.5)*10,py=y-38;
  for(let k=0;k<=8;k++){const t=k/8;pts.push([px+(x+.5-px)*t+(k&&k<8?(R()-.5)*4:0),py+(y+.5-py)*t])}
  effects.push({type:'bolt',pts,t:0,dur:14});
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const i=Y*W+X;
    if(!natural||R()<.5)ignite(i,true);if(bld[i]>=0&&R()<.5)destroyBld(i);
  }
  for(const u of units)if(Math.hypot(u.x-x-.5,u.y-y-.5)<1.8&&!u.inside)die(u);
  for(const b of boats)if(Math.hypot(b.x-x-.5,b.y-y-.5)<1.8)b.dead=true;
  sfx('thunder',x,y);
  if(!reduceMotion)shake=Math.max(shake,4);
}
function afterH(i){
  hgt[i]=Math.max(0,Math.min(1,hgt[i]));
  const b=bio(hgt[i]);
  if(b!==3&&b!==4&&bm[i])bm[i]=0;
  if(bm[i]===BM.ROCK&&b!==4)bm[i]=0;
  if(b<2||b===6)ore[i]=0;
  if(b<2||b>=5){
    tree[i]=0;
    if(b<2||b===6){if(bld[i]!==-1)destroyBld(i);if(fire[i]){fire[i]=0;fires.delete(i)}if(lava[i]&&b<2){lava[i]=0;lavas.delete(i)}}
  }
  markDirty(i);
}
function brushAt(cx,cy,r,fn){
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const d=Math.hypot(dx,dy);if(d>r+.3)continue;
    const X=(cx|0)+dx,Y=(cy|0)+dy;if(!inb(X,Y))continue;
    fn(Y*W+X,r?d/r:0);
  }
}
function applyBrush(p,dt){
  const f=BRUSHFN[tool];if(f)f(p,brushSize-1,dt/16.7);
}
