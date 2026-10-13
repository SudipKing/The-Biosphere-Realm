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
function addOdd(u,name){u.odd=true;if(!u.traits.includes(name))u.traits.push(name)}

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
  for(const u of units)if(!u.dead&&Math.hypot(u.x-p.x,u.y-p.y)<r){u.hp-=u.maxhp*(.1+R()*.4);if(u.hp<=0)die(u)}
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

/* ---------- wonders and oddities ---------- */
function splash(p,fn,col,empty){
  const list=nearP(p,splashR());
  if(!list.length){toast(empty||'No one is close enough. Tap near a person.');return false}
  for(const u of list)fn(u);
  effects.push({type:'rite',x:p.x,y:p.y,c:col||[255,230,150],t:0,dur:36});sfx('spawn',p.x|0,p.y|0);
  return true;
}
function scaleUnit(u,s,hpm,dmgm){
  u.scale=s;u.maxhp*=hpm;u.hp=u.maxhp;u.dmg*=dmgm;
}
const TAPS={
  meteor:p=>{if(inb(p.x|0,p.y|0)){effects.push({type:'meteor',x:p.x|0,y:p.y|0,t:0,dur:52});SFXQ.push({t:'boom',x:null,y:null})}},
  lightning:p=>strike(p),
  grenade:p=>blast(p.x,p.y,BOMBS.grenade),bomb:p=>blast(p.x,p.y,BOMBS.bomb),
  antimatter:p=>blast(p.x,p.y,BOMBS.antimatter),nuke:p=>blast(p.x,p.y,BOMBS.nuke),tsar:p=>blast(p.x,p.y,BOMBS.tsar),
  molotov,laser,earthquake,volcano,flood,plague,
  /* wonders */
  w_elixir:p=>splash(p,u=>{addOdd(u,'Immortal');u.hp=u.maxhp},[255,240,150]),
  w_giant:p=>splash(p,u=>{if(u.traits.includes('Giant'))return;u.traits=u.traits.filter(t=>t!=='Tiny');addOdd(u,'Giant');scaleUnit(u,1.55,3,1.5)},[255,160,90]),
  w_tiny:p=>splash(p,u=>{if(u.traits.includes('Tiny'))return;u.traits=u.traits.filter(t=>t!=='Giant');addOdd(u,'Tiny');scaleUnit(u,.62,.6,.7);u.spd*=1.25},[200,150,255]),
  w_bless:p=>splash(p,u=>{u.traits=u.traits.filter(t=>t!=='Cursed');addOdd(u,'Blessed');u.hp=u.maxhp},[255,250,190]),
  w_curse:p=>splash(p,u=>{u.traits=u.traits.filter(t=>t!=='Blessed');addOdd(u,'Cursed')},[120,40,150]),
  w_mad:p=>splash(p,u=>addOdd(u,'Berserk'),[240,60,60]),
  w_hero:p=>splash(p,u=>{for(const t of ['Strong','Tough','Brave'])if(!u.traits.includes(t))u.traits.push(t);u.maxhp*=1.3;u.hp=u.maxhp;u.dmg*=1.3;u.kills=Math.max(u.kills,5)},[255,210,80]),
  w_fountain:p=>{
    const ok=splash(p,u=>{u.hp=u.maxhp;u.age=Math.max(ADULT,u.age*.4);u.traits=u.traits.filter(t=>t!=='Cursed')},[140,220,255]);
    if(ok)for(const u of units)if(u.k===1&&Math.hypot(u.x-p.x,u.y-p.y)<splashR()&&!isMon(u))u.hp=u.maxhp;
  },
  w_love:p=>{
    const list=nearP(p,splashR()).filter(adult);
    if(list.length<2){toast('Love needs at least two adults close together.');return}
    let n=0;for(let k=0;k+1<list.length&&n<3&&units.length<1600;k+=2){addPerson(tribes[list[k].tribe],list[k].x|0,list[k].y|0,list[k],list[k+1]);n++}
    effects.push({type:'rite',x:p.x,y:p.y,c:[255,140,190],t:0,dur:40});sfx('spawn',p.x|0,p.y|0);
  },
  w_mutate:p=>splash(p,u=>{
    const L=RACES[u.race],g=u.genes,old=g.str;
    g.skin=(R()*L.skins.length)|0;g.hair=(R()*L.hairs.length)|0;g.str=clamp(g.str+(R()-.4)*.5,.6,1.6);g.vit=clamp(g.vit+(R()-.5)*.4,.6,1.6);g.agi=clamp(g.agi+(R()-.5)*.3,.7,1.4);
    u.maxhp*=g.str/old;u.hp=u.maxhp;u.dmg*=g.str/old;
    const t=pick(TRAIT_KEYS);if(!u.traits.includes(t))u.traits.push(t);
  },[120,230,120]),
  w_portal:p=>splash(p,u=>{
    const j=randomLand(walk,200);if(j<0)return;
    u.x=u.px=j%W+.5;u.y=u.py=((j/W)|0)+.5;u.tx=u.x;u.ty=u.y;u.target=null;u.task=null;u.cd=0;
    effects.push({type:'rite',x:u.x,y:u.y,c:[180,120,255],t:0,dur:30});
  },[180,120,255]),
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
  w_time:()=>{toast('Spinning the hourglass: a year passes…');setTimeout(()=>{for(let k=0;k<YEAR;k++)simStep()},40)},
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
    if(T.age>=5){toast(`The ${T.title} has already reached the ${AGE_NAME[5]}.`);return}
    const next=T.age+1,r=T.res;
    r.stone=Math.max(r.stone,60);if(next>=2)r.copper=Math.max(r.copper,70);if(next>=3)r.iron=Math.max(r.iron,80);
    if(next>=4){r.coal=Math.max(r.coal,60);r.iron=Math.max(r.iron,180)}if(next>=5){r.gold=Math.max(r.gold,60);r.silver=Math.max(r.silver,60)}
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
    const n=tribes.length;settle(T);
    if(tribes.length===n&&!boats.some(b=>!b.dead&&b.kind==='settler'&&b.tribe===T.id))toast(`The ${T.title} has too few people or nowhere to settle.`);
  },
};
Object.assign(TAPS,{
  peace:DIP.peace,war:DIP.war,alliance:DIP.alliance,breakpact:DIP.breakpact,inspire:DIP.inspire,enlighten:DIP.enlighten,
  dbless:DIP.bless,dcurse:DIP.curse,revolt:DIP.revolt,missionary:DIP.missionary,gift:DIP.gift,colonize:DIP.colonize,
});

/* ---------- domains: who holds which land (one owner per tile) ---------- */
let landTiles=1,ownSnap=null;
const domainRadius=T=>3.2+Math.sqrt(T.houses)*1.9+(T.hall>=0?2.5:0)+(T.temple?1.5:0)+T.age*.5+Math.min(4,T.pop/12);
function computeDomains(){
  own.fill(-1);ownScore.fill(9);
  const rads=tribes.map(T=>T.alive?domainRadius(T):0);
  for(const T of tribes)T.area=0;
  let land=0;
  for(let i=0;i<N;i++){
    if(bio(hgt[i])>=2)land++;
    const o=bld[i];if(o<0)continue;
    const T=tribes[o];if(!T||!T.alive)continue;
    const bx=i%W,by=(i/W)|0,m=btype[i]===1?1.25:btype[i]===4?.55:1,rad=rads[o]*m,rr=Math.ceil(rad);
    for(let dy=-rr;dy<=rr;dy++){
      const Y=by+dy;if(Y<0||Y>=H)continue;
      for(let dx=-rr;dx<=rr;dx++){
        const X=bx+dx;if(X<0||X>=W)continue;
        const j=Y*W+X,sc=Math.hypot(dx,dy)/rad;
        if(sc>=1||sc>=ownScore[j]||bio(hgt[j])<2)continue;
        ownScore[j]=sc;own[j]=o;
      }
    }
  }
  let changed=!ownSnap;if(!ownSnap)ownSnap=new Int16Array(N);
  for(let i=0;i<N;i++){const o=own[i];if(o>=0)tribes[o].area++;if(ownSnap[i]!==o){ownSnap[i]=o;changed=true}}
  landTiles=Math.max(1,land);ownDirty=false;if(changed)ovDirty=true;
}
const sharePct=T=>Math.round(T.area/landTiles*1000)/10;
