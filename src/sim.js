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
    nextFest:year()+3,bless:0,frenzy:0,legendIdx:(R()*2)|0,fx:zeroFx()};
  tribes.push(T);
  T.fx=computeFx(T);
  if(schism)log(`A schism split the ${parent.title}: the ${T.title} turned to the ${rel.name}, in the name of ${rel.patron.name}.`,DOMAINS[rel.domain].c);
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
  u.age=baby?0:(YEAR*2+R()*u.life*.3)|0;u.spd=S.spd;u.v=(R()*4)|0;u.male=R()<.5;
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
function addPerson(T,x,y,pa,pb){
  const r=T.race,L=RACES[r];pb=pb||pa;
  const u=mkUnit(0,x,y);
  u.race=r;u.tribe=T.id;
  u.genes=pa?childGenes(pa.genes,pb.genes,r):randGenes(r);
  u.traits=pa?childTraits(pa.traits,pb.traits):(R()<.5?[pick(TRAIT_KEYS)]:[]);
  u.name=personName(r);u.gen=pa?Math.max(pa.gen,pb.gen)+1:1;
  u.parents=pa?(pa===pb?pa.name:`${pa.name} and ${pb.name}`):null;
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
  if(u.k===0&&u.kills>=5){const T=tribes[u.tribe];log(`${u.name}, hero of the ${T.title}, has fallen after ${u.kills} victories.`,T.color);T.heroes.push({name:u.name,kills:u.kills,y:year()});T.renown+=1}
}
function setT(u,i){u.tx=(i%W)+.5;u.ty=((i/W)|0)+.5}
function wander(u,cx,cy,r){const i=sampleNear(cx,cy,r,walk,15);if(i>=0)setT(u,i)}
function moveToward(u,spd){
  const dx=u.tx-u.x,dy=u.ty-u.y,d=Math.hypot(dx,dy);
  if(Math.abs(dx)>.05)u.dir=dx>0?1:-1;
  if(d<=spd){u.x=u.tx;u.y=u.ty;return true}
  const nx=u.x+dx/d*spd,ny=u.y+dy/d*spd;
  if(!inb(nx|0,ny|0)||!walk((ny|0)*W+(nx|0))){u.target=null;u.task=null;u.cd=0;wander(u,u.x,u.y,5);return false}
  u.x=nx;u.y=ny;u.moving=true;return false;
}
function hit(t,dmg,src){
  if(t.k===0){const df=tribes[t.tribe].fx;if(df.def)dmg/=1+df.def}
  if(src.k===0&&t.k===0){const sf=tribes[src.tribe].fx;
    if(sf.raze&&R()<.12*sf.raze){const b=ringFind(t.x,t.y,3,i=>bld[i]===t.tribe&&btype[i]<4&&!fire[i]);if(b>=0)ignite(b,true)}}
  t.hp-=dmg;
  sfx(src.k===0&&t.k===0?'clang':'thud',t.x,t.y);
  if(t.hp<=0){
    die(t);
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
const isThreat=v=>v.k===1&&SPECIES[v.sp].pred&&v.sp!=='fox';
function enemyNear(u,r){return nearest(u,r,v=>isThreat(v)||(v.k===0&&v.tribe!==u.tribe&&hostile(v.tribe,u.tribe)))}

/* ---------- people ---------- */
function updPerson(u){
  const T=tribes[u.tribe],fx=T.fx;
  if(fx.regen&&u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+fx.regen*.05);
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
      if(u.task&&++u.busy<20){if(adult(u)){const e=enemyNear(u,4);if(e){u.target=e;u.task='fight'}}}
      else{u.busy=0;decide(u,T)}
    }
  }
  const sp=u.spd*(1+fx.spd);
  if(u.target){
    let dm=u.dmg*(1+fx.dmg);
    if(RACES[u.race].range>2)dm*=1+fx.ranged;
    if(fx.frenzy&&u.hp<u.maxhp*.5)dm*=1+fx.frenzy;
    if(T.frenzy>step)dm*=1.25;
    chase(u,sp*1.1,dm,u.task==='butcher'||u.task==='hunt'?Math.min(1.2,RACES[u.race].range):RACES[u.race].range);return;
  }
  if(moveToward(u,sp)&&u.task)doTask(u,T);
}
function decide(u,T){
  const kid=!adult(u);
  if(!kid){const e=enemyNear(u,u.traits.includes('Brave')?9:6);if(e){u.target=e;u.task='fight';return}}
  if(isNight()&&R()<.85&&T.houses>0){
    const h=sampleNear(T.cx,T.cy,Math.min(18,4+Math.sqrt(T.houses)*2.2),i=>bld[i]===T.id&&btype[i]<2,40);
    if(h>=0){setT(u,h);u.task='sleep';return}
  }
  const forage=()=>{
    const t=sampleNear(T.cx,T.cy,10,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&!fire[i],30);
    if(t>=0){setT(u,t);u.task='forage';return true}return false;
  };
  if(kid){if(R()<.4&&forage())return;u.task=null;wander(u,T.cx,T.cy,5);return}
  const getFood=()=>{
    if(T.stock>T.houses&&R()<.35){
      const a=nearest(u,16,v=>v.k===1&&v.owner===T.id&&v.sp!=='horse'&&adult(v));
      if(a){u.target=a;u.task='butcher';return true}
    }
    if(R()<(u.race==='orc'?.65:.35)){
      const s=nearest(u,14,v=>v.k===1&&!SPECIES[v.sp].pred&&v.owner<0);
      if(s){u.target=s;u.task='hunt';return true}
    }
    return forage();
  };
  const r=R();
  if(T.food<T.pop*2+3&&getFood())return;
  if(r<.45&&tryBuild(u,T))return;
  if(r<.75&&T.mat<16&&getMat(u,T))return;
  if(u.race==='elf'&&R()<.15){
    const t=sampleNear(T.cx,T.cy,13,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&burnt[i]<=step&&!nearBld(i),20);
    if(t>=0){setT(u,t);u.task='plant';return}
  }
  if(T.food<T.pop*5+10&&getFood())return;
  u.task=null;wander(u,T.cx,T.cy,7);
}
function nearBld(i){const x=i%W,y=(i/W)|0;for(const [dx,dy] of N8){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return true}return false}
function getMat(u,T){
  if(u.race==='dwarf'){const t=ringFind(u.x,u.y,16,i=>bio(hgt[i])===5);if(t>=0){setT(u,t);u.task='mine';return true}}
  const t=ringFind(u.x,u.y,14,i=>tree[i]&&!fire[i]);
  if(t>=0){setT(u,t);u.task=u.race==='elf'?'gather':'chop';return true}
  const s=ringFind(u.x,u.y,10,i=>bio(hgt[i])===5);
  if(s>=0){setT(u,s);u.task='mine';return true}
  return false;
}
function bCost(T,type){const b=type===1?Math.max(4,RACES[T.race].cost):type===2?10:RACES[T.race].cost;return Math.max(2,Math.ceil(b*(1-clamp(T.fx.craft,0,.6))))}
function tryBuild(u,T){
  let type=0;
  if(T.hall<0)type=1;
  else if(T.houses>=6&&!T.temple)type=2;
  else if(T.houses>=Math.ceil(T.pop/3)+1)return false;
  if(T.mat<bCost(T,type))return false;
  const rad=type===1?4:Math.min(18,4+Math.sqrt(T.houses)*2.2);
  const t=sampleNear(T.cx,T.cy,rad,i=>canBuild(i,T.race),60);
  if(t<0)return false;
  setT(u,t);u.task='build';u.btype=type;return true;
}
function canBuild(i,race){
  if(fire[i]||lava[i]||tree[i]||bld[i]!==-1||burnt[i]>step)return false;
  const b=bio(hgt[i]);if(!(b===3||b===4||(race==='dwarf'&&b===5)))return false;
  const x=i%W,y=(i/W)|0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(inb(X,Y)&&bld[Y*W+X]!==-1)return false}
  return true;
}
function doTask(u,T){
  const i=tileOf(u);
  switch(u.task){
    case'forage':if(fertile(i)&&R()<.85)T.food+=gain((u.traits.includes('Wise')?2:1)*(1+T.fx.food));break;
    case'chop':if(tree[i]&&!fire[i]){tree[i]=0;markTile(i);T.mat+=3;sfx('chop',u.x,u.y)}break;
    case'gather':if(tree[i]){T.mat+=2;sfx('rustle',u.x,u.y)}break;
    case'mine':if(bio(hgt[i])===5){T.mat+=gain(3*(1+T.fx.mine));sfx('mine',u.x,u.y)}break;
    case'plant':if(fertile(i)&&!tree[i]&&bld[i]===-1){tree[i]=1;markTile(i)}break;
    case'sleep':if(bld[i]===T.id&&isNight()){u.inside=true;u.home=i;u.px=u.x;u.py=u.y;return}break;
    case'build':{
      const type=u.btype||0,cost=bCost(T,type);
      if(T.mat<cost||!canBuild(i,T.race))break;
      if(type===1&&T.hall>=0)break;
      if(type===2&&T.temple)break;
      bld[i]=T.id;btype[i]=type;T.houses++;T.mat-=cost;bDirty=true;sfx('build',u.x,u.y);
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
  u.hunger++;
  const i=tileOf(u);
  if(!S.pred&&fertile(i)&&R()<.06)u.hunger=Math.max(0,u.hunger-30);
  if(u.hunger>(S.pred?2400:1800)){die(u);return}
  if(u.owner>=0&&!tribes[u.owner].alive)u.owner=-1;
  if(u.target&&u.target.dead)u.target=null;
  if(--u.cd<=0){
    u.cd=15+((R()*25)|0);u.mode=0;
    if(S.pred){
      if(!u.target){
        const night=isNight();
        if(u.hunger>(night?200:350)){
          let p=nearest(u,12,v=>v.k===1&&S.prey.includes(v.sp));
          if(!p&&S.people&&u.hunger>(night?S.people*.7:S.people))p=nearest(u,10,v=>v.k===0);
          if(p)u.target=p;
        }
        if(!u.target&&S.territorial){const p=nearest(u,3,v=>v.k===0&&adult(v));if(p&&R()<.5){u.target=p;sfx('cry',u.x,u.y,u.sp)}}
      }
      if(!u.target)wander(u,u.x,u.y,7);
    }else{
      const thr=nearest(u,5,v=>(v.k===1&&SPECIES[v.sp].pred&&SPECIES[v.sp].prey.includes(u.sp))||(S.wild&&v.k===0&&adult(v)&&R()<.4));
      if(thr){u.tx=u.x+(u.x-thr.x)*2.5;u.ty=u.y+(u.y-thr.y)*2.5;u.mode=1;u.cd=12}
      else if(u.owner>=0){const T=tribes[u.owner];const r=Math.min(16,8+Math.sqrt(T.houses)*1.5);if(Math.hypot(u.x-T.cx,u.y-T.cy)>r)wander(u,T.cx,T.cy,r*.7);else wander(u,u.x,u.y,4)}
      else wander(u,u.x,u.y,6);
    }
  }
  if(adult(u)&&u.hunger<400&&(cnt.sp[u.sp]||0)<S.cap&&R()<S.breed){addAnimal(u.sp,u.x|0,u.y|0,u.owner,true);cnt.sp[u.sp]=(cnt.sp[u.sp]||0)+1}
  if(u.target){chase(u,S.chase,S.dmg,1.2);return}
  moveToward(u,u.mode?S.flee:S.spd);
}

function updateUnits(){
  rebuildGrid();
  let dead=false;
  for(const u of units){
    if(u.dead){dead=true;continue}
    u.age++;u.moving=false;
    if(!u.inside){
      const i=tileOf(u);
      if(lava[i]||!walk(i)||(fire[i]&&R()<.15)){die(u);dead=true;continue}
    }
    if(u.age>u.life){die(u);dead=true;continue}
    if(u.k===0)updPerson(u);else updAnimal(u);
    if(u.dead)dead=true;
  }
  if(dead)units=units.filter(u=>!u.dead);
  for(const T of tribes){T.pop=0;T.members.length=0;T.stock=0}
  const rc={human:0,elf:0,dwarf:0,orc:0},sp={};
  for(const u of units){
    if(u.k===0){const T=tribes[u.tribe];T.pop++;T.members.push(u);rc[u.race]++}
    else{sp[u.sp]=(sp[u.sp]||0)+1;if(u.owner>=0)tribes[u.owner].stock++}
  }
  cnt.race=rc;cnt.sp=sp;cnt.people=rc.human+rc.elf+rc.dwarf+rc.orc;
}

/* ---------- kingdoms ---------- */
function updateTribes(){
  for(const T of tribes)T.fish=0;
  for(const b of boats)if(!b.dead&&b.kind==='fish')tribes[b.tribe].fish++;
  for(const T of tribes){
    if(!T.alive)continue;
    if(T.pop===0){
      T.alive=false;
      for(let i=0;i<N;i++)if(bld[i]===T.id){bld[i]=-2;btype[i]=3}
      T.houses=0;T.hall=-1;bDirty=true;
      wars=wars.filter(w=>w.a!==T.id&&w.b!==T.id);alliances=alliances.filter(a=>a.a!==T.id&&a.b!==T.id);
      log(`The ${T.title} has fallen into ruin.`,T.color);
      continue;
    }
    if(R()<T.houses*.0025)T.food++;
    if(T.temple&&R()<.004)T.food++;
    if(R()<T.stock*.0015)T.food++;
    if((step+T.id)%20===0)T.fx=computeFx(T);
    if(T.stab>70&&R()<.002*T.houses)T.food++;
    if(T.fx.grow>0&&R()<.025*T.fx.grow){const g=sampleNear(T.cx,T.cy,14,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&burnt[i]<=step&&!fire[i]&&!nearBld(i),10);if(g>=0){tree[g]=1;markTile(g)}}
    culturalTick(T);
    if(T.food>=8&&T.pop<Math.min(70,T.houses*3+2)&&cnt.people<650&&T.members.length&&!isNight()){
      const m=pick(T.members);
      if(adult(m)&&!m.inside&&R()<.014*RACES[T.race].fert*(1+T.fx.fert)*(m.traits.includes('Fertile')?1.6:1)){
        let mate=pick(T.members);if(!adult(mate))mate=m;
        addPerson(T,m.x|0,m.y|0,m,mate);T.food-=8;
      }
    }
    if(T.houses>=3&&T.stock<Math.min(24,T.houses*1.2)&&R()<.004){
      const i=sampleNear(T.cx,T.cy,10,j=>walk(j)&&bld[j]===-1,20);
      if(i>=0)addAnimal(pick(RACES[T.race].stock),i%W,(i/W)|0,T.id,true);
    }
    if(T.houses>=3&&T.fish<Math.min(3,1+((T.houses/6)|0))&&T.mat>=8&&R()<.004){
      const dock=findDock(T);
      if(dock>=0){makeBoat('fish',T,dock);T.mat-=8;sfx('splash',dock%W,(dock/W)|0)}
    }
    if(T.pop>=28&&T.houses>=8&&R()<.001*(1+T.fx.expand))settle(T);
  }
}
function lineOK(x0,y0,x1,y1,ok){
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0));
  for(let k=0;k<=n;k++){const x=(x0+(x1-x0)*k/n)|0,y=(y0+(y1-y0)*k/n)|0;if(!inb(x,y)||!ok(y*W+x))return false}
  return true;
}
const farFrom=(j,d)=>{const x=j%W,y=(j/W)|0;return tribes.every(o=>!o.alive||Math.hypot(o.cx-x,o.cy-y)>d)};
function settle(T){
  const i=sampleNear(T.cx,T.cy,45,j=>fertile(j)&&farFrom(j,22)&&lineOK(T.cx,T.cy,j%W,(j/W)|0,walk),200);
  if(i<0){seaSettle(T);return}
  const x=i%W,y=(i/W)|0,NT=newTribe(T.race,x,y,T);
  NT.food=Math.floor(T.food/3);T.food-=NT.food;
  const movers=T.members.filter(m=>adult(m)&&!m.inside).sort(()=>R()-.5).slice(0,5);
  for(const m of movers){m.tribe=NT.id;m.target=null;m.task=null;setT(m,i);m.cd=60}
  NT.pop=movers.length;NT.members=movers;T.pop-=movers.length;T.members=T.members.filter(m=>m.tribe===T.id);
  log(`Settlers left the ${T.title} and founded the ${NT.title}.`,NT.color);
}
function findDock(T){return ringFind(T.cx,T.cy,12,i=>bio(hgt[i])===1)}
function makeBoat(kind,T,dock){
  const x=dock%W+.5,y=((dock/W)|0)+.5;
  const b={id:uid++,kind,tribe:T.id,race:T.race,ci:T.ci,x,y,px:x,py:y,tx:x,ty:y,hx:x,hy:y,dir:1,t:0,dead:false,path:null,pi:0,pass:[],land:-1};
  boats.push(b);return b;
}
function seaRoute(start){
  const prev=new Int32Array(N).fill(-1),dist=new Int32Array(N),q=new Int32Array(N);
  let h=0,t=0;q[t++]=start;prev[start]=start;
  while(h<t){
    const i=q[h++],x=i%W,y=(i/W)|0;
    for(const [dx,dy] of N4){
      const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const j=Y*W+X;
      if(dist[i]>=14&&fertile(j)&&farFrom(j,26)){
        const path=[];let c=i;while(c!==start){path.push(c);c=prev[c]}path.reverse();
        return {path,land:j};
      }
      if(prev[j]<0&&isWater(j)){prev[j]=i;dist[j]=dist[i]+1;q[t++]=j}
    }
  }
  return null;
}
function seaSettle(T){
  if(boats.some(b=>!b.dead&&b.kind==='settler'&&b.tribe===T.id))return;
  const dock=findDock(T);if(dock<0)return;
  const adults=T.members.filter(m=>adult(m)&&!m.inside);if(adults.length<10)return;
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
  const NT=newTribe(b.race,x,y,T);NT.food=14;NT.mat=8;
  for(const m of b.pass){m.tribe=NT.id;m.x=m.px=x+.3+R()*.4;m.y=m.py=y+.3+R()*.4;m.tx=m.x;m.ty=m.y;m.cd=0;units.push(m)}
  NT.pop=b.pass.length;NT.members=b.pass.slice();
  log(`Settlers from the ${T.title} landed on new shores and founded the ${NT.title}.`,NT.color);
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
  if(bld[i]!==-1)bDirty=true;
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
      if(inb(x,y)){const j=y*W+x;if(fertile(j)&&!tree[j]&&bld[j]===-1&&!fire[j]&&burnt[j]<=step&&!nearBld(j)){tree[j]=1;markTile(j)}}
    }else if(!tree[i]&&R()<.0006&&fertile(i)&&bld[i]===-1&&burnt[i]<=step&&!fire[i]&&!nearBld(i)){tree[i]=1;markTile(i)}
    if(bld[i]===-2&&R()<.01){bld[i]=-1;btype[i]=0;bDirty=true}
  }
  if(step%40===0)for(const i of burnSet){
    if(burnt[i]<=step){burnSet.delete(i);markTile(i)}
    else if(burnt[i]-step<640)markTile(i);
  }
}

/* ---------- time & weather ---------- */
function setWeather(type){
  WX.type=type;WX.until=step+900+((R()*1800)|0);WX.wind=(R()<.5?-1:1)*(.5+R());
  if(type==='storm')log('A storm is rolling in.',[120,140,200]);
  if(type==='snow')log('Snow begins to fall.',[200,210,240]);
}
function updateTimeWeather(){
  tod=((step+DAY*.3)%DAY)/DAY;
  sunH=Math.sin((tod-.25)*Math.PI*2);
  light=smooth(-.28,.3,sunH);
  if(step>=WX.until){
    let r=R(),t='clear';for(const k of WT_KEYS){r-=WTYPES[k].w;if(r<=0){t=k;break}}
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
    log(`The ${tribes[w.a].title} and the ${tribes[w.b].title} made peace.`,[120,190,120]);
  }
  diplomacyYear();
}
function log(m,c,local){
  const col=c||[150,140,170];
  if(!local){logs.unshift({y:year(),m,c:col});if(logs.length>80)logs.pop();logDirty=true}
  for(const T of tribes)if(T.hist&&m.includes(T.title)){T.hist.unshift({y:year(),m,c:col});if(T.hist.length>70)T.hist.pop()}
}

function simStep(){
  for(const u of units){u.px=u.x;u.py=u.y}
  for(const b of boats){b.px=b.x;b.py=b.y}
  step++;
  updateTimeWeather();
  updateUnits();updateTribes();updateBoats();updateFire();growth();
  if(step%YEAR===0)yearly();
}

/* ---------- world generation ---------- */
function genWorld(){
  seedNoise();
  hgt=new Float32Array(N);tree=new Uint8Array(N);fire=new Uint8Array(N);lava=new Uint16Array(N);
  bld=new Int16Array(N).fill(-1);btype=new Uint8Array(N);burnt=new Uint32Array(N);
  units=[];tribes=[];religions=[];boats=[];fires=new Set();lavas=new Set();burnSet=new Set();step=0;logs=[];wars=[];alliances=[];effects=[];
  bList=[];bDirty=true;logDirty=true;
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
  const spots=[];
  const placeRace=r=>{
    const ok=j=>{
      if(!fertile(j)||tree[j])return false;
      const x=j%W,y=(j/W)|0;
      if(spots.some(s=>Math.hypot(s[0]-x,s[1]-y)<45))return false;
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
  RACE_KEYS.forEach(placeRace);
  const herd=(sp,groups,size,pred)=>{for(let k=0;k<groups;k++){const i=randomLand(j=>(pred?pred(j):fertile(j))&&farFrom(j,sp==='wolf'||sp==='bear'?35:8));if(i>=0)for(let m=0;m<size;m++)addAnimal(sp,i%W,(i/W)|0)}};
  herd('sheep',8,3);herd('deer',7,3,j=>fertile(j)&&ringFind(j%W,(j/W)|0,3,k=>tree[k])>=0);herd('rabbit',10,3);
  herd('wolf',3,3);herd('bear',3,1,j=>bio(hgt[j])===4);herd('fox',4,1);herd('horse',3,3);
  updateUnits();
  initTerrain();
}

/* ---------- god powers ---------- */
function spawnAt(p,kind){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
  const i=ringFind(x,y,2,walk);
  if(i<0){toast('They need dry land to stand on.');return}
  if(units.length>1600){toast('The world is crowded. Let nature thin things out first.');return}
  const tx=i%W,ty=(i/W)|0;
  if(RACES[kind]){
    let T=null,bd=18*18;
    for(const t of tribes){if(!t.alive||t.race!==kind)continue;const d=(t.cx-tx)**2+(t.cy-ty)**2;if(d<bd){bd=d;T=t}}
    if(!T){T=newTribe(kind,tx,ty);log(`The ${T.title} appeared in the world.`,T.color)}
    for(let k=0;k<2;k++)addPerson(T,tx,ty);
    T.pop+=2;sfx('spawn',tx,ty);
  }else{
    const S=SPECIES[kind];let owner=-1;
    if(S.dom){let bd=14*14;for(const t of tribes){if(!t.alive)continue;const d=(t.cx-tx)**2+(t.cy-ty)**2;if(d<bd){bd=d;owner=t.id}}}
    const n=kind==='bear'?1:kind==='horse'||kind==='cow'||kind==='wolf'?2:3;
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
  const r=brushSize-1,k=dt/16.7;
  switch(tool){
    case'raise':brushAt(p.x,p.y,r,(i,f)=>{hgt[i]+=.012*k*(1-f*.6);afterH(i)});break;
    case'lower':brushAt(p.x,p.y,r,(i,f)=>{hgt[i]-=.012*k*(1-f*.6);afterH(i)});break;
    case'water':brushAt(p.x,p.y,r,i=>{hgt[i]+=(.27-hgt[i])*.2*k;afterH(i)});break;
    case'land':brushAt(p.x,p.y,r,i=>{hgt[i]+=(.5-hgt[i])*.2*k;burnt[i]=0;if(lava[i]){lava[i]=0;lavas.delete(i)}afterH(i)});break;
    case'mountain':brushAt(p.x,p.y,r,(i,f)=>{hgt[i]+=((f<.5?.9:.8)-hgt[i])*.12*k;afterH(i)});break;
    case'trees':brushAt(p.x,p.y,r,i=>{if(fertile(i)&&bld[i]===-1&&!fire[i]&&!nearBld(i)&&R()<.08*k){tree[i]=1;burnt[i]=0;markTile(i)}});break;
    case'fire':brushAt(p.x,p.y,r,i=>{if(R()<.25*k)ignite(i,true)});break;
    case'rain':
      brushAt(p.x,p.y,r,i=>{
        if(fire[i]){fire[i]=0;fires.delete(i)}
        if(lava[i])lava[i]=Math.max(1,lava[i]-15);
        if(burnt[i]>step){burnt[i]=Math.max(step,burnt[i]-20);markTile(i)}
        if(fertile(i)&&!tree[i]&&bld[i]===-1&&!nearBld(i)&&R()<.004){tree[i]=1;markTile(i)}
      });
      for(let n=0;n<8;n++)effects.push({type:'drop',x:p.x+(R()*2-1)*(r+.5),y:p.y+(R()*2-1)*(r+.5)-2,t:0,dur:9});
      break;
  }
}
