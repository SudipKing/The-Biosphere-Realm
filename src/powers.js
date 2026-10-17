"use strict";
/* ============ More chaos and wonders: extra powers added to the tray (POWER_ITEMS), the lifting magnet and falling bombs ============
   Everything lasting here is a plain-data wfx entry (saved with the world). Drawing goes through FXDRAW and only reads state. */
const POWER_ITEMS={chaos:[],wonders:[]};
const pInb=p=>inb(p.x|0,p.y|0);
const pcl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ar=()=>typeof alpha==='number'?alpha:0;

/* ---------- sounds ---------- */
Object.assign(SFX,{
  whistle:(o,t)=>{osc(o,'sine',2600,520,t,.02,.95,.07);noiseHit(o,'bandpass',3600,700,6,t,.05,.9,.12)},
  swarm:(o,t)=>{for(let k=0;k<6;k++)osc(o,'sawtooth',150+RC()*40,140+RC()*40,t+k*.12,.02,.2,.03);noiseHit(o,'bandpass',2200,1800,2,t,.1,.6,.08)},
  chime:(o,t)=>{[1046,1318,1568,2093].forEach((f,k)=>osc(o,'sine',f,f,t+k*.14,.01,1.2,.07))},
  rumble:(o,t)=>{noiseHit(o,'lowpass',200,60,1,t,.05,1.6,.8);osc(o,'sine',44,30,t,.05,1.4,.5)},
});

/* ================= falling bombs ================= */
/* a bomb is a 'fall' entry: {type:'fall',x,y,at,land,k,sz,o,m}. o is a BOMBS entry (saved by name), m names a FALLFN for bombs that are not a plain blast */
const FALLFN={
  molotov:f=>molotov({x:f.x,y:f.y}),
  napalm:f=>{for(let k=0;k<26;k++){const a=R()*6.28,d=R()*8,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(inb(X,Y))ignite(Y*W+X,true)}},
};
function dropBomb(p,key,m,delay,quiet){
  if(!pInb(p))return;
  delay=delay|0;const o=key?BOMBS[key]:undefined,r=o?o.r:3;
  const dur=Math.round(12+Math.min(r,26)*.7);   /* 12 to 30 steps: 0.6 to 1.5 s, bigger bombs fall slower */
  const k=o&&o.void?'void':o&&o.big?'big':m?'fire':r<3?'nade':'shell';
  const f={type:'fall',x:p.x,y:p.y,at:step+delay,land:step+delay+dur,k,sz:r,m:m||null};
  if(o)f.o=o;
  wfx.push(f);
  if(!quiet)sfx('whistle',p.x|0,p.y|0);
}
function landBomb(f){
  if(f.o)blast(f.x,f.y,f.o);
  if(f.m&&FALLFN[f.m])FALLFN[f.m](f);
}
BOMBS.carpet={r:2.6,crater:.06,fire:.35,core:.9,shake:5,dur:24,c:[255,190,110],name:'A carpet bomb',snd:'boom'};
TAPS.napalm=p=>dropBomb(p,'napalm','napalm');

/* ================= the lifting magnet (Wonders) =================
   Dragging calls BRUSHFN.w_magnet every frame; it only records the cursor. The grab entry {type:'grab',x,y,r,seen,ids,ox,oy} lives in wfx:
   each sim step (WFX2.grab) it picks up creatures within r (up to 60) and eases them toward the cursor; when the brush stops being called
   it drops them. Units are held off the ground by .7 tile and "fly" and "frozen" only while updateUnits runs (wrapped below), so they neither act nor drown. */
const HOVER=.7,GRAB_MAX=60;
let magRT=-1e9,gcache={U:null,f:null,n:-1,arr:[]};
const grabEntry=()=>wfx.find(f=>f.type==='grab');
function grabUnits(f){
  if(gcache.U!==units||gcache.f!==f||gcache.n!==f.ids.length){
    const m=new Map();for(const u of units)m.set(u.id,u);
    gcache={U:units,f,n:f.ids.length,arr:f.ids.map(id=>m.get(id)||null)};
  }
  return gcache.arr;
}
const grabOff=id=>[((id*37%11)-5)*.11,((id*53%9)-4)*.09];
BRUSHFN.w_magnet=(p,r)=>{
  magRT=performance.now();
  let f=grabEntry();
  if(!f){f={type:'grab',x:p.x,y:p.y,r:1,seen:step,ids:[],ox:[],oy:[]};wfx.push(f);sfx('spawn',p.x|0,p.y|0)}
  f.x=p.x;f.y=p.y;f.r=1.2+(r+1)*1.4;f.seen=step;
};
const _updateUnits=updateUnits;
updateUnits=function(){
  const f=grabEntry();
  if(!f||!f.ids.length)return _updateUnits();
  const arr=grabUnits(f),sv=[];
  for(const u of arr)if(u&&!u.dead){sv.push(u,u.fly,u.frozen);u.fly=true;u.frozen=step+5}
  _updateUnits();
  for(let k=0;k<sv.length;k+=3){const u=sv[k];u.fly=sv[k+1];u.frozen=sv[k+2]}
};
function releaseGrab(f,arr){
  let n=0;
  for(const u of arr){
    if(!u||u.dead)continue;
    u.y=Math.min(H-.01,u.y+HOVER);u.py=u.y;u.px=u.x;u.tx=u.x;u.ty=u.y;u.target=null;u.task=null;u.cd=8;n++;
  }
  if(n){effects.push({type:'rite',x:f.x,y:f.y,c:[200,210,255],t:0,dur:20});sfx('thud',f.x|0,f.y|0)}
  const k=wfx.indexOf(f);if(k>=0)wfx.splice(k,1);
  gcache={U:null,f:null,n:-1,arr:[]};
}
Object.assign(WFX2,{
  grab(f){
    let arr=grabUnits(f);
    if(step-f.seen>=8&&performance.now()-magRT>150){releaseGrab(f,arr);return}
    /* forget the dead */
    if(arr.some(u=>!u||u.dead||u.inside)){
      const ids=[],ox=[],oy=[];
      for(let k=0;k<arr.length;k++){const u=arr[k];if(u&&!u.dead&&!u.inside){ids.push(f.ids[k]);ox.push(f.ox[k]);oy.push(f.oy[k])}}
      f.ids=ids;f.ox=ox;f.oy=oy;gcache.f=null;arr=grabUnits(f);
    }
    /* pick up whoever is within reach */
    if(f.ids.length<GRAB_MAX){
      const have=new Set(f.ids);let added=false;
      for(const u of units){
        if(f.ids.length>=GRAB_MAX)break;
        if(u.dead||u.inside||have.has(u.id))continue;
        if(Math.hypot(u.x-f.x,u.y-HOVER*0-f.y)>f.r)continue;
        f.ids.push(u.id);f.ox.push(u.x-f.x);f.oy.push(u.y-f.y);added=true;
      }
      if(added){gcache.f=null;arr=grabUnits(f);sfx('spawn',f.x|0,f.y|0)}
    }
    /* carry them */
    for(let k=0;k<arr.length;k++){
      const u=arr[k];if(!u)continue;
      f.ox[k]*=.97;f.oy[k]*=.97;
      const [hx,hy]=grabOff(u.id),t=step+u.id;
      const tx=pcl(f.x+f.ox[k]+hx+Math.sin(t*.31)*.12,.5,W-.5),ty=pcl(f.y+f.oy[k]+hy-HOVER+Math.cos(t*.37)*.1,.5,H-.5);
      const dx=tx-u.x,dy=ty-u.y;
      u.x+=dx*.3;u.y+=dy*.3;u.tx=u.x;u.ty=u.y;
      if(Math.abs(dx)>.04)u.dir=dx>0?1:-1;
      u.target=null;u.task=null;u.moving=false;
    }
  },
});
Object.assign(FXDRAW,{
  grab(f,X,Y,tz,pz){
    const arr=grabUnits(f),my=Y-tz*3.4+Math.sin(frameN*.12)*tz*.2,w=tz*1.1;
    ctx.save();
    ctx.setLineDash([tz*.5,tz*.4]);ctx.lineWidth=Math.max(1,pz*.8);ctx.strokeStyle='rgba(150,180,255,.45)';
    ctx.beginPath();ctx.arc(X,Y,tz*f.r,0,7);ctx.stroke();ctx.setLineDash([]);
    ctx.lineWidth=Math.max(1,pz*.6);
    for(const u of arr){
      if(!u||u.dead)continue;
      const ux=X+(u.x-f.x)*tz,uy=Y+(u.y-f.y)*tz;
      ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(ux,uy+HOVER*tz,tz*.4,tz*.16,0,0,7);ctx.fill();
      ctx.strokeStyle=`rgba(170,200,255,${.25+.2*Math.sin(frameN*.2+u.id)})`;
      ctx.beginPath();ctx.moveTo(X,my+w*.2);ctx.quadraticCurveTo((X+ux)/2+Math.sin(frameN*.1+u.id)*tz*.6,(my+uy)/2,ux,uy-tz*.8);ctx.stroke();
    }
    /* the horseshoe: a red arch with silver tips */
    ctx.lineCap='butt';ctx.lineWidth=Math.max(3,w*.55);
    ctx.strokeStyle='#d83a3a';ctx.beginPath();ctx.arc(X,my,w,0,Math.PI);ctx.moveTo(X-w,my);ctx.lineTo(X-w,my-w*.9);ctx.moveTo(X+w,my);ctx.lineTo(X+w,my-w*.9);ctx.stroke();
    ctx.strokeStyle='#e8ecf4';ctx.beginPath();ctx.moveTo(X-w,my-w*.9);ctx.lineTo(X-w,my-w*1.5);ctx.moveTo(X+w,my-w*.9);ctx.lineTo(X+w,my-w*1.5);ctx.stroke();
    ctx.restore();
  },
  fall(f,X,Y,tz,pz){
    if(step<f.at)return;
    const dur=Math.max(1,f.land-f.at),q=pcl((step-f.at+ar())/dur,0,1);
    const big=f.k==='big'||f.k==='void',s=tz*(f.k==='nade'?.5:big?1.15:.75);
    if(big&&f.o){ctx.save();ctx.setLineDash([tz*.8,tz*.6]);ctx.strokeStyle=`rgba(255,80,60,${.2+.45*q})`;ctx.lineWidth=Math.max(1,pz);ctx.beginPath();ctx.arc(X,Y,tz*f.o.r*(.3+.7*q),0,7);ctx.stroke();ctx.restore()}
    ctx.fillStyle=`rgba(0,0,0,${.1+.3*q})`;ctx.beginPath();ctx.ellipse(X,Y,s*(.35+q*1.1),s*(.14+q*.45),0,0,7);ctx.fill();
    const h=Math.pow(1-q,1.4)*tz*44,bx=X+(1-q)*tz*4,by=Y-h-s*.8;
    ctx.strokeStyle=`rgba(255,235,190,${.5*(1-q*.6)})`;ctx.lineWidth=Math.max(1,s*.25);
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+tz*1.6,by-tz*5);ctx.stroke();
    if(f.k==='void'){
      ctx.fillStyle='#1a0830';ctx.beginPath();ctx.arc(bx,by,s*.7,0,7);ctx.fill();
      ctx.strokeStyle='#c890ff';ctx.lineWidth=Math.max(1,s*.18);ctx.beginPath();ctx.arc(bx,by,s*.7,frameN*.2,frameN*.2+4);ctx.stroke();
    }else if(f.k==='fire'){
      ctx.fillStyle='#7ac89a';ctx.fillRect(bx-s*.3,by-s*.2,s*.6,s*.7);ctx.fillStyle='#e8dcc0';ctx.fillRect(bx-s*.15,by-s*.55,s*.3,s*.35);
      ctx.fillStyle=frameN&2?'#ffb040':'#ff6020';ctx.fillRect(bx-s*.2,by-s*1.1,s*.4,s*.6);
    }else{
      ctx.fillStyle=big?'#8a909c':'#2c2f3a';ctx.beginPath();ctx.ellipse(bx,by,s*.4,s*.72,0,0,7);ctx.fill();
      if(big){ctx.fillStyle='#d84030';ctx.fillRect(bx-s*.4,by-s*.1,s*.8,s*.22);ctx.fillStyle='#f6d860';ctx.beginPath();ctx.arc(bx,by+s*.62,s*.18,0,7);ctx.fill()}
      ctx.fillStyle=big?'#b0b6c4':'#555a6c';ctx.fillRect(bx-s*.55,by-s*.78,s*1.1,s*.2);
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(bx-s*.22,by-s*.3,s*.1,s*.4);
      if(!big){ctx.fillStyle=frameN&2?'#ffd04a':'#ff8a30';ctx.fillRect(bx-s*.1,by-s*1.05,s*.2,s*.2)}
    }
  },
});

/* ================= extra chaos ================= */
Object.assign(TAPS,{
  carpet:p=>{
    if(!pInb(p))return;
    const a=R()*Math.PI,c=Math.cos(a),s=Math.sin(a);
    for(let k=0;k<9;k++){const t=(k-4)*2.5;dropBomb({x:clamp(p.x+c*t+(R()-.5)*1.2,1,W-2),y:clamp(p.y+s*t+(R()-.5)*1.2,1,H-2)},'carpet',null,k*3,k>0)}
    log(`A bombing run roared over ${nearTribeText(p.x|0,p.y|0)}.`,[236,150,60]);
  },
  c_sinkhole:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=4.6;
    for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){
      const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
      const i=Y*W+X,f=d/r;hgt[i]=Math.min(hgt[i],.2+f*.17);ore[i]=0;if(lava[i]){lava[i]=0;lavas.delete(i)}afterH(i);
    }
    for(const u of units)if(!u.dead&&!u.inside&&!u.fly&&Math.hypot(u.x-p.x,u.y-p.y)<r*.85)die(u);
    effects.push({type:'blast',x:x+.5,y:y+.5,r:r*1.2,t:0,dur:40,c:[150,120,90],dark:true,big:false});
    sfx('rumble',x,y);shake=reduceMotion?0:Math.max(shake,16);ownDirty=true;bDirty=true;
    log(`The ground collapsed into a sinkhole ${nearTribeText(x,y)}.`,[150,120,90]);
  },
  c_fissure:p=>{
    if(!pInb(p))return;
    const a=R()*6.28,L=15;let n=0;
    for(let t=-L;t<=L;t+=.5){
      const w=Math.sin(t*.35)*1.4,X=(p.x+Math.cos(a)*t-Math.sin(a)*w)|0,Y=(p.y+Math.sin(a)*t+Math.cos(a)*w)|0;
      if(!inb(X,Y))continue;const i=Y*W+X;
      if(bio(hgt[i])>=2&&bio(hgt[i])<=5){destroyBld(i);tree[i]=0;ore[i]=0;lava[i]=420+((R()*300)|0);lavas.add(i);burn(i,900);markTile(i);n++}
    }
    for(const u of units)if(!u.dead&&!u.inside&&!u.fly&&inb(u.x|0,u.y|0)&&lava[tileOf(u)])die(u);
    effects.push({type:'blast',x:p.x,y:p.y,r:6,t:0,dur:40,c:[255,120,40],dark:false,big:false});
    sfx('rumble',p.x|0,p.y|0);shake=reduceMotion?0:Math.max(shake,20);ownDirty=true;bDirty=true;
    log(`The earth split open in a river of lava ${nearTribeText(p.x|0,p.y|0)}.`,[255,120,40]);
  },
  c_locust:p=>{
    if(!pInb(p))return;
    wfx.push({type:'locust',x:p.x,y:p.y,a:R()*6.28,until:step+420,r:4});
    sfx('swarm',p.x|0,p.y|0);log(`A swarm of locusts descended ${nearTribeText(p.x|0,p.y|0)}.`,[170,150,60]);
  },
  c_firestorm:p=>{
    if(!pInb(p))return;
    wfx.push({type:'firestorm',x:p.x,y:p.y,a:R()*6.28,until:step+260,r:5});
    sfx('crackle',p.x|0,p.y|0);shake=reduceMotion?0:Math.max(shake,4);
    log(`A firestorm roared ${nearTribeText(p.x|0,p.y|0)}.`,[255,110,30]);
  },
  c_frogs:p=>{
    if(!pInb(p))return;
    wfx.push({type:'frogs',x:p.x,y:p.y,until:step+130,r:7});sfx('splash',p.x|0,p.y|0);toast('It is raining frogs.');
  },
  c_decay:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=13;let n=0;const hit=new Set();
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
      const i=Y*W+X;if(bld[i]<0||R()>.85*(1-d/r*.5))continue;
      hit.add(bld[i]);destroyBld(i);bld[i]=-2;btype[i]=3;markTile(i);n++;
    }
    for(const id of hit){const T=tribes[id];if(T)T.stab=clamp(T.stab-6,0,100)}
    effects.push({type:'blast',x:x+.5,y:y+.5,r:r,t:0,dur:50,c:[150,140,130],dark:true,big:false});
    sfx('rumble',x,y);ownDirty=true;bDirty=true;
    if(n)log(`A wave of decay turned ${n} buildings to ruin ${nearTribeText(x,y)}.`,[150,140,130]);
    else toast('There was nothing here to crumble.');
  },
  c_gravity:p=>{
    if(!pInb(p))return;
    const r=splashR()+3;let n=0;
    for(const u of units){
      if(u.dead||u.inside||Math.hypot(u.x-p.x,u.y-p.y)>r)continue;
      n++;effects.push({type:'rite',x:u.x,y:u.y,c:[190,160,255],t:0,dur:16});
      const j=sampleNear(u.x|0,u.y|0,18,k=>canStand(u,k),14);
      if(j>=0){u.x=u.px=j%W+.5;u.y=u.py=((j/W)|0)+.5;u.tx=u.x;u.ty=u.y;u.target=null;u.task=null;u.cd=0}
      u.hp-=u.maxhp*(.1+R()*.25);if(u.hp<=0)die(u);
      else effects.push({type:'rite',x:u.x,y:u.y,c:[190,160,255],t:0,dur:16});
    }
    if(!n){toast('Nothing alive is close enough to throw.');return}
    effects.push({type:'blast',x:p.x,y:p.y,r:r,t:0,dur:30,c:[190,160,255],dark:false,big:false});
    sfx('thud',p.x|0,p.y|0);shake=reduceMotion?0:Math.max(shake,8);
  },
});
const tribeAt=(x,y)=>{const o=own[(y|0)*W+(x|0)];return o>=0&&tribes[o]&&tribes[o].alive?tribes[o]:null};
const roam=(f,spd,wob)=>{f.a+=(R()-.5)*wob;f.x+=Math.cos(f.a)*spd;f.y+=Math.sin(f.a)*spd;if(f.x<2||f.x>W-3)f.a=Math.PI-f.a;if(f.y<2||f.y>H-3)f.a=-f.a;f.x=pcl(f.x,1,W-2);f.y=pcl(f.y,1,H-2)};
Object.assign(WFX2,{
  locust(f){
    roam(f,.07,.6);
    if(step%10)return;
    const T=tribeAt(f.x,f.y);if(T)T.food=Math.max(0,T.food-.7);
    for(let n=0;n<4;n++){
      const a=R()*6.28,d=Math.sqrt(R())*f.r,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(!inb(X,Y))continue;
      const i=Y*W+X;if(tree[i]&&R()<.3){tree[i]=0;markTile(i)}
    }
    for(const u of units){if(u.dead||u.inside||u.k!==0||Math.hypot(u.x-f.x,u.y-f.y)>f.r)continue;u.hp-=.4;if(u.hp<=0)die(u)}
    if(R()<.25)sfx('swarm',f.x|0,f.y|0);
  },
  firestorm(f){
    roam(f,.05,.4);
    for(let n=0;n<5;n++){
      const a=R()*6.28,d=Math.sqrt(R())*f.r,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(!inb(X,Y))continue;
      if(R()<.4)ignite(Y*W+X,true);
    }
    if(step%4===0)for(const u of units){if(u.dead||u.inside||Math.hypot(u.x-f.x,u.y-f.y)>f.r)continue;u.hp-=.5;if(u.hp<=0)die(u)}
    if(step%40===0)sfx('crackle',f.x|0,f.y|0);
  },
  frogs(f){
    if(step%5||units.length>1400||(cnt.sp.frog||0)>=70)return;
    const j=sampleNear(f.x|0,f.y|0,f.r,k=>{const b=bio(hgt[k]);return b>=1&&b<=3&&!lava[k]},10);
    if(j<0)return;
    const u=addAnimal('frog',j%W,(j/W)|0);effects.push({type:'rite',x:u.x,y:u.y,c:[120,220,100],t:0,dur:14});
    if(R()<.3)sfx('splash',j%W,(j/W)|0);
  },
});
Object.assign(FXDRAW,{
  locust(f,X,Y,tz,pz){
    ctx.fillStyle='rgba(60,46,24,.9)';const q=Math.max(2,Math.ceil(pz*1.3));
    for(let k=0;k<48;k++){
      const a=hash(k,11)*6.28+frameN*(.04+hash(k,13)*.05),d=Math.sqrt(hash(k,17))*f.r*tz;
      ctx.fillRect(Math.round(X+Math.cos(a)*d),Math.round(Y+Math.sin(a)*d*.6-tz*(1+hash(k,19)*2)+Math.sin(frameN*.4+k)*tz*.3),q,q);
    }
    ctx.fillStyle='rgba(120,100,40,.15)';ctx.beginPath();ctx.ellipse(X,Y,f.r*tz,f.r*tz*.6,0,0,7);ctx.fill();
  },
  firestorm(f,X,Y,tz,pz){
    for(let k=0;k<8;k++){
      const h=k/7,r=tz*(.5+h*f.r*.45),yy=Y-h*tz*5,sw=Math.sin(frameN*.25+k)*tz*.4;
      ctx.strokeStyle=`rgba(255,${(150-k*14)|0},30,${.8-h*.4})`;ctx.lineWidth=Math.max(2,tz*.45);
      ctx.beginPath();ctx.ellipse(X+sw,yy,r,r*.32,0,0,7);ctx.stroke();
    }
    ctx.fillStyle='rgba(255,170,50,.8)';
    for(let k=0;k<18;k++){const a=frameN*.3+k*.9,d=tz*f.r*(.3+hash(k,23)*.7);ctx.fillRect(Math.round(X+Math.cos(a)*d),Math.round(Y-((frameN*2+k*17)%(tz*5))+Math.sin(a)*d*.3),Math.ceil(pz*1.5),Math.ceil(pz*2))}
  },
  frogs(f,X,Y,tz,pz){
    ctx.fillStyle='rgba(40,60,50,.25)';ctx.beginPath();ctx.ellipse(X,Y-tz*6,f.r*tz,f.r*tz*.35,0,0,7);ctx.fill();
    ctx.fillStyle='#6fd05a';const q=Math.max(2,Math.ceil(pz*1.6));
    for(let k=0;k<22;k++){const a=hash(k,29)*6.28,d=Math.sqrt(hash(k,31))*f.r*tz,yy=(frameN*5+k*41)%(tz*7);ctx.fillRect(Math.round(X+Math.cos(a)*d),Math.round(Y-tz*7+yy),q,q)}
  },
});

/* ================= extra wonders ================= */
Object.assign(TAPS,{
  w_rainbow:p=>{
    if(!pInb(p))return;
    wfx.push({type:'rainbow',x:p.x,y:p.y,at:step,until:step+700,r:12});sfx('chime',p.x|0,p.y|0);
    toast('A rainbow arcs overhead: people nearby heal and nearby kingdoms grow calmer.');
  },
  w_harvest:p=>{
    const T=tribeNear(p);if(!T){toast('No kingdom is near enough for a harvest.');return}
    T.food+=48;T.mat+=8;T.stab=clamp(T.stab+4,0,100);
    for(const t of T.towns)effects.push({type:'rite',x:t.x+.5,y:t.y+.5,c:[255,214,70],t:0,dur:50,big:true});
    for(const u of T.members)u.hunger=0;
    sfx('unveil',T.cx,T.cy);log(`A golden harvest filled the granaries of the ${T.title}.`,[255,214,70],true);toast(`The ${T.title} reaped a golden harvest.`);
  },
  w_spring:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
    if(bio(hgt[y*W+x])<2||bio(hgt[y*W+x])>4){toast('A spring needs open land.');return}
    wfx.push({type:'spring',x:x+.5,y:y+.5,until:step+YEAR*8,r:3.2});
    brushAt(x,y,2,i=>{const b=bio(hgt[i]);if((b===3||b===4)&&bld[i]===-1&&!lava[i])setBiome(i,BM.FLOWER,.2)});
    sfx('splash',x,y);effects.push({type:'rite',x:x+.5,y:y+.5,c:[140,220,255],t:0,dur:40,big:true});
    toast('A healing spring bubbles up. It runs for eight years.');
  },
  w_bloom:p=>{
    if(!pInb(p))return;
    wfx.push({type:'bloom',x:p.x,y:p.y,t0:step,until:step+240,r:9});sfx('unveil',p.x|0,p.y|0);toast('Saplings burst from the soil and a forest spreads outward.');
  },
  w_beacon:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;
    if(wfx.some(f=>f.type==='beacon'&&Math.hypot(f.x-x,f.y-y)<2)){toast('A beacon already burns here.');return}
    wfx.push({type:'beacon',x:x+.5,y:y+.5,until:step+YEAR*10,r:9});sfx('bell',x,y);
    toast('A beacon fire is lit. It calms and mends everyone near it, and burns for ten years.');
  },
  w_aurora:p=>{
    if(!pInb(p))return;
    wfx.push({type:'aurora',x:p.x,y:p.y,at:step,until:step+1000,r:20});sfx('chime',p.x|0,p.y|0);
    toast('Curtains of light ripple overhead. Kingdoms beneath them grow devout and calm.');
  },
  w_crystal:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;let n=0;
    brushAt(x,y,2,i=>{
      const b=bio(hgt[i]);if((b!==3&&b!==4)||bld[i]!==-1||lava[i])return;
      setBiome(i,BM.CRYS,0);tree[i]=0;if(R()<.4){ore[i]=ORE.GEMS;oreAmt[i]=24+((R()*26)|0)}markTile(i);n++;
    });
    if(!n){toast('Crystals need open ground to grow from.');return}
    effects.push({type:'rite',x:p.x,y:p.y,c:[130,230,240],t:0,dur:44,big:true});sfx('unveil',x,y);
  },
  w_ancient:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const i=y*W+x,b=bio(hgt[i]);
    if(b<3||b>4||bld[i]!==-1||lava[i]){toast('The ancient tree needs open, fertile ground.');return}
    if(wfx.some(f=>f.type==='ancient'&&Math.hypot(f.x-x,f.y-y)<3)){toast('An ancient tree already stands here.');return}
    tree[i]=1;ore[i]=0;markTile(i);
    wfx.push({type:'ancient',x:x+.5,y:y+.5,until:step+YEAR*40,r:6});
    effects.push({type:'rite',x:x+.5,y:y+.5,c:[120,230,120],t:0,dur:50,big:true});sfx('unveil',x,y);
    log(`An ancient tree took root ${nearTribeText(x,y)}.`,[120,200,110]);
  },
});
const healAround=(f,r,amt)=>{for(const u of units){if(u.dead||u.inside||isMon(u)||Math.hypot(u.x-f.x,u.y-f.y)>r)continue;if(u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+amt)}};
Object.assign(WFX2,{
  rainbow(f){
    if(step%20)return;
    healAround(f,f.r,2);
    const T=tribeNear(f);if(T&&Math.hypot(T.cx-f.x,T.cy-f.y)<f.r+10){T.stab=clamp(T.stab+.8,0,100);T.devo=clamp(T.devo+.5,0,100)}
  },
  spring(f){
    if(step%10)return;
    for(const u of units){
      if(u.dead||u.inside||Math.hypot(u.x-f.x,u.y-f.y)>f.r)continue;
      if(!isMon(u)&&u.hp<u.maxhp)u.hp=Math.min(u.maxhp,u.hp+3);
      if(u.traits&&u.traits.includes('Cursed')&&R()<.1)u.traits=u.traits.filter(t=>t!=='Cursed');
    }
    if(step%30===0)effects.push({type:'rite',x:f.x+(R()-.5)*2,y:f.y+(R()-.5)*2,c:[140,220,255],t:0,dur:20});
  },
  bloom(f){
    const rr=f.r*Math.min(1,(step-f.t0)/200);
    for(let n=0;n<7;n++){
      const a=R()*6.28,d=Math.sqrt(R())*rr,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(!inb(X,Y))continue;
      const i=Y*W+X;
      if(fertile(i)&&bld[i]===-1&&!fire[i]&&!ore[i]){tree[i]=1;burnt[i]=0;if(R()<.2)setBiome(i,BM.FOREST,.6);markTile(i)}
    }
  },
  beacon(f){
    if(step%20)return;
    healAround(f,f.r,1);
    if(step%60===0){const T=tribeAt(f.x,f.y)||tribeNear(f);if(T&&Math.hypot(T.cx-f.x,T.cy-f.y)<f.r+12){T.stab=clamp(T.stab+.5,0,100);T.devo=clamp(T.devo+.3,0,100)}}
  },
  aurora(f){
    if(step%40)return;
    for(const T of tribes){if(!T.alive||Math.hypot(T.cx-f.x,T.cy-f.y)>f.r)continue;T.devo=clamp(T.devo+1.2,0,100);T.stab=clamp(T.stab+.6,0,100)}
  },
  ancient(f){
    if(step%30)return;
    healAround(f,5,2);
    if(R()<.3){
      const a=R()*6.28,d=2+R()*(f.r-2),X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;
      if(inb(X,Y)){const i=Y*W+X;if(fertile(i)&&bld[i]===-1&&!fire[i]&&!ore[i]){tree[i]=1;burnt[i]=0;markTile(i)}}
    }
    if(step%120===0){const T=tribeNear(f);if(T&&Math.hypot(T.cx-f.x,T.cy-f.y)<f.r+10)T.devo=clamp(T.devo+.6,0,100)}
    const i=(f.y|0)*W+(f.x|0);if(!tree[i]){tree[i]=1;markTile(i)}
  },
});
const RAINBOW=['#e8453c','#f08a30','#f5d443','#5cc65a','#3f9be0','#6a54c8','#a05ac0'];
Object.assign(FXDRAW,{
  rainbow(f,X,Y,tz,pz){
    const fade=Math.min(1,(step-f.at)/40,(f.until-step)/60);if(fade<=0)return;
    ctx.save();ctx.globalAlpha=.5*fade;ctx.lineWidth=Math.max(2,tz*.5);
    for(let k=0;k<7;k++){ctx.strokeStyle=RAINBOW[k];ctx.beginPath();ctx.ellipse(X,Y,tz*(8-k*.5),tz*(6.5-k*.42),0,Math.PI,0);ctx.stroke()}
    ctx.restore();
  },
  spring(f,X,Y,tz,pz){
    const g=ctx.createRadialGradient(X,Y,0,X,Y,tz*1.8);g.addColorStop(0,'rgba(140,220,255,.75)');g.addColorStop(1,'rgba(140,220,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(X,Y,tz*1.8,tz*1.2,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(220,250,255,.8)';ctx.lineWidth=Math.max(1,pz*.7);
    for(let k=0;k<3;k++){const q=((frameN*.02+k/3)%1);ctx.globalAlpha=1-q;ctx.beginPath();ctx.ellipse(X,Y,tz*(.3+q*1.5),tz*(.2+q),0,0,7);ctx.stroke()}
    ctx.globalAlpha=1;ctx.fillStyle='rgba(235,252,255,.9)';
    for(let k=0;k<6;k++){const a=frameN*.05+k,q=((frameN*.03+k*.17)%1);ctx.fillRect(Math.round(X+Math.cos(a)*tz*.6),Math.round(Y-q*tz*2.2),Math.ceil(pz*1.4),Math.ceil(pz*1.4))}
  },
  bloom(f,X,Y,tz,pz){
    const q=Math.min(1,(step-f.t0)/200),r=tz*f.r*q;
    ctx.strokeStyle=`rgba(130,230,110,${.6*(1-q*.7)})`;ctx.lineWidth=Math.max(1.5,tz*.3);ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.stroke();
    ctx.fillStyle='rgba(190,255,150,.85)';
    for(let k=0;k<14;k++){const a=hash(k,37)*6.28,d=Math.sqrt(hash(k,41))*r,yy=((frameN*1.2+k*23)%(tz*3));ctx.fillRect(Math.round(X+Math.cos(a)*d),Math.round(Y+Math.sin(a)*d*.7-yy),Math.ceil(pz*1.5),Math.ceil(pz*1.5))}
  },
  beacon(f,X,Y,tz,pz){
    const night=typeof light==='number'?1-pcl(light,0,1):.5;
    if(night>.05){
      const a=frameN*.03,g=ctx.createRadialGradient(X,Y-tz*3,0,X,Y-tz*3,tz*f.r);g.addColorStop(0,`rgba(255,230,140,${.45*night})`);g.addColorStop(1,'rgba(255,230,140,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y-tz*3,tz*f.r,0,7);ctx.fill();
      ctx.fillStyle=`rgba(255,240,170,${.22*night})`;ctx.beginPath();ctx.moveTo(X,Y-tz*3);ctx.arc(X,Y-tz*3,tz*f.r*1.3,a,a+.35);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(X,Y+tz*.1,tz*.9,tz*.3,0,0,7);ctx.fill();
    ctx.fillStyle='#8a8c96';ctx.fillRect(X-tz*.55,Y-tz*2.6,tz*1.1,tz*2.7);ctx.fillStyle='#6c6e7a';ctx.fillRect(X-tz*.55,Y-tz*2.6,tz*.35,tz*2.7);
    ctx.fillStyle='#d8d0b8';ctx.fillRect(X-tz*.7,Y-tz*3,tz*1.4,tz*.4);
    ctx.fillStyle=frameN&4?'#ffd04a':'#ff9a30';ctx.fillRect(X-tz*.3,Y-tz*3.7,tz*.6,tz*.7);ctx.fillStyle='#fff2a0';ctx.fillRect(X-tz*.12,Y-tz*3.4,tz*.24,tz*.3);
  },
  aurora(f,X,Y,tz,pz){
    const fade=Math.min(1,(step-f.at)/60,(f.until-step)/80);if(fade<=0)return;
    const night=typeof light==='number'?1-pcl(light,0,1):.5,al=fade*(.12+.45*night),n=26;
    for(let k=0;k<n;k++){
      const x=X+(k/(n-1)*2-1)*tz*f.r,w=Math.ceil(tz*f.r*2/n)+1,h=tz*(5+3*Math.sin(frameN*.03+k*.5)),y0=Y-tz*14+Math.sin(frameN*.02+k*.3)*tz*1.6;
      const hue=k%3;ctx.fillStyle=`rgba(${hue?90:150},${hue===2?140:240},${hue===2?255:170},${al*.35})`;ctx.fillRect(Math.round(x),Math.round(y0),w,Math.round(h));
      ctx.fillStyle=`rgba(${hue?90:150},${hue===2?140:240},${hue===2?255:170},${al*.3})`;ctx.fillRect(Math.round(x),Math.round(y0+h*.5),w,Math.round(h*.7));
      ctx.fillStyle=`rgba(160,120,240,${al*.2})`;ctx.fillRect(Math.round(x),Math.round(y0+h*1.1),w,Math.round(h*.5));
    }
  },
  ancient(f,X,Y,tz,pz){
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(X,Y+tz*.2,tz*3,tz*1,0,0,7);ctx.fill();
    ctx.fillStyle='#5a3e26';ctx.fillRect(X-tz*.5,Y-tz*2,tz*1,tz*2.3);ctx.fillStyle='#46301c';ctx.fillRect(X-tz*.5,Y-tz*2,tz*.3,tz*2.3);
    const sw=Math.sin(frameN*.02)*tz*.08;
    for(const [dx,dy,r,c] of [[-1.4,-3,1.7,'#2f7d3a'],[1.4,-3,1.7,'#2f7d3a'],[0,-4.4,2.2,'#3c9448'],[-.9,-5,1.4,'#4cae56'],[1,-4.9,1.3,'#4cae56'],[0,-3.2,1.8,'#388a42']]){
      ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(X+dx*tz+sw,Y+dy*tz,r*tz,r*tz*.85,0,0,7);ctx.fill();
    }
    ctx.fillStyle='rgba(255,245,160,.9)';
    for(let k=0;k<5;k++){const q=((frameN*.01+k*.2)%1);ctx.fillRect(Math.round(X+Math.sin(k*2+frameN*.03)*tz*2),Math.round(Y-tz*5.5+q*tz*5),Math.ceil(pz*1.3),Math.ceil(pz*1.3))}
  },
});

/* ---------- the tray items for these powers (spread into the Chaos and Wonders tabs in ui.js) ---------- */
POWER_ITEMS.chaos.push(
  ['carpet','✈️','Carpet bombing','Tap for a bombing run: a line of bombs falls from the sky across the area.'],
  ['c_sinkhole','⏬','Sinkhole','Tap to make the ground collapse into a deep pit. Everything standing there is swallowed.'],
  ['c_fissure','💢','Lava fissure','Tap to split the earth along a long jagged crack of lava that burns everything it crosses.'],
  ['c_locust','🦗','Locust swarm','Tap to loose a swarm that wanders, stripping trees and eating the stores of any kingdom it crosses.'],
  ['c_firestorm','🧯','Firestorm','Tap to start a roaming wall of fire that ignites ground and scorches everyone inside.'],
  ['c_frogs','🐸','Rain of frogs','Tap for a harmless, plainly absurd rain of frogs that ends up as a pond full of frogs.'],
  ['c_decay','🧱','Decay wave','Tap to rot away every building in a wide circle: homes crumble to ruins and stability falls.'],
  ['c_gravity','🙃','Gravity flip','Tap to hurl everything nearby high into the air. It lands somewhere else, bruised.'],
);
POWER_ITEMS.wonders.push(
  ['w_magnet','🧲','Lifting magnet','Hold and drag to pick up every creature in reach and carry it with the cursor. Release to set them down. A bigger brush makes a wider magnet.'],
  ['w_rainbow','🌈','Rainbow','Tap to hang a rainbow: people beneath it heal and nearby kingdoms grow calmer and more devout.'],
  ['w_harvest','🌾','Golden harvest','Tap a kingdom to fill its granaries and feed every hungry mouth.'],
  ['w_spring','💦','Healing spring','Tap open land to open a spring that mends the sick and lifts curses for eight years.'],
  ['w_bloom','🍃','Forest bloom','Tap to let saplings burst up and a forest spread outward over a few seconds.'],
  ['w_beacon','🗼','Beacon','Tap to light a beacon fire that glows at night and mends and calms everyone near it for ten years.'],
  ['w_aurora','💫','Aurora','Tap to hang curtains of light across the sky; kingdoms beneath them grow devout and calm.'],
  ['w_crystal','💎','Crystal bloom','Tap to grow a patch of glowing crystal land, studded with gems.'],
  ['w_ancient','🍂','Ancient tree','Tap fertile ground to plant a colossal tree that heals, seeds new groves and inspires faith for forty years.'],
);
