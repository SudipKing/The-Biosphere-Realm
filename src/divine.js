"use strict";
/* ============ The divine hand: command, smite, raise the dead, crown, found, unite, summon, bless ============
   Tap tools are registered in TAPS (ids d_*). The unit and kingdom level functions are also called by the inspector.
   World-changing randomness uses R() (seeded); effects go through effects/sfx only. */
const DIVINE_ITEMS=[
  ['d_command','👆','Command','Tap to choose every creature in the brush, then tap where they must go. They walk there in a straight line, ignoring hunger and fear.'],
  ['d_smite','⚡','Smite','A pillar of light strikes down the single creature or person nearest your tap.'],
  ['d_raise','🪦','Resurrection','Brings back up to ten of the recently fallen near your tap, with their names, kin and deeds.'],
  ['d_crown','👑','Crown general','Names the person you tap general of their kingdom. The old general returns to the ranks.'],
  ['d_exile','🏳️','Found a kingdom','The person you tap and up to seven kin and neighbours leave their kingdom and found a new one on the spot, at peace.'],
  ['d_unite','🤝','Unite kingdoms','Tap the kingdom that rules, then the one that joins it. Lands, villages, people, herds and treasures merge into one realm.'],
  ['d_army','🛡️','Summon army','Six seasoned soldiers of the tapped kingdom appear at your side.'],
  ['d_boom','👶','Baby boom','Children are born to the tapped kingdom, and its granaries fill.'],
  ['d_golden','🌟','Golden age','Ten years of plenty, bold art and calm streets for the tapped kingdom.'],
  ['d_prophet','📜','Prophet','A prophet gives the tapped kingdom a new faith and a new god. Devotion rises.'],
  ['d_uplift','🧠','Awaken','The animal you tap wakes as a thinking person and joins a people of its own kind.'],
  ['d_decade','⌛','Age of ages','Let ten years pass in a rush.'],
];
const DV_CAP=1600,DV_GOLD=[255,226,130],DV_WHITE=[255,250,220];
const dvAlive=()=>{let n=0;for(const t of tribes)if(t.alive)n++;return n};
const dvFail=m=>{toast(m);return false};
function dvNearest(p,r,pred){
  let b=null,bd=r*r;
  for(const u of units){
    if(u.dead||u.inside||(pred&&!pred(u)))continue;
    const d=(u.x-p.x)**2+(u.y-p.y)**2;if(d<bd){bd=d;b=u}
  }
  return b;
}
const dvRite=(x,y,c,big,dur)=>{if(effects.length<300)effects.push({type:'rite',x,y,c:c||DV_WHITE,t:0,dur:dur||40,big:!!big})};
const dvBeam=(x,y,r)=>{if(effects.length<300)effects.push({type:'beam',x,y,r:r||1.2,t:0,dur:50})};
const dvCap=()=>units.length>=DV_CAP;

/* ---------- unit level ---------- */
function smiteUnit(u){
  if(!u||u.dead)return dvFail('Nothing there to smite.');
  dvBeam(u.x,u.y,1.2);dvRite(u.x,u.y,DV_WHITE,true,40);sfx('thunder',u.x,u.y);
  if(u.k===0){
    const T=tribes[u.tribe];
    log(`${u.name} of the ${T.title} was struck down by a pillar of light.`,DV_WHITE,true,{x:u.x,y:u.y});
    toast(`${u.name} was struck down.`);
  }else toast(`The ${SPECIES[u.sp].name.toLowerCase()} was struck down.`);
  die(u);
  return true;
}
function healUnit(u){
  if(!u||u.dead)return dvFail('Nothing there to heal.');
  u.hp=u.maxhp;u.frozen=0;
  if(u.traits&&u.traits.includes('Cursed'))u.traits=u.traits.filter(t=>t!=='Cursed');
  dvRite(u.x,u.y,[150,255,170],false,36);sfx('unveil',u.x,u.y);
  toast(`${u.k===0?u.name:'The creature'} is whole again.`);
  return true;
}
function crownUnit(u){
  if(!u||u.dead||u.k!==0)return dvFail('Only a person can be crowned.');
  if(!adult(u))return dvFail('Only a grown person can lead an army.');
  const T=tribes[u.tribe];if(!T||!T.alive)return dvFail('That person has no kingdom.');
  if(T.general===u.id&&u.job==='general')return dvFail(`${u.name} already leads the ${T.title}.`);
  if(T.general>=0){const old=units.find(x=>x.id===T.general&&!x.dead);if(old&&old!==u)setJob(old,'soldier')}
  setJob(u,'general');u.task=null;u.target=null;u.cd=0;
  T.general=u.id;T._gen=u;
  dvRite(u.x,u.y,DV_GOLD,true,60);sfx('fanfare',u.x,u.y);
  log(`${u.name} was crowned general of the ${T.title} by a divine hand.`,T.color,true,{x:u.x,y:u.y});
  toast(`${u.name} now leads the armies of the ${T.title}.`);
  return true;
}
function exileUnit(u){
  if(!u||u.dead||u.k!==0)return dvFail('Only a person can found a kingdom.');
  const T=tribes[u.tribe];if(!T||!T.alive)return dvFail('That person has no kingdom.');
  if(dvAlive()>=36)return dvFail('The world cannot hold another kingdom.');
  let tile=tileOf(u);if(!walk(tile))tile=ringFind(u.x|0,u.y|0,4,walk);
  if(tile<0)return dvFail('No solid ground here to found a kingdom.');
  const x=tile%W,y=(tile/W)|0;
  const kin=m=>m.pa&&(m.pa===u.pa||m.pa===u.id||m.pb===u.id||u.pa===m.id||u.pb===m.id)?0:1;
  const near=T.members.filter(m=>m!==u&&!m.dead&&!m.inside&&Math.hypot(m.x-u.x,m.y-u.y)<=4)
    .sort((a,b)=>kin(a)-kin(b)||Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y)).slice(0,7);
  const movers=[u].concat(near);
  if(movers.length<2)return dvFail('Too few people nearby to found a kingdom.');
  const NT=newTribe(u.race,x,y,T);
  NT.food=Math.max(NT.food,22);NT.mat=Math.max(NT.mat,12);NT.stab=60;
  for(const m of movers){
    if(m.job==='general'){setJob(m,'soldier');if(T.general===m.id)T.general=-1}
    m.tribe=NT.id;m.town=0;m.target=null;m.task=null;m.cmd=0;m.cd=20;m.inside=false;
  }
  NT.pop=movers.length;NT.members=movers;T.pop-=movers.length;T.members=T.members.filter(m=>m.tribe===T.id);
  ownDirty=true;census();
  dvRite(u.x,u.y,DV_GOLD,true,60);sfx('fanfare',u.x,u.y);
  log(`${u.name} led ${movers.length-1} ${movers.length===2?'companion':'companions'} out of the ${T.title} and founded the ${NT.title}, worshipping ${NT.rel.patron.name}.`,NT.color,false,newsAt(NT,'🏳️',3));
  toast(`The ${NT.title} is founded.`);
  return true;
}
/* send creatures to a point: they walk there in a straight line (see updateUnits) and stop on arrival or when blocked */
let cmdUntil=0;
function commandUnits(list,p){
  let n=0;
  for(const u of list){
    if(!u||u.dead)continue;
    u.cmd=step+YEAR*2;u.inside=false;u.target=null;u.task=null;
    let tx=p.x+(R()-.5)*1.4,ty=p.y+(R()-.5)*1.4;
    if(!u.fly){const j=ringFind(p.x|0,p.y|0,3,i=>canStand(u,i));if(j>=0){tx=j%W+.2+R()*.6;ty=((j/W)|0)+.2+R()*.6}}
    u.tx=clamp(tx,.5,W-.5);u.ty=clamp(ty,.5,H-.5);
    n++;
  }
  if(!n)return dvFail('No one is left to command.');
  cmdUntil=step+YEAR*2;
  sfx('horn',p.x,p.y);dvRite(p.x,p.y,[160,210,255],false,30);
  toast(`${n} ${n===1?'creature goes':'creatures go'} where you point.`);
  return true;
}

/* ---------- kingdom level ---------- */
function goldenAge(T){
  if(!T||!T.alive)return dvFail('Tap a kingdom or its land.');
  T.golden=step+YEAR*10;T.fx=computeFx(T);
  dvRite(T.cx+.5,T.cy+.5,[246,204,70],true,90);sfx('fanfare',T.cx,T.cy);
  log(`A golden age dawned for the ${T.title} at your word: full granaries, bold art and calm streets for ten years.`,[246,204,70],false,newsAt(T,'🌟',2));
  toast(`The ${T.title} enters a golden age.`);
  return true;
}
function newProphet(T){
  if(!T||!T.alive)return dvFail('Tap a kingdom or its land.');
  const old=T.rel;
  T.rel=newReligion(T.race,old);T.devo=75;T.fx=computeFx(T);
  const rel=T.rel;
  dvRite(T.cx+.5,T.cy+.5,DOMAINS[rel.domain]?DOMAINS[rel.domain].c:DV_GOLD,true,90);sfx('rite',T.cx,T.cy,T.race);
  log(`A prophet rose among the ${T.title} and gave them the ${rel.name}, in the name of ${rel.patron.name}.`,DOMAINS[rel.domain]?DOMAINS[rel.domain].c:DV_GOLD,false,newsAt(T,'📜',2));
  toast(`The ${T.title} turns to ${rel.patron.name}.`);
  return true;
}
function summonArmy(T,p){
  if(!T||!T.alive)return dvFail('Tap a kingdom or its land.');
  const room=DV_CAP-units.length;if(room<=0)return dvFail('The world is too crowded.');
  let ax=T.cx,ay=T.cy;if(p&&inb(p.x|0,p.y|0)){ax=p.x;ay=p.y}
  let n=0;
  for(let k=0;k<Math.min(6,room);k++){
    let t=ringFind(ax|0,ay|0,5,walk);if(t<0)t=ringFind(T.cx,T.cy,5,walk);if(t<0)continue;
    const x=t%W,y=(t/W)|0,s=addPerson(T,x,y,null,null,T.race);
    s.age=ADULT+((R()*6*YEAR)|0);s.town=nearestTown(T,x,y);s.xp=20+((R()*30)|0);
    setJob(s,'soldier');dvRite(s.x,s.y,DV_GOLD,false,30);n++;
  }
  if(!n)return dvFail('No ground to stand on here.');
  census();sfx('horn',ax,ay);
  log(`${n} soldiers appeared from nowhere to stand with the ${T.title}.`,T.color,true,{x:ax,y:ay});
  toast(`${n} soldiers answer your call.`);
  return true;
}
function babyBoom(T){
  if(!T||!T.alive)return dvFail('Tap a kingdom or its land.');
  const adults=T.members.filter(m=>adult(m)&&!m.dead&&!m.inside);
  if(adults.length<2)return dvFail('There are too few adults to raise children.');
  let n=0;
  for(let k=0;k<8&&units.length<DV_CAP;k++){
    const m=pick(adults);let mate=m;
    for(let j=0;j<8;j++){const c=pick(adults);if(c!==m&&(c.town|0)===(m.town|0)){mate=c;break}}
    if(mate===m)for(const c of adults)if(c!==m){mate=c;break}
    addPerson(T,m.x|0,m.y|0,m,mate);n++;
  }
  if(!n)return dvFail('The world is too crowded.');
  T.food+=20;census();
  dvRite(T.cx+.5,T.cy+.5,[255,200,220],true,70);sfx('chime',T.cx,T.cy);
  log(`A wave of births blessed the ${T.title}: ${n} children in one season.`,[255,190,210],true,newsAt(T,'👶',2));
  toast(`${n} children are born in the ${T.title}.`);
  return true;
}
/* B joins A: its people, herds, villages, buildings, boats and treasures all become A's, and B ceases to be */
function uniteKingdoms(A,B){
  if(!A||!B||A===B||!A.alive||!B.alive)return dvFail('Pick two living kingdoms.');
  const off=A.towns.length;
  for(const u of units){
    if(u.charm===B.id)u.charm=A.id;
    if(u.k===0){
      if(u.tribe!==B.id){if(u.tribe===A.id&&u.target&&u.target.k===0&&u.target.tribe===B.id){u.target=null;u.task=null}continue}
      u.tribe=A.id;u.town=(u.town|0)+off;u.target=null;u.task=null;
      if(u.job==='general'){setJob(u,'soldier');if(B.general===u.id)B.general=-1}
    }else if(u.owner===B.id){u.owner=A.id;u.town=(u.town|0)+off}
  }
  for(const b of boats){
    if(b.tribe===B.id){b.tribe=A.id;b.ci=A.ci}
    if(b.pass)for(const p of b.pass)if(p.tribe===B.id){p.tribe=A.id;p.town=(p.town|0)+off;p.target=null;p.task=null}
  }
  for(let i=0;i<N;i++){
    if(bld[i]!==B.id)continue;
    bld[i]=A.id;
    if(btype[i]===1||btype[i]===2)btype[i]=0;
    markDirty(i);
  }
  for(const t of B.towns)A.towns.push(t);
  B.towns=[Object.assign({},B.towns[0],{houses:0,pop:0})];
  A.colonies=A.towns.length-1;
  A.houses+=B.houses;A.monuments+=B.monuments;A.food+=B.food;A.mat+=B.mat;A.renown+=B.renown;
  for(const r in B.res)A.res[r]=(A.res[r]||0)+B.res[r];
  A.arts=A.arts.concat(B.arts);A.heroes=A.heroes.concat(B.heroes);
  A.sci=Math.max(A.sci,B.sci);A.age=Math.max(A.age,B.age);
  wars=wars.filter(w=>w.a!==B.id&&w.b!==B.id);
  alliances=alliances.filter(a=>a.a!==B.id&&a.b!==B.id);
  if(dipPending&&(dipPending.T===B||dipPending.T===A))dipPending=null;
  B.alive=false;B.pop=0;B.members=[];B.houses=0;B.monuments=0;B.hall=-1;B.temple=false;B.templeAt=-1;B.area=0;B.general=-1;B._gen=null;
  B.food=0;B.mat=0;for(const r in B.res)B.res[r]=0;B.arts=[];B.heroes=[];
  bDirty=true;ownDirty=true;census();A.fx=computeFx(A);
  dvRite(A.cx+.5,A.cy+.5,DV_GOLD,true,90);sfx('fanfare',A.cx,A.cy);
  log(`By divine will the ${B.title} joined the ${A.title}, and the two became one realm.`,A.color,false,newsAt(A,'🤝',3));
  toast(`The ${B.title} is no more: it is part of the ${A.title}.`);
  return true;
}

/* ---------- resurrection ---------- */
function raiseFallen(p){
  const r=splashR()+1,list=[];
  for(const d of fallen)if(Math.hypot(d.x-p.x,d.y-p.y)<=r)list.push(d);
  if(!list.length)return dvFail('No one has fallen near here recently.');
  list.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  let n=0,names=null;
  for(const d of list){
    if(n>=10||units.length>=DV_CAP)break;
    let tile=(d.y|0)*W+(d.x|0);
    if(!inb(d.x|0,d.y|0)||!canStand(d,tile)||lava[tile]){tile=d.fly?-1:ringFind(d.x|0,d.y|0,3,walk)}
    if(tile<0)continue;
    const x=tile%W,y=(tile/W)|0;let a;
    if(d.k===0){
      let T=tribes[d.tribe];
      if(!T||!T.alive)T=tribeNear({x:d.x,y:d.y});
      if(!T)continue;
      a=addPerson(T,x,y,null,null,d.race);
      a.name=d.name;a.gen=d.gen;a.parents=d.parents;a.pa=d.pa;a.pb=d.pb;a.born=d.born;a.kills=d.kills||0;a.xp=d.xp||0;
      a.genes=Object.assign({},d.genes);a.traits=d.traits?d.traits.slice():[];a.odd=d.odd;
      a.maxhp=d.maxhp;a.dmg=d.dmg;a.spd=d.spd;a.life=d.life;a.jhp=d.jhp;a.jdmg=d.jdmg;
      a.town=T.id===d.tribe?Math.min(d.town|0,T.towns.length-1):nearestTown(T,x,y);
      a.age=d.age>=d.life?Math.max(ADULT+1,(d.life*.5)|0):d.age;
      a.job=d.job;if(a.job==='general'){setJob(a,'soldier')}
    }else{
      const owner=d.owner>=0&&tribes[d.owner]&&tribes[d.owner].alive?d.owner:-1;
      a=addAnimal(d.sp,x,y,owner,false);
      a.v=d.v;a.male=d.male;a.scale=d.scale;a.nick=d.nick;a.maxhp=d.maxhp;a.dmg=d.dmg;a.spd=d.spd;a.life=d.life;
      if(d.traits)a.traits=d.traits.slice();a.odd=d.odd;
      if(owner>=0)a.town=Math.min(d.town|0,tribes[owner].towns.length-1);
      a.age=d.age>=d.life?Math.max(YEAR*2,(d.life*.5)|0):d.age;
    }
    a.hp=a.maxhp;a.x=a.px=d.x;a.y=a.py=d.y;
    if(tile!==(d.y|0)*W+(d.x|0)||!inb(d.x|0,d.y|0)){a.x=a.px=x+.5;a.y=a.py=y+.5}
    a.tx=a.x;a.ty=a.y;
    dvRite(a.x,a.y,[190,230,255],false,44);
    if(a.k===0&&!names)names=a.name;
    const k=fallen.indexOf(d);if(k>=0)fallen.splice(k,1);
    n++;
  }
  if(!n)return dvFail('The fallen here have nowhere to return to.');
  census();dvBeam(p.x,p.y,Math.min(3,1+n*.2));sfx('unveil',p.x,p.y);
  if(names)log(`${names}${n>1?` and ${n-1} more`:''} rose from the dead at your call.`,[190,230,255],true,{x:p.x,y:p.y});
  toast(`${n} ${n===1?'soul returns':'souls return'} to the living.`);
  return true;
}

/* ---------- tap tools ---------- */
let cmdSel=[];
function clearCmd(){cmdSel=[]}
Object.assign(TAPS,{
  d_command:p=>{
    if(cmdSel.length){
      const live=cmdSel.filter(u=>!u.dead);clearCmd();
      if(live.length){commandUnits(live,p);return}
    }
    const L=nearAll(p,splashR()).slice(0,120);
    if(!L.length){toast('No creatures here. Tap near the ones you want to command.');return}
    cmdSel=L;toast(`${L.length} chosen. Now tap where they should go.`);sfx('chime',p.x,p.y);
  },
  d_smite:p=>{const u=dvNearest(p,1.5);if(!u){toast('Nothing there to smite.');return}smiteUnit(u)},
  d_raise:p=>{raiseFallen(p)},
  d_crown:p=>{const u=dvNearest(p,1.5,v=>v.k===0&&adult(v));if(!u){toast('Tap a grown person.');return}crownUnit(u)},
  d_exile:p=>{const u=dvNearest(p,1.5,v=>v.k===0);if(!u){toast('Tap a person.');return}exileUnit(u)},
  d_unite:p=>twoStep('d_unite',p,(A,B)=>uniteKingdoms(A,B),'Ruling kingdom','Now tap the kingdom that joins it.'),
  d_army:p=>{const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}summonArmy(T,p)},
  d_boom:p=>{const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}babyBoom(T)},
  d_golden:p=>{const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}goldenAge(T)},
  d_prophet:p=>{const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}newProphet(T)},
  d_uplift:p=>{
    const u=dvNearest(p,2,v=>v.k===1);if(!u){toast('Tap an animal.');return}
    if(upliftUnit(u)){const k=fallen.lastIndexOf(u);if(k>=0)fallen.splice(k,1);sfx('unveil',u.x,u.y);toast('A mind awakens.')}
    else toast('There is no room for it to wake here.');
  },
  d_decade:()=>{warpYears(10);toast('Ten years rush by...')},
});

/* ---------- drawing (read-only): rings under the chosen creatures and a line to where commanded ones are heading ---------- */
function drawDivine(ox,oy,pz){
  if(!cmdSel.length&&step>=cmdUntil)return;
  const tz=pz*TS,t=performance.now()/260,pulse=reduceMotion?.5:.5+.5*Math.sin(t);
  ctx.save();
  if(cmdSel.length){
    ctx.strokeStyle=`rgba(255,226,130,${.55+.4*pulse})`;ctx.lineWidth=Math.max(1.5,dpr*1.6);
    ctx.beginPath();
    const rx=Math.max(5*dpr,tz*(.5+.08*pulse)),ry=rx*.45;
    for(const u of cmdSel){
      if(u.dead||u.inside)continue;
      const X=ox+(u.px+(u.x-u.px)*alpha)*tz,Y=oy+(u.py+(u.y-u.py)*alpha+.35)*tz;
      ctx.moveTo(X+rx,Y);ctx.ellipse(X,Y,rx,ry,0,0,7);
    }
    ctx.stroke();
  }
  if(step<cmdUntil){
    ctx.strokeStyle='rgba(160,210,255,.45)';ctx.lineWidth=Math.max(1,dpr);ctx.setLineDash([tz*.3,tz*.3]);
    ctx.beginPath();
    let any=false;
    for(const u of units){
      if(!(u.cmd>step)||u.dead)continue;any=true;
      const X=ox+(u.px+(u.x-u.px)*alpha)*tz,Y=oy+(u.py+(u.y-u.py)*alpha)*tz;
      ctx.moveTo(X,Y);ctx.lineTo(ox+u.tx*tz,oy+u.ty*tz);
    }
    ctx.stroke();ctx.setLineDash([]);
    if(any){
      ctx.fillStyle='rgba(190,225,255,.85)';ctx.beginPath();
      const r=Math.max(2*dpr,tz*.18);
      for(const u of units){
        if(!(u.cmd>step)||u.dead)continue;
        const X=ox+u.tx*tz,Y=oy+u.ty*tz;ctx.moveTo(X+r,Y);ctx.arc(X,Y,r,0,7);
      }
      ctx.fill();
    }
  }
  ctx.restore();
}
