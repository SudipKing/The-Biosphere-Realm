"use strict";
/* ============ World tools: soils, biome seeds, ores, disasters, bombs, wonders, diplomacy, domains ============ */

/* ---------- brushes (dragged over the map every frame) ---------- */
const toward=(h,rate=.25)=>(p,r,k)=>brushAt(p.x,p.y,r,i=>{hgt[i]+=(h-hgt[i])*rate*k;afterH(i)});
const BRUSHFN={
  raise:(p,r,k)=>brushAt(p.x,p.y,r,(i,f)=>{hgt[i]+=.012*k*(1-f*.6);afterH(i)}),
  lower:(p,r,k)=>brushAt(p.x,p.y,r,(i,f)=>{hgt[i]-=.012*k*(1-f*.6);afterH(i)}),
  deep:toward(.08,.2),
  water:toward(.24,.2),
  shallow:toward(.335,.2),
  sand:(p,r,k)=>brushAt(p.x,p.y,r,i=>{hgt[i]+=(.4-hgt[i])*.25*k;burnt[i]=0;afterH(i)}),
  land:(p,r,k)=>brushAt(p.x,p.y,r,i=>{
    hgt[i]+=(.5-hgt[i])*.2*k;burnt[i]=0;if(lava[i]){lava[i]=0;lavas.delete(i)}
    if(bm[i]&&R()<.4*k)bm[i]=0;afterH(i);markTile(i);
  }),
  forestsoil:(p,r,k)=>brushAt(p.x,p.y,r,i=>{
    hgt[i]+=(.52-hgt[i])*.2*k;burnt[i]=0;if(lava[i]){lava[i]=0;lavas.delete(i)}afterH(i);
    const b=bio(hgt[i]);if((b===3||b===4)&&bm[i]!==BM.FOREST&&R()<.5*k)setBiome(i,BM.FOREST,.55);
  }),
  hills:toward(.68,.15),
  mountain:(p,r,k)=>brushAt(p.x,p.y,r,(i,f)=>{hgt[i]+=((f<.5?.9:.8)-hgt[i])*.12*k;afterH(i)}),
  snowpeak:toward(.93,.12),
  trees:(p,r,k)=>brushAt(p.x,p.y,r,i=>{if(fertile(i)&&bld[i]===-1&&!fire[i]&&!nearBld(i)&&R()<.08*k){tree[i]=1;burnt[i]=0;markTile(i)}}),
  fire:(p,r,k)=>brushAt(p.x,p.y,r,i=>{if(R()<.25*k)ignite(i,true)}),
  rain:(p,r,k)=>{
    brushAt(p.x,p.y,r,i=>{
      if(fire[i]){fire[i]=0;fires.delete(i)}
      if(lava[i])lava[i]=Math.max(1,lava[i]-15);
      if(burnt[i]>step){burnt[i]=Math.max(step,burnt[i]-20);markTile(i)}
      if(fertile(i)&&!tree[i]&&bld[i]===-1&&!nearBld(i)&&R()<.004){tree[i]=1;markTile(i)}
    });
    for(let n=0;n<8;n++)effects.push({type:'drop',x:p.x+(R()*2-1)*(r+.5),y:p.y+(R()*2-1)*(r+.5)-2,t:0,dur:9});
  },
};
/* biome seeds */
for(let b=BM.SAV;b<=BM.CORRUPT;b++){
  BRUSHFN['seed_'+BIOMES[b].k]=(p,r,k)=>brushAt(p.x,p.y,r,i=>{
    const h=bio(hgt[i]);if(h!==3&&h!==4||bld[i]!==-1||lava[i]||(b===BM.ROCK&&h!==4))return;
    if(bm[i]!==b&&R()<.5*k){setBiome(i,b,BIOMES[b].trees*.9);burnt[i]=0}
  });
}
/* ore deposits */
for(let o=ORE.STONE;o<=ORE.GEMS;o++){
  BRUSHFN['ore_'+ORES[o].k]=(p,r,k)=>brushAt(p.x,p.y,r,i=>{
    const h=bio(hgt[i]);if(h<3||h>5||bld[i]!==-1||lava[i]||ore[i]===o)return;
    if(R()<.3*k){ore[i]=o;oreAmt[i]=30+((R()*30)|0);tree[i]=0;markTile(i)}
  });
}

/* ---------- finding kingdoms and people under the cursor ---------- */
function tribeNear(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return null;
  const o=own[y*W+x];if(o>=0&&tribes[o]&&tribes[o].alive)return tribes[o];
  let T=null,bd=16*16;
  for(const t of tribes){if(!t.alive)continue;const d=(t.cx-x)**2+(t.cy-y)**2;if(d<bd){bd=d;T=t}}
  return T;
}
const nearP=(p,r)=>units.filter(u=>u.k===0&&!u.dead&&!u.inside&&Math.hypot(u.x-p.x,u.y-p.y)<=r);
const splashR=()=>1.6+brushSize*.7;
function addOdd(u,name){if(!u.traits)u.traits=[];u.odd=true;if(!u.traits.includes(name))u.traits.push(name)}

/* ---------- explosions ---------- */
const BOMBS={
  grenade:{r:2.2,crater:.05,fire:.25,core:.9,shake:6,dur:22,c:[255,200,120],name:'A grenade',snd:'boom'},
  bomb:{r:4.5,crater:.12,fire:.4,core:.85,shake:12,dur:30,c:[255,170,80],name:'A bomb',snd:'boom'},
  antimatter:{r:13,void:true,core:1,shake:32,dur:70,c:[200,120,255],dark:true,kill:1.15,name:'Antimatter',snd:'boom',big:true},
  nuke:{r:11,crater:.1,fire:.6,waste:.95,fall:1.7,core:.9,shake:26,dur:80,c:[255,230,150],kill:1.45,name:'A nuclear bomb',snd:'boom',big:true},
  tsar:{r:26,crater:.2,fire:.8,waste:1,fall:1.5,core:1,shake:40,dur:110,c:[255,250,210],kill:1.5,name:'The Tsar Bomba',snd:'boom',big:true},
};
function blast(x,y,o){
  x|=0;y|=0;if(!inb(x,y))return;
  const r=o.r,fr=o.fall?r*o.fall:r,rr=Math.ceil(fr+1);
  for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;
    const d=Math.hypot(dx,dy);if(d>fr+1)continue;
    const i=Y*W+X,f=d/r;
    if(f<=1){
      if(f<(o.core||.8)){destroyBld(i);tree[i]=0;ore[i]=0;if(fire[i]){fire[i]=0;fires.delete(i)}}
      else if(R()<.5)destroyBld(i);
      if(o.void)hgt[i]=Math.max(0,hgt[i]*f*f*.55);
      else if(o.crater)hgt[i]=Math.max(0,hgt[i]-o.crater*(1-f));
      if(lava[i]&&o.void){lava[i]=0;lavas.delete(i)}
      if(o.waste&&R()<o.waste*(1-f*.4)&&bio(hgt[i])>=3&&bio(hgt[i])<=4)bm[i]=BM.WASTE;
      if(!o.void)burn(i,o.dark?3000:2200);
      afterH(i);
      if(o.fire&&R()<o.fire*(1-f*.5))ignite(i,true);
    }else if(o.fall){
      const b=bio(hgt[i]);
      if((b===3||b===4)&&R()<(o.waste||.5)*.6*(1-(d-r)/(fr-r+1))){bm[i]=BM.WASTE;if(R()<.7)tree[i]=0;if(bld[i]===-1)markDirty(i)}
      if(R()<.3&&(tree[i]||bld[i]!==-1))ignite(i);
    }
  }
  const kr=r*(o.kill||1);let dead=0;
  for(const u of units)if(!u.dead&&Math.hypot(u.x-x-.5,u.y-y-.5)<kr){if(u.k===0)dead++;die(u)}
  for(const b of boats)if(Math.hypot(b.x-x-.5,b.y-y-.5)<kr)b.dead=true;
  effects.push({type:'blast',x:x+.5,y:y+.5,r:Math.min(kr,r*1.6),t:0,dur:o.dur,c:o.c,dark:!!o.dark,big:!!o.big});
  shake=reduceMotion?0:Math.max(shake,o.shake);
  sfx(o.snd||'boom',x,y);if(o.big)SFXQ.push({t:'boom',x:null,y:null});
  bDirty=true;ownDirty=true;
  if(o.big||dead>2)log(`${o.name} struck ${nearTribeText(x,y)}${dead?`, killing ${dead} people`:''}.`,[236,120,40]);
  if(o.big)omen(x,y);
}
function molotov(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y)||Math.hypot(dx,dy)>3.2)continue;
    if(R()<.85)ignite(Y*W+X,true);
  }
  for(const u of units)if(!u.dead&&!u.inside&&Math.hypot(u.x-p.x,u.y-p.y)<1.6&&R()<.6)hit(u,6,{k:1,x:p.x,y:p.y,hunger:0});
  effects.push({type:'blast',x:x+.5,y:y+.5,r:3.2,t:0,dur:26,c:[255,140,40],dark:false,big:false});
  sfx('crackle',x,y);shake=reduceMotion?0:Math.max(shake,3);
}
function laser(p){
  const ang=R()*Math.PI*2,c=Math.cos(ang),s=Math.sin(ang),L=34;
  const x0=p.x-c*L,y0=p.y-s*L,x1=p.x+c*L,y1=p.y+s*L;
  for(let t=-L;t<=L;t+=.5){
    const X=p.x+c*t,Y=p.y+s*t,tx=X|0,ty=Y|0;if(!inb(tx,ty))continue;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const a=tx+dx,b=ty+dy;if(!inb(a,b)||Math.hypot(a+.5-X,b+.5-Y)>1.1)continue;
      const i=b*W+a;destroyBld(i);tree[i]=0;ore[i]=0;
      if(bio(hgt[i])>=2&&bio(hgt[i])<=5){hgt[i]=Math.max(.31,hgt[i]-.015);afterH(i)}
      burn(i,2000);if(R()<.1)ignite(i,true);markDirty(i);
    }
  }
  for(const u of units)if(!u.dead){const dx=u.x-p.x,dy=u.y-p.y,along=dx*c+dy*s,perp=Math.abs(-dx*s+dy*c);if(Math.abs(along)<=L&&perp<1.4)die(u)}
  for(const b of boats){const dx=b.x-p.x,dy=b.y-p.y;if(Math.abs(-dx*s+dy*c)<1.4&&Math.abs(dx*c+dy*s)<=L)b.dead=true}
  effects.push({type:'laser',x0,y0,x1,y1,t:0,dur:36});
  sfx('thunder',p.x|0,p.y|0);shake=reduceMotion?0:Math.max(shake,10);bDirty=true;ownDirty=true;
  log(`A beam of light cut across ${nearTribeText(p.x|0,p.y|0)}.`,[255,240,190]);
}

/* ---------- natural disasters ---------- */
function earthquake(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=11;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
    const i=Y*W+X,f=d/r;
    hgt[i]+=(R()-.5)*.1*(1-f);
    if(f<.85&&bld[i]!==-1&&R()<.4*(1-f)){destroyBld(i);burn(i,500)}
    if(f<.7&&tree[i]&&R()<.1)tree[i]=0;
    afterH(i);
  }
  for(const u of units)if(!u.dead&&Math.hypot(u.x-p.x,u.y-p.y)<r){u.hp-=u.maxhp*(.1+R()*.4)*harmFrac(u);if(u.hp<=0)die(u)}
  shake=reduceMotion?0:36;sfx('boom',x,y);bDirty=true;ownDirty=true;
  effects.push({type:'blast',x:x+.5,y:y+.5,r:r,t:0,dur:50,c:[170,140,100],dark:false,big:false});
  log(`The earth shook ${nearTribeText(x,y)}.`,[190,150,100]);
}
const volcanoes=[];
function volcano(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=7;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
    const i=Y*W+X;
    hgt[i]=Math.max(hgt[i],.86-.045*d);
    if(d<6){destroyBld(i);tree[i]=0;ore[i]=0}
    afterH(i);
    if(d<1.8&&bio(hgt[i])>=2){lava[i]=700+((R()*300)|0);lavas.add(i)}
    burn(i,1500);
  }
  for(const u of units)if(!u.dead&&Math.hypot(u.x-p.x,u.y-p.y)<5)die(u);
  volcanoes.push({x:x+.5,y:y+.5,until:step+YEAR*8});
  shake=reduceMotion?0:30;sfx('boom',x,y);bDirty=true;ownDirty=true;
  log(`A volcano erupted from the earth ${nearTribeText(x,y)}.`,[255,120,40]);
}
function updateVolcanoes(){
  for(let k=volcanoes.length-1;k>=0;k--){
    const v=volcanoes[k];if(step>v.until){volcanoes.splice(k,1);continue}
    if(R()<.03){
      const a=R()*6.28,d=1+R()*3,X=(v.x+Math.cos(a)*d)|0,Y=(v.y+Math.sin(a)*d)|0;
      if(inb(X,Y)){const i=Y*W+X;if(bio(hgt[i])>=2&&bio(hgt[i])<=5&&!lava[i]){lava[i]=350+((R()*250)|0);lavas.add(i);tree[i]=0;destroyBld(i);markTile(i)}}
      effects.push({type:'rite',x:v.x,y:v.y-.5,c:[255,130,40],t:0,dur:34});if(R()<.3)sfx('boom',v.x|0,v.y|0);
    }
  }
}
function flood(p){
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=5+brushSize;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
    const i=Y*W+X,f=d/r;
    if(bio(hgt[i])>=2&&bio(hgt[i])<=4&&R()<1-f*.6){hgt[i]=.335;ore[i]=0;afterH(i)}
  }
  sfx('splash',x,y);shake=reduceMotion?0:8;ownDirty=true;
  effects.push({type:'blast',x:x+.5,y:y+.5,r:r,t:0,dur:50,c:[120,190,255],dark:false,big:false});
  log(`A great flood swallowed the land ${nearTribeText(x,y)}.`,[100,170,230]);
}
function plague(p){
  const T=tribeNear(p),r=14;let n=0,z=0;
  for(const u of units){
    if(u.dead||u.inside||Math.hypot(u.x-p.x,u.y-p.y)>r||isMon(u)||R()>.45)continue;
    if(u.k===0)n++;
    const ux=u.x,uy=u.y,wasPerson=u.k===0;die(u);
    if(wasPerson&&R()<.3&&units.length<1500){const zz=addAnimal('zombie',ux|0,uy|0);zz.x=zz.px=ux;zz.y=zz.py=uy;z++}
  }
  if(T){T.stab=clamp(T.stab-14,0,100);T.devo=clamp(T.devo-8,0,100)}
  effects.push({type:'blast',x:p.x,y:p.y,r:r*.6,t:0,dur:50,c:[120,200,80],dark:true,big:false});
  sfx('cry',p.x|0,p.y|0,'zombie');
  if(n>0)log(`A plague swept ${nearTribeText(p.x|0,p.y|0)}, killing ${n} people${z?` and raising ${z} of the dead`:''}.`,[130,190,70]);
  else toast('The plague found few to infect.');
}

/* ---------- wonders and oddities: they touch every living being, people, animals and monsters alike ---------- */
const nearAll=(p,r)=>units.filter(u=>!u.dead&&!u.inside&&Math.hypot(u.x-p.x,u.y-p.y)<=r);
function splash(p,fn,col,empty){
  const list=nearAll(p,splashR());
  if(!list.length){toast(empty||'Nothing alive is close enough. Tap near a creature or a person.');return false}
  for(const u of list){if(!u.traits)u.traits=[];fn(u)}
  effects.push({type:'rite',x:p.x,y:p.y,c:col||[255,230,150],t:0,dur:36});sfx('spawn',p.x|0,p.y|0);
  return true;
}
function scaleUnit(u,s,hpm,dmgm){
  u.scale=(u.scale||1)*s;u.maxhp*=hpm;u.hp=u.maxhp;u.dmg=(u.dmg||1)*dmgm;
}
function teleport(u){
  const j=randomLand(k=>canStand(u,k),300);if(j<0)return;
  u.x=u.px=j%W+.5;u.y=u.py=((j/W)|0)+.5;u.tx=u.x;u.ty=u.y;u.target=null;u.task=null;u.cd=0;
  effects.push({type:'rite',x:u.x,y:u.y,c:[180,120,255],t:0,dur:30});
}
/* one creature becomes another */
function morphAnimal(u,sp){
  const S=SPECIES[sp];if(S.amph&&!(bio(hgt[tileOf(u)])>=1&&bio(hgt[tileOf(u)])<=3))return;
  u.sp=sp;u.maxhp=u.hp=S.hp*(u.scale||1);u.dmg=S.dmg||0;u.spd=S.spd;u.amph=!!S.amph;u.fly=!!S.fly;u.target=null;u.mode=0;
  if(!S.dom)u.owner=-1;
}
const TAPS={
  meteor:p=>{if(inb(p.x|0,p.y|0)){effects.push({type:'meteor',x:p.x|0,y:p.y|0,t:0,dur:52});SFXQ.push({t:'boom',x:null,y:null})}},
  lightning:p=>strike(p),
  /* bombs fall out of the sky first (dropBomb, powers.js) and explode on landing */
  grenade:p=>dropBomb(p,'grenade'),bomb:p=>dropBomb(p,'bomb'),
  antimatter:p=>dropBomb(p,'antimatter'),nuke:p=>dropBomb(p,'nuke'),tsar:p=>dropBomb(p,'tsar'),
  molotov:p=>dropBomb(p,null,'molotov'),laser,earthquake,volcano,flood,plague,
  /* new chaos, all of it ticking along in the simulation (see updateWorldFx) */
  tornado:p=>{wfx.push({type:'tornado',x:p.x,y:p.y,a:R()*6.28,until:step+320,r:1.8});log(`A tornado touched down ${nearTribeText(p.x|0,p.y|0)}.`,[170,170,190]);sfx('thunder',p.x|0,p.y|0)},
  blackhole:p=>{wfx.push({type:'hole',x:p.x,y:p.y,until:step+160,r:8});sfx('boom',p.x|0,p.y|0);log(`A black hole opened ${nearTribeText(p.x|0,p.y|0)}.`,[150,90,220])},
  cluster:p=>{for(let k=0;k<7;k++)dropBomb({x:p.x+(R()-.5)*9,y:p.y+(R()-.5)*9},'grenade',null,k*4,k>0)},
  shower:p=>{for(let k=0;k<7;k++)effects.push({type:'meteor',x:clamp((p.x+(R()*20-10))|0,1,W-2),y:clamp((p.y+(R()*20-10))|0,1,H-2),t:-k*14,dur:52});SFXQ.push({t:'boom',x:null,y:null})},
  tstorm:p=>{wfx.push({type:'storm',x:p.x,y:p.y,until:step+200,next:step,r:9});setWeather('storm')},
  acid:p=>{wfx.push({type:'acid',x:p.x,y:p.y,until:step+260,r:6});log(`Acid rain fell ${nearTribeText(p.x|0,p.y|0)}.`,[140,210,80])},
  /* wonders */
  w_elixir:p=>splash(p,u=>{addOdd(u,'Immortal');u.hp=u.maxhp},[255,240,150]),
  w_giant:p=>splash(p,u=>{if(u.traits.includes('Giant'))return;if(u.traits.includes('Tiny')){u.traits=u.traits.filter(t=>t!=='Tiny');scaleUnit(u,1/.62,1/.6,1/.7)}addOdd(u,'Giant');scaleUnit(u,1.55,3,1.5)},[255,160,90]),
  w_tiny:p=>splash(p,u=>{if(u.traits.includes('Tiny'))return;if(u.traits.includes('Giant')){u.traits=u.traits.filter(t=>t!=='Giant');scaleUnit(u,1/1.55,1/3,1/1.5)}addOdd(u,'Tiny');scaleUnit(u,.62,.6,.7);u.spd*=1.25},[200,150,255]),
  w_bless:p=>splash(p,u=>{u.traits=u.traits.filter(t=>t!=='Cursed');addOdd(u,'Blessed');u.hp=u.maxhp},[255,250,190]),
  w_curse:p=>splash(p,u=>{u.traits=u.traits.filter(t=>t!=='Blessed');addOdd(u,'Cursed')},[120,40,150]),
  w_mad:p=>splash(p,u=>addOdd(u,'Berserk'),[240,60,60]),
  w_hero:p=>splash(p,u=>{for(const t of ['Strong','Tough','Brave'])if(!u.traits.includes(t))u.traits.push(t);u.maxhp*=1.3;u.hp=u.maxhp;u.dmg*=1.3;if(u.k===0)u.kills=Math.max(u.kills,5)},[255,210,80]),
  w_fountain:p=>splash(p,u=>{u.hp=u.maxhp;u.age=u.k===0?Math.max(ADULT,u.age*.4):Math.max(YEAR*1.5,u.age*.4);u.traits=u.traits.filter(t=>t!=='Cursed');u.frozen=0},[140,220,255]),
  w_love:p=>{
    const list=nearAll(p,splashR()).filter(u=>adult(u)&&!isMon(u));let n=0;
    const ppl=list.filter(u=>u.k===0);
    for(let k=0;k+1<ppl.length&&n<3&&units.length<1600;k+=2){addPerson(tribes[ppl[k].tribe],ppl[k].x|0,ppl[k].y|0,ppl[k],ppl[k+1]);n++}
    const bySp={};for(const u of list)if(u.k===1)(bySp[u.sp]=bySp[u.sp]||[]).push(u);
    for(const sp in bySp){const a=bySp[sp];for(let k=0;k+1<a.length&&n<8&&units.length<1600;k+=2){addAnimal(sp,a[k].x|0,a[k].y|0,a[k].owner,true).town=a[k].town;n++}}
    if(!n){toast('Love needs at least two adults of the same kind close together.');return}
    effects.push({type:'rite',x:p.x,y:p.y,c:[255,140,190],t:0,dur:40});sfx('spawn',p.x|0,p.y|0);
  },
  w_mutate:p=>splash(p,u=>{
    if(u.k===1){const pool=SPECIES_KEYS.filter(k=>k!==u.sp&&!SPECIES[k].monster&&k!=='dragon');morphAnimal(u,pick(pool));return}
    const L=RACES[u.race],g=u.genes,old=g.str;
    g.skin=(R()*L.skins.length)|0;g.hair=(R()*L.hairs.length)|0;g.str=clamp(g.str+(R()-.4)*.5,.6,1.6);g.vit=clamp(g.vit+(R()-.5)*.4,.6,1.6);g.agi=clamp(g.agi+(R()-.5)*.3,.7,1.4);
    u.maxhp*=g.str/old;u.hp=u.maxhp;u.dmg*=g.str/old;
    const t=pick(TRAIT_KEYS);if(!u.traits.includes(t))u.traits.push(t);
  },[120,230,120]),
  w_portal:p=>splash(p,teleport,[180,120,255]),
  w_freeze:p=>splash(p,u=>{u.frozen=step+260;u.target=null},[170,220,255]),
  w_shield:p=>splash(p,u=>{u.shield=step+700},[255,226,120]),
  w_haste:p=>splash(p,u=>{u.haste=step+600},[120,240,255]),
  w_aging:p=>splash(p,u=>{u.age+=u.k===0?YEAR*20:YEAR*4},[190,170,140]),
  w_clone:p=>{
    const list=nearAll(p,splashR()).slice(0,8);if(!list.length){toast('Nothing alive is close enough to copy.');return}
    for(const u of list){
      if(units.length>=1600)break;
      if(u.k===0){const T=tribes[u.tribe],c=addPerson(T,u.x|0,u.y|0,null,null,u.race);c.genes={...u.genes};c.traits=u.traits.slice();c.age=u.age;c.maxhp=c.hp=u.maxhp;c.dmg=u.dmg;c.town=u.town;c.odd=u.odd;c.scale=u.scale;if(u.job)setJob(c,u.job)}
      else{const c=addAnimal(u.sp,u.x|0,u.y|0,u.owner);c.age=u.age;c.town=u.town;c.scale=u.scale;c.maxhp=c.hp=u.maxhp;c.dmg=u.dmg;if(u.traits){c.traits=u.traits.slice();c.odd=u.odd}}
    }
    effects.push({type:'rite',x:p.x,y:p.y,c:[200,255,200],t:0,dur:40,big:true});sfx('spawn',p.x|0,p.y|0);
  },
  w_charm:p=>{
    const T=tribeNear(p);if(!T){toast('There is no kingdom near enough to befriend them.');return}
    const ok=splash(p,u=>{if(u.k!==1)return;u.charm=T.id;u.owner=T.id;u.town=nearestTown(T,u.x,u.y);u.target=null},[255,160,220]);
    if(ok)toast(`The creatures now serve the ${T.title}.`);
  },
  w_midas:p=>{
    let n=0;const r=splashR()+1;
    brushAt(p.x,p.y,r,i=>{if(tree[i]&&bio(hgt[i])>=3&&bio(hgt[i])<=5){tree[i]=0;ore[i]=ORE.GOLD;oreAmt[i]=20+((R()*20)|0);markTile(i);n++}});
    if(!n){toast('There are no trees to turn to gold here.');return}
    effects.push({type:'rite',x:p.x,y:p.y,c:[255,210,60],t:0,dur:40,big:true});sfx('unveil',p.x|0,p.y|0);
  },
  w_lush:p=>{
    const r=splashR()+1;
    brushAt(p.x,p.y,r,i=>{
      if(fire[i]){fire[i]=0;fires.delete(i)}burnt[i]=0;
      const b=bio(hgt[i]);if((b===3||b===4)&&bld[i]===-1)setBiome(i,BM.FLOWER,.25);
    });
    for(const u of units)if(!u.dead&&!isMon(u)&&Math.hypot(u.x-p.x,u.y-p.y)<r)u.hp=u.maxhp;
    effects.push({type:'rite',x:p.x,y:p.y,c:[255,170,210],t:0,dur:50,big:true});sfx('unveil',p.x|0,p.y|0);
  },
  w_chest:p=>{
    const x=p.x|0,y=p.y|0;let n=0;
    brushAt(p.x,p.y,1,i=>{const b=bio(hgt[i]);if(b>=3&&b<=5&&bld[i]===-1){ore[i]=pick([ORE.GOLD,ORE.SILVER,ORE.GEMS,ORE.GOLD]);oreAmt[i]=28+((R()*28)|0);tree[i]=0;markTile(i);n++}});
    if(!n){toast('A treasure chest needs dry ground to rest on.');return}
    effects.push({type:'rite',x:p.x,y:p.y,c:[255,224,110],t:0,dur:40});sfx('unveil',x,y);
  },
  w_feast:p=>{
    const T=tribeNear(p);if(!T){toast('No kingdom is near enough to celebrate.');return}
    festival(T);T.nextFest=year()+4+((R()*3)|0);toast(`The ${T.title} threw a feast in your honour.`);
  },
  /* the years run a slice per frame in the main loop (warpYears, ui.js), so tapping again and again never freezes the page */
  w_time:()=>warpYears(1),
  w_wish:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
    const outcomes=[
      ['A dragon answered the wish!',()=>{const d=addAnimal('dragon',x,y);d.y=d.py=Math.max(0,d.y-1)}],
      ['A rain of gold fell from the sky.',()=>{TAPS.w_chest(p);TAPS.w_chest({x:p.x+2,y:p.y});TAPS.w_chest({x:p.x-2,y:p.y+1})}],
      ['A shower of stars set the horizon alight.',()=>{for(let k=0;k<3;k++)effects.push({type:'meteor',x:clamp(x+((R()*18-9)|0),1,W-2),y:clamp(y+((R()*18-9)|0),1,H-2),t:-k*18,dur:52})}],
      ['Flowers burst from the ground.',()=>TAPS.w_lush(p)],
      ['Every kingdom was blessed with plenty.',()=>{for(const T of tribes)if(T.alive){T.food+=30;T.mat+=20;T.stab=clamp(T.stab+10,0,100)}}],
      ['A heavy darkness fell. Skeletons clawed from the soil.',()=>{for(let k=0;k<5;k++){const j=sampleNear(x,y,6,walk,10);if(j>=0)addAnimal('skeleton',j%W,(j/W)|0)}}],
      ['A giant stepped out of the mist.',()=>{const o=addAnimal('ogre',x,y);o.x=o.px=x+.5}],
      ['Rain sang across the world.',()=>setWeather('rain')],
      ['Animals of every kind appeared.',()=>{for(let k=0;k<6;k++){const j=sampleNear(x,y,5,walk,10);if(j>=0)addAnimal(pick(WILD_PICK),j%W,(j/W)|0)}}],
      ['The dead stirred.',()=>{for(let k=0;k<3;k++){const j=sampleNear(x,y,5,walk,10);if(j>=0)addAnimal('zombie',j%W,(j/W)|0)}}],
    ];
    const o=pick(outcomes);o[1]();toast('🌠 '+o[0]);sfx('fanfare',x,y);
  },
};

/* ---------- diplomacy and the noosphere: the shared mind of every kingdom ---------- */
let dipPending=null;
const hasWar=(a,b)=>wars.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));
function twoStep(tool,p,done,askA,askB){
  const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
  if(!dipPending||dipPending.tool!==tool){dipPending={tool,T};toast(`${askA}: ${T.title}. ${askB}`);return}
  const A=dipPending.T;dipPending=null;
  if(A===T){toast('Pick two different kingdoms.');return}
  done(A,T);
}
const DIP={
  peace:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    const n=wars.filter(w=>w.a===T.id||w.b===T.id).length;
    if(!n){toast(`The ${T.title} is already at peace.`);return}
    wars=wars.filter(w=>w.a!==T.id&&w.b!==T.id);
    log(`By divine decree the ${T.title} laid down their arms. All wars ended.`,[120,200,140]);sfx('fanfare',T.cx,T.cy);
  },
  war:p=>twoStep('war',p,(a,b)=>{
    if(hostile(a.id,b.id)){toast('They are already at war.');return}
    alliances=alliances.filter(x=>!((x.a===a.id&&x.b===b.id)||(x.a===b.id&&x.b===a.id)));
    declareWar(a,b);
  },'Aggressor','Now tap their enemy.'),
  alliance:p=>twoStep('alliance',p,(a,b)=>{
    if(allied(a.id,b.id)){toast('They are already allied.');return}
    wars=wars.filter(w=>!((w.a===a.id&&w.b===b.id)||(w.a===b.id&&w.b===a.id)));
    alliances.push({a:a.id,b:b.id,until:year()+14});
    log(`The ${a.title} and the ${b.title} sealed an alliance at your word.`,[96,190,140]);sfx('fanfare',null,null);
  },'First kingdom','Now tap their new ally.'),
  breakpact:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    const n=alliances.filter(a=>a.a===T.id||a.b===T.id).length;
    if(!n){toast(`The ${T.title} has no alliances.`);return}
    alliances=alliances.filter(a=>a.a!==T.id&&a.b!==T.id);
    log(`The ${T.title} broke every alliance it held.`,[200,140,90]);
  },
  inspire:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    T.devo=clamp(T.devo+10,0,100);T.stab=clamp(T.stab+6,0,100);T.renown+=1;
    if(T.hall>=0){T.food=Math.max(T.food,12);makeArt(T)}
    effects.push({type:'rite',x:T.cx+.5,y:T.cy+.5,c:[255,224,130],t:0,dur:70,big:true});
    log(`A wave of inspiration swept the ${T.title}.`,[255,224,130],true);toast(`Artists of the ${T.title} are inspired.`);
  },
  enlighten:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    if(T.age>=ERA_MAX){toast(`The ${T.title} has already reached the ${AGE_NAME[ERA_MAX]}.`);return}
    /* a flash of insight: the research and the ore for the next era, all at once */
    const q=ERA_REQ[T.age+1];T.sci=Math.max(T.sci||0,q.sci);for(const k in q.ore)T.res[k]=Math.max(T.res[k]||0,q.ore[k]);
    checkAge(T);
  },
  bless:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    T.stab=clamp(T.stab+15,0,100);T.devo=clamp(T.devo+12,0,100);T.bless=step+900;T.food+=15;T.fx=computeFx(T);
    for(const m of T.members)m.hp=m.maxhp;
    effects.push({type:'rite',x:T.cx+.5,y:T.cy+.5,c:[255,250,200],t:0,dur:70,big:true});sfx('bell',T.cx,T.cy);
    log(`A radiance blessed the ${T.title}.`,[255,250,200],true);
  },
  curse:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    T.stab=clamp(T.stab-30,0,100);T.devo=clamp(T.devo-15,0,100);T.food=Math.max(0,T.food-12);
    effects.push({type:'rite',x:T.cx+.5,y:T.cy+.5,c:[140,50,180],t:0,dur:70,big:true});sfx('thunder',T.cx,T.cy);
    log(`A dark whisper spread through the ${T.title}.`,[160,80,200],true);
  },
  revolt:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    if(T.members.filter(m=>adult(m)&&!m.inside).length<8){toast(`Too few adults in the ${T.title} to start a revolt.`);return}
    const before=tribes.length;rebellion(T);
    if(tribes.length===before)toast('No room nearby for the rebels to settle.');
  },
  missionary:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    const old=T.rel;convert(T);
    if(T.rel===old)toast(`No temple of the ${RACES[T.race].plural.toLowerCase()} is close enough to send missionaries.`);
  },
  gift:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    T.food+=30;T.mat+=24;effects.push({type:'rite',x:T.cx+.5,y:T.cy+.5,c:[140,220,140],t:0,dur:50});sfx('unveil',T.cx,T.cy);
    log(`Gifts of food and timber arrived for the ${T.title}.`,[140,220,140],true);toast(`${T.title} received food and timber.`);
  },
  colonize:p=>{
    const T=tribeNear(p);if(!T){toast('Tap a kingdom or its land.');return}
    const n=T.towns.length;settle(T);
    if(T.towns.length===n&&!boats.some(b=>!b.dead&&b.kind==='settler'&&b.tribe===T.id))toast(`The ${T.title} has too few people or nowhere to settle.`);
  },
};
Object.assign(TAPS,{
  peace:DIP.peace,war:DIP.war,alliance:DIP.alliance,breakpact:DIP.breakpact,inspire:DIP.inspire,enlighten:DIP.enlighten,
  dbless:DIP.bless,dcurse:DIP.curse,revolt:DIP.revolt,missionary:DIP.missionary,gift:DIP.gift,colonize:DIP.colonize,
});

/* ---------- domains: who holds which land (one owner per tile) ---------- */
let landTiles=1,ownSnap=null,landM=null,lastDomains=-99;
/* tiles whose owner changed since the colour layer was last drawn: the layer is only redrawn there */
const ovBox=[W,H,-1,-1];let ovFull=true;
/* a domain stops growing at DOM_RMAX tiles, and every domain shrinks once most land is held, so a frontier stays open */
const DOM_RMAX=14,DOM_FULL=.55;
const domainRadius=T=>Math.min(DOM_RMAX,3.2+Math.sqrt(T.houses)*1.9+(T.hall>=0?2.5:0)+(T.temple?1.5:0)+T.age*.5+Math.min(4,T.pop/12));
function computeDomains(){
  if(!landM)landM=new Uint8Array(N);
  let held=0;for(const T of tribes)if(T.alive)held+=T.area;
  const f=held/landTiles,squeeze=f>DOM_FULL?Math.max(.5,1-(f-DOM_FULL)*2.5):1;
  const rads=tribes.map(T=>T.alive?domainRadius(T)*squeeze*(T.area/landTiles>.18?.8:1):0);
  own.fill(-1);ownScore.fill(9);
  for(const T of tribes){T.area=0;for(const t of T.towns){t.houses=0;t.forge=0;t.dock=0;t.tower=0;t.mill=0}}
  let land=0;
  for(let i=0;i<N;i++){const l=bio(hgt[i])>=2;landM[i]=l;if(l)land++}
  /* scores are squared normalised distances, so no square roots in the inner loop */
  for(let i=0;i<N;i++){
    const o=bld[i];if(o<0)continue;
    const T=tribes[o];if(!T||!T.alive)continue;
    const bx=i%W,by=(i/W)|0;
    const bt=btype[i];
    if(bt<3)T.towns[nearestTown(T,bx,by)].houses++;
    else if(bt>=5){const tw=T.towns[nearestTown(T,bx,by)];if(bt===5)tw.forge=1;else if(bt===6)tw.dock=1;else if(bt===7)tw.tower++;else tw.mill=1}
    const m=bt===1?1.25:bt===4?.55:bt>=5?.5:1,rad=rads[o]*m,r2=rad*rad,inv=1/r2,rr=Math.ceil(rad);
    /* a building always holds its own tile */
    if(ownScore[i]>0){ownScore[i]=0;own[i]=o}
    for(let dy=-rr;dy<=rr;dy++){
      const Y=by+dy;if(Y<0||Y>=H)continue;
      const span=Math.sqrt(Math.max(0,r2-dy*dy))|0,row=Y*W,dy2=dy*dy;
      const xa=Math.max(0,bx-span),xb=Math.min(W-1,bx+span);
      for(let X=xa;X<=xb;X++){
        const j=row+X;if(!landM[j])continue;
        const dx=X-bx,sc=(dx*dx+dy2)*inv;
        if(sc>=1||sc>=ownScore[j])continue;
        ownScore[j]=sc;own[j]=o;
      }
    }
  }
  let changed=!ownSnap;if(!ownSnap){ownSnap=new Int16Array(N);ovFull=true}
  for(let i=0;i<N;i++){
    const o=own[i];if(o>=0)tribes[o].area++;
    if(ownSnap[i]!==o){
      ownSnap[i]=o;changed=true;const x=i%W,y=(i/W)|0;
      if(x<ovBox[0])ovBox[0]=x;if(y<ovBox[1])ovBox[1]=y;if(x>ovBox[2])ovBox[2]=x;if(y>ovBox[3])ovBox[3]=y;
    }
  }
  landTiles=Math.max(1,land);ownDirty=false;lastDomains=step;if(changed)ovDirty=true;
  computeRoads();
}
const sharePct=T=>Math.round(T.area/landTiles*1000)/10;

/* ---------- the monolith: a black slab whose beam wakes a mind in any creature it touches ---------- */
const monoliths=[],wfx=[];
TAPS.monolith=p=>{
  const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
  const k=monoliths.findIndex(m=>Math.hypot(m.x-x,m.y-y)<1.6);
  if(k>=0){monoliths.splice(k,1);toast('The monolith sinks back into the earth.');return}
  if(isWater(y*W+x)){toast('The monolith needs solid ground.');return}
  monoliths.push({x,y,next:step+60,beams:0});sfx('unveil',x,y);
  effects.push({type:'beam',x:x+.5,y:y+.5,r:4.5,t:0,dur:50});
  toast('A monolith rises. Every 10 seconds its beam awakens the creatures around it. Tap it again to remove it.');
  log(`A black monolith rose ${nearTribeText(x,y)}.`,[160,200,255]);
};
function updateMonoliths(){
  for(const m of monoliths){
    if(step<m.next)continue;
    m.next=step+200;m.beams++;
    effects.push({type:'beam',x:m.x+.5,y:m.y+.5,r:4.5,t:0,dur:50});sfx('unveil',m.x,m.y);
    let n=0;
    for(const u of units){
      if(n>=6)break;
      if(u.dead||u.k!==1||u.inside||Math.hypot(u.x-m.x-.5,u.y-m.y-.5)>4.5)continue;
      if(upliftUnit(u))n++;
    }
  }
}
function upliftUnit(u){
  const sp=u.sp,key=makeUpliftRace(sp);addRaceTile(key);
  const tile=ringFind(u.x|0,u.y|0,4,walk);if(tile<0)return false;
  const tx=tile%W,ty=(tile/W)|0;
  let T=null,bd=30*30;
  for(const t of tribes){if(!t.alive||t.race!==key)continue;for(const H of t.towns){const d=(H.x-tx)**2+(H.y-ty)**2;if(d<bd){bd=d;T=t}}}
  if(!T){T=newTribe(key,tx,ty);log(`Touched by the monolith, ${SPECIES[sp].name.toLowerCase()}s awoke as the ${RACES[key].plural} and founded the ${T.title}.`,T.color,false,newsAt(T,'✨',3))}
  const pp=addPerson(T,tx,ty,null,null,key);
  pp.x=pp.px=u.x;pp.y=pp.py=u.y;pp.tx=pp.x;pp.ty=pp.y;pp.age=ADULT+((R()*6*YEAR)|0);pp.town=nearestTown(T,tx,ty);
  T.pop++;
  effects.push({type:'rite',x:pp.x,y:pp.y,c:[160,220,255],t:0,dur:40});
  die(u);
  return true;
}

/* ---------- lasting chaos: tornadoes, black holes, storms, acid rain, cluster bombs ---------- */
function updateWorldFx(){
  updateVolcanoes();updateMonoliths();faunaWorld();
  for(let k=wfx.length-1;k>=0;k--){
    const f=wfx[k];
    if(f.type==='delay'){if(step>=f.at){blast(f.x,f.y,f.o);wfx.splice(k,1)}continue}
    if(f.type==='fall'){if(step>=f.land){wfx.splice(k,1);landBomb(f)}continue}
    if(step>f.until){if(f.type==='hole')blast(f.x,f.y,{r:3.5,void:true,core:1,shake:14,dur:40,c:[150,90,220],dark:true,name:'The black hole',snd:'boom'});wfx.splice(k,1);continue}
    if(f.type==='tornado'){
      f.a+=(R()-.5)*.5;f.x+=Math.cos(f.a)*.09;f.y+=Math.sin(f.a)*.09;
      if(!inb(f.x|0,f.y|0)){wfx.splice(k,1);continue}
      for(const u of units){
        if(u.dead||u.inside)continue;const d=Math.hypot(u.x-f.x,u.y-f.y);if(d>=f.r)continue;
        if(R()<.035){die(u);continue}
        const a=Math.atan2(u.y-f.y,u.x-f.x)+1.4,nx=u.x+Math.cos(a)*.22,ny=u.y+Math.sin(a)*.22;
        if(inb(nx|0,ny|0)){u.x=nx;u.y=ny;u.tx=nx;u.ty=ny}
      }
      for(const b of boats)if(Math.hypot(b.x-f.x,b.y-f.y)<f.r&&R()<.05)b.dead=true;
      if(R()<.6){const X=(f.x+(R()-.5)*3)|0,Y=(f.y+(R()-.5)*3)|0;if(inb(X,Y)){const i=Y*W+X;if(tree[i]&&R()<.35){tree[i]=0;markTile(i)}if(bld[i]>=0&&R()<.05){destroyBld(i);burn(i,500)}}}
    }else if(f.type==='hole'){
      for(const u of units){
        if(u.dead)continue;const dx=f.x-u.x,dy=f.y-u.y,d=Math.hypot(dx,dy);if(d>f.r)continue;
        if(d<.7){die(u);continue}
        const pull=.12*(1-d/f.r)+.03;u.x+=dx/d*pull;u.y+=dy/d*pull;u.tx=u.x;u.ty=u.y;u.inside=false;
      }
      for(const b of boats)if(Math.hypot(b.x-f.x,b.y-f.y)<f.r*.6)b.dead=true;
      if(R()<.5){const a=R()*6.28,d=R()*3,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(inb(X,Y)){const i=Y*W+X;destroyBld(i);tree[i]=0;hgt[i]=Math.max(0,hgt[i]-.02);afterH(i)}}
      shake=reduceMotion?0:Math.max(shake,3);
    }else if(f.type==='storm'){
      if(step>=f.next){f.next=step+5+((R()*6)|0);strike({x:f.x+(R()-.5)*f.r*2,y:f.y+(R()-.5)*f.r*2})}
    }else if(f.type==='acid'){
      for(let n=0;n<6;n++){
        const a=R()*6.28,d=Math.sqrt(R())*f.r,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(!inb(X,Y))continue;const i=Y*W+X;
        if(tree[i]&&R()<.06){tree[i]=0;markTile(i)}
        if(bld[i]>=0&&R()<.004)destroyBld(i);
        if(R()<.01&&(bio(hgt[i])===3||bio(hgt[i])===4)){bm[i]=BM.WASTE;markDirty(i)}
      }
      for(const u of units){if(u.dead||u.inside||Math.hypot(u.x-f.x,u.y-f.y)>=f.r)continue;u.hp-=.12;if(u.hp<=0)die(u)}
    }else if(WFX2[f.type])WFX2[f.type](f);
  }
}
