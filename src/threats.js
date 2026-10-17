"use strict";
/* ============ Great beasts and how kingdoms answer them ============
   A monster with S.boss (dragon, demon, troll, ogre, giant spider, sand worm, basilisk, thunderbird) is a threat to a
   whole kingdom. When one comes near a domain or kills its people, the kingdom raises a hunt (T._hunt, runtime only,
   never saved): the army musters at the village nearest the beast, the general leads it out (engage), and if the losses
   are heavy it falls back, regroups and tries again (retreat). Farmers, children and priests run from a great beast;
   soldiers (and, in a crisis, hunters) stand and fight. Slaying one earns renown, spoils and a line in the legend.
   Loaded after powers.js and before divine.js; it reads other files' tables only at runtime. */

const BOSS_NAMES={
  dragon:['Ashwing','Cindermaw','Vorthrax','Emberdeep','Skarn the Red'],
  demon:['Malkor','Hollowflame','Zabrath','the Pale Horn','Ghul-Seth'],
  troll:['Gravelback','Mossjaw','Old Bramble','Thudgar','Stonehide'],
  ogre:['Bonecrusher','Grummash','Hogtooth','Lumbar','Big Mudd'],
  spider:['Webmother','Silkfang','the Weaver','Gloomleg','Shrikka'],
  sandworm:['Duneturner','the Hollow King','Grainmaw','Sirrock','Dustcoil'],
  basilisk:['Stonegaze','Ghorr','the Pale Eye','Viperscale'],
  thunderbird:['Stormcry','Skyrend','Voltwing','Hailscream'],
};
/* visual-only randomness (RC), so naming a beast never changes the world */
function bossNick(sp){const a=BOSS_NAMES[sp];return a?a[(RC()*a.length)|0]:null}
const bossLabel=m=>(m.nick?m.nick+', the ':'the ')+SPECIES[m.sp].name.toLowerCase();

/* standing in flames: the fiends do not mind; other great beasts are scorched (and a burning troll stops healing) instead of dying outright.
   Returns true while it survives, so the caller skips the instant death every smaller creature suffers */
function fireHurt(u){
  if(u.sp==='demon'||u.sp==='imp')return true;
  u.hp-=u.maxhp*.012;u.burn=step+120;
  return u.hp>0;
}
/* every great beast above ground or below it, rebuilt at most once a step */
let _bl=[],_blStep=-1;
function bossList(){
  if(_blStep===step)return _bl;
  _blStep=step;_bl.length=0;
  for(let i=0;i<units.length;i++){const u=units[i];if(!u.dead&&u.k===1&&SPECIES[u.sp].boss&&u.charm==null)_bl.push(u)}
  return _bl;
}
const townDist=(T,x,y)=>{let d=1e9;for(const t of T.towns){const e=Math.hypot(t.x-x,t.y-y);if(e<d)d=e}return d};
const soldiery=T=>(T.jobs.soldier||0)+(T.jobs.general||0);
/* who stands and fights a great beast: the soldiers and the general, and in a crisis the hunters as well */
function soldierly(u,T){
  if(!adult(u))return false;
  if(u.job==='soldier'||u.job==='general')return true;
  const h=T._hunt;return !!(h&&h.crisis&&(u.job==='hunter'||u.traits.includes('Brave')&&T.age>=3));
}

/* a person who is not a fighter runs from a great beast, straight away from it and a little towards home */
function fleeFrom(u,e){
  if(u.inside)return false;
  const dx=u.x-e.x,dy=u.y-e.y,d=Math.hypot(dx,dy)||1,T=tribes[u.tribe],H=townOf(u,T);
  const hx=H.x-u.x,hy=H.y-u.y,hd=Math.hypot(hx,hy)||1,k=hd<5?0:.35;
  const ax=dx/d+hx/hd*k,ay=dy/d+hy/hd*k,al=Math.hypot(ax,ay)||1;
  const j=sampleNear(u.x+ax/al*7,u.y+ay/al*7,3,walk,12);
  if(j<0)return false;
  setT(u,j);u.task='flee';u.target=null;u.busy=17;u.cd=8;u.haste=step+24;
  return true;
}
/* what a person does on sighting a hostile creature: fight it, or, if it is a great beast and they are no fighter, run */
function engage(u,T,e){
  if(isBoss(e)){
    if(!soldierly(u,T))return fleeFrom(u,e);
    const h=T._hunt;
    if(h&&h.mode==='retreat'&&Math.hypot(e.x-u.x,e.y-u.y)>3.5)return false;
  }
  u.target=e;u.task='fight';return true;
}

/* ---------- raising the hunt ---------- */
function conscript(T,want){
  let have=soldiery(T);if(have>=want)return;
  const pool=T.members.filter(m=>adult(m)&&!m.inside&&m.job&&m.job!=='soldier'&&m.job!=='general'&&m.job!=='priest'&&m.job!=='teacher');
  pool.sort((a,b)=>b.maxhp*b.dmg-a.maxhp*a.dmg);
  for(const m of pool){if(have>=want)break;setJob(m,'soldier');m.task=null;m.cd=0;have++}
}
/* soldiers re-read their orders on their next turn, not after a long wait at their last post */
function rouse(T){for(const m of T.members)if(m.job==='soldier'||m.job==='general'){m.busy=99;if(m.cd>3)m.cd=3}}
function startHunt(T,m){
  const S=SPECIES[m.sp],H=T.towns[nearestTown(T,m.x,m.y)];
  conscript(T,Math.max(6,Math.min(50,Math.round(T.pop*.4))));
  const n=soldiery(T);
  T._hunt={m,t0:step,mode:'muster',n0:n,tries:0,far:0,crisis:n<5,gx:H.x,gy:H.y,sx:m.x,sy:m.y,hp0:m.hp,bt:step};
  log(`The ${T.title} sends its army against ${bossLabel(m)} that stalks near ${H.name}.`,T.color,false,{x:m.x,y:m.y,ic:'⚔️',p:2});
  sfx('horn',H.x,H.y);rouse(T);
}
function endHunt(T,why){
  const h=T._hunt;if(!h)return;T._hunt=null;
  if(why==='gone')log(`${bossLabel(h.m)} has left the lands of the ${T.title}. The soldiers stand down.`,T.color,true);
  if(why==='gaveup'){log(`The ${T.title} could not break ${bossLabel(h.m)} and closes its gates, praying it passes.`,T.color,false,{x:h.m.x,y:h.m.y,ic:'🏰',p:1});T._huntCd=step+1800}
  else T._huntCd=step+300;
}
function bossSeen(h){const m=h.m;if(m.dig<=step){h.sx=m.x;h.sy=m.y}}

/* every 20 steps per kingdom: keep an eye out, and steer a hunt that is under way */
function threatWatch(T){
  const h=T._hunt;
  if(h){
    const m=h.m;
    if(m.dead){T._hunt=null;return}
    bossSeen(h);
    if(townDist(T,m.x,m.y)>(h.mode==='engage'?36:28)){if(++h.far>=12)endHunt(T,'gone');return}else h.far=0;
    const n=soldiery(T);
    if(h.mode==='muster'){
      let near=0;const G=T._gen;
      for(const s of T.members)if(s.job==='soldier'&&!s.inside&&Math.hypot(s.x-h.gx,s.y-h.gy)<9)near++;
      if(step-h.t0>520||near>=Math.max(3,n*.65)){h.mode='engage';h.bt=step;h.n0=Math.max(n,1);h.hp0=m.hp;
        log(`The army of the ${T.title}${G?`, led by ${G.name},`:''} marches on ${bossLabel(m)}.`,T.color,true,{x:m.x,y:m.y});rouse(T)}
    }else if(h.mode==='engage'){
      /* heavy losses: fall back (a far stronger beast than the army can handle is not fought to the last man) */
      if(n<h.n0*.4||n<2){h.mode='retreat';h.bt=step;
        log(`The ${T.title} falls back from ${bossLabel(m)}, its soldiers broken.`,T.color,false,{x:m.x,y:m.y,ic:'🏳️',p:1});rouse(T)}
    }else{
      if(step-h.bt>420){
        if(++h.tries>=2&&m.hp>m.maxhp*.4){endHunt(T,'gaveup');return}
        conscript(T,Math.max(6,Math.min(50,Math.round(T.pop*.42))));
        h.mode='muster';h.t0=step;h.n0=soldiery(T);h.crisis=h.n0<5;
        const H=T.towns[nearestTown(T,m.x,m.y)];h.gx=H.x;h.gy=H.y;
        log(`The ${T.title} regroups and swears to hunt down ${bossLabel(m)}.`,T.color,true);rouse(T)
      }
    }
    return;
  }
  if(T._huntCd>step||T.pop<6)return;
  const raid=T._raid;
  let best=null,bs=0;
  for(const m of bossList()){
    if(m.dig>step&&!(raid&&raid.m===m))continue;
    const S=SPECIES[m.sp],dn=townDist(T,m.x,m.y),owned=own[tileOf(m)]===T.id;
    const hit=raid&&raid.m===m&&step-raid.at<500;
    if(!(owned||hit||dn<(S.fly?20:14)))continue;
    const sc=1/(dn+4)+(hit?.2:0)+(owned?.05:0);
    if(sc>bs){bs=sc;best=m}
  }
  if(best)startHunt(T,best);
}

/* ---------- soldiers and generals on a hunt ---------- */
function huntPoint(u,x,y,k){
  const dx=x-u.x,dy=y-u.y,d=Math.hypot(dx,dy)||1,s=Math.min(d,k);
  return sampleNear(u.x+dx/d*s,u.y+dy/d*s,3,walk,12);
}
/* a soldier's orders during a hunt; false lets the ordinary patrol run */
function huntDuty(u,T){
  const h=T._hunt,m=h.m;
  if(m.dead)return false;
  const hall=T.hall>=0?T.hall:T.towns[0].y*W+T.towns[0].x;
  const dm=Math.hypot(m.x-u.x,m.y-u.y),vis=!(m.dig>step);
  if(h.mode==='retreat'){
    if(vis&&dm<3.5){u.target=m;u.task='fight';return true}
    const j=sampleNear(hall%W,(hall/W)|0,5,walk,12);if(j>=0){setT(u,j);u.task='guard';return true}
    return false;
  }
  if(h.mode==='muster'){
    if(vis&&dm<7){u.target=m;u.task='fight';return true}
    const j=sampleNear(h.gx,h.gy,4,walk,12);if(j>=0){setT(u,j);u.task='rally';return true}
    return false;
  }
  /* engage */
  if(!vis){const j=sampleNear(h.sx,h.sy,5,walk,12);if(j>=0){setT(u,j);u.task='guard';return true}return false}
  if(dm<=13){u.target=m;u.task='fight';return true}
  const g=T._gen;
  if(g&&g!==u&&!g.inside&&Math.abs(g.x-u.x)+Math.abs(g.y-u.y)<40){u.task='follow';u.tx=g.x;u.ty=g.y;return true}
  const j=huntPoint(u,m.x,m.y,6);if(j>=0){setT(u,j);u.task='march';return true}
  return false;
}
/* the general rallies the army, then walks it up to the beast and takes the first blow */
function huntLead(u,T){
  const h=T._hunt,m=h.m;
  if(m.dead)return false;
  const dm=Math.hypot(m.x-u.x,m.y-u.y),vis=!(m.dig>step);
  if(h.mode==='retreat'){
    const hall=T.hall>=0?T.hall:T.towns[0].y*W+T.towns[0].x;
    const j=sampleNear(hall%W,(hall/W)|0,3,walk,12);if(j>=0){setT(u,j);u.task='guard';return true}
    return false;
  }
  if(h.mode==='muster'){
    if(Math.hypot(h.gx-u.x,h.gy-u.y)>5){const j=huntPoint(u,h.gx,h.gy,7);if(j>=0){setT(u,j);u.task='march';return true}}
    else{wander(u,h.gx,h.gy,3);u.task='rally';return true}
    return false;
  }
  if(!vis){const j=huntPoint(u,h.sx,h.sy,6);if(j>=0){setT(u,j);u.task='march';return true}return false}
  if(dm<=11){u.target=m;u.task='fight';return true}
  const j=huntPoint(u,m.x,m.y,5);if(j>=0){setT(u,j);u.task='march';return true}
  return false;
}

/* ---------- a great beast falls ---------- */
const SLAY_LINES=['slays','brings down','puts an end to','cuts down'];
function bossSlain(u){
  const S=SPECIES[u.sp],credit=new Set();
  for(const T of tribes)if(T.alive&&T._hunt&&T._hunt.m===u)credit.add(T.id);
  if(u.lastBy>=0&&tribes[u.lastBy]&&tribes[u.lastBy].alive)credit.add(u.lastBy);
  const at={x:u.x,y:u.y,ic:'🏆',p:2};
  if(!credit.size){
    log(`${bossLabel(u)} has fallen.`.replace(/^./,c=>c.toUpperCase()),[220,200,150],true,at);
    return;
  }
  for(const id of credit){
    const T=tribes[id];T._hunt=null;T._huntCd=step+500;
    let hero=null,hd=1e9;
    for(const m of T.members)if((m.job==='soldier'||m.job==='general')&&!m.dead){const d=Math.hypot(m.x-u.x,m.y-u.y);if(d<hd&&d<8){hd=d;hero=m}}
    if(hero){hero.kills=(hero.kills||0)+4;hero.xp=Math.min(60,(hero.xp||0)+25)}
    T.stab=Math.min(100,T.stab+10);T.devo=Math.min(100,T.devo+6);T.renown+=2;T.food+=14;T.mat+=14;
    T.slain=T.slain||[];T.slain.push({sp:u.sp,n:u.nick||S.name,y:year(),by:hero?hero.name:''});if(T.slain.length>12)T.slain.shift();
    if(T.legend&&T.slain.length<=2)T.legend+=` In the year ${year()} its warriors slew ${bossLabel(u)}, and the song of it is still sung.`;
    log(`The ${T.title} ${SLAY_LINES[(u.id)%SLAY_LINES.length]} ${bossLabel(u)}${hero?`; ${hero.name} struck the last blow`:''}. The people rejoice.`,T.color,false,at);
    sfx('fanfare',u.x,u.y);
    if(effects.length<300)effects.push({type:'rite',x:u.x,y:u.y,c:[255,220,120],t:0,dur:70,big:true});
  }
}
