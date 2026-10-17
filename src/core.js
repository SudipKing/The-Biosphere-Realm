"use strict";
/* ============ Constants, helpers, shared state ============ */
const W=240,H=150,N=W*H,TS=8,OW=W*TS,OH=H*TS,YEAR=200,ADULT=16*YEAR,DAY=2400;
/* R drives the world and is seeded (mulberry32), so a seed rebuilds the same map. RC is for looks and sound only */
let rngS=1;
const R=()=>{let t=rngS=(rngS+0x6D2B79F5)|0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
const RC=Math.random;
let worldSeed='';
const randomSeed=()=>String(100000+Math.floor(RC()*900000));
/* a seed is any text: digits are used as a number, anything else is hashed (FNV-1a) */
function seedValue(s){
  s=String(s).trim();if(/^\d{1,9}$/.test(s))return +s|0;
  let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h|0;
}
const reduceMotion=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const pick=a=>a[(R()*a.length)|0];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const css=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
const sh=(c,f)=>c.map(v=>Math.max(0,Math.min(255,(v*f)|0)));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};

let hgt,tree,fire,lava,bld,btype,burnt,bm,ore,oreAmt,btier,own,ownScore;
let ownDirty=true,ovDirty=true,showDomains=true,seasonLock=-1;
/* like the seasons, the time of day (dayLock: the held time of day 0..1, or -1) and the weather (wxLock) can be held */
let dayLock=-1,wxLock=false;
let units,tribes,religions,boats,fires,lavas,burnSet,step,logs,wars,alliances,effects,bList,bDirty,uid=1;
let cnt={people:0,wild:0,race:{},sp:{}};
/* the storyteller: year a kingdom last rose or fell (sig fingerprints the kingdom count), earliest year it may act again, what it did */
const newStory=()=>({last:0,next:0,sig:0,fired:[]});
let story=newStory();
let shake=0,logDirty=true,startFocus=[W/2,H/2];
let tod=.3,sunH=0,light=1;
const WX={type:'clear',until:0,cloud:0,rain:0,snow:0,fog:0,storm:0,wind:1};

/* sound events raised by the simulation, consumed by the audio engine */
const SFXQ=[];
function sfx(t,x,y,o){if(SFXQ.length<80)SFXQ.push({t,x,y,o})}

/* noise */
let vals,seed=1;
function seedNoise(){vals=new Float32Array(65536);for(let i=0;i<65536;i++)vals[i]=R();seed=(R()*1e9)|0}
function vn(x,y){
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const g=(a,b)=>vals[((b&255)<<8)|(a&255)];
  const a=g(xi,yi),b=g(xi+1,yi),c=g(xi,yi+1),d=g(xi+1,yi+1);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function fbm(x,y,o=5){let s=0,a=.5,f=1,n=0;for(let k=0;k<o;k++){s+=a*vn(x*f,y*f);n+=a;f*=2;a*=.5}return s/n}
function hash(x,y){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+seed)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}

/* terrain: 0 deep,1 shallow,2 sand,3 grass,4 highland,5 mountain,6 snow */
const bio=h=>h<.30?0:h<.38?1:h<.42?2:h<.62?3:h<.74?4:h<.86?5:6;
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const walk=i=>{const b=bio(hgt[i]);return b>=2&&b<=5&&!lava[i]};
const fertile=i=>{const b=bio(hgt[i]);return (b===3||b===4)&&!lava[i]&&bm[i]!==BM.WASTE};
const isWater=i=>bio(hgt[i])<=1;
const year=()=>Math.floor(step/YEAR);
const adult=u=>u.k===0?u.age>=ADULT:u.age>=YEAR*1.5;
const isNight=()=>light<.32;
const tileOf=u=>{const x=Math.min(W-1,Math.max(0,u.x|0)),y=Math.min(H-1,Math.max(0,u.y|0));return y*W+x};
/* Math.hypot is several times slower than this in the engine and sits in the per-step hot paths */
const hyp=(a,b)=>Math.sqrt(a*a+b*b);
const N4=[[1,0],[-1,0],[0,1],[0,-1]];
const N8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

function ringFind(x,y,r,pred){
  x|=0;y|=0;
  for(let k=0;k<=r;k++){
    let best=-1,bd=1e9;
    for(let dy=-k;dy<=k;dy++){
      const step1=(dy===-k||dy===k)?1:2*k;
      for(let dx=-k;dx<=k;dx+=step1||1){
        const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;
        const i=Y*W+X;if(pred(i)){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}}
      }
    }
    if(best>=0)return best;
  }
  return -1;
}
function sampleNear(x,y,r,pred,tries=40){
  for(let t=0;t<tries;t++){
    const X=Math.round(x+(R()*2-1)*r),Y=Math.round(y+(R()*2-1)*r);
    if(!inb(X,Y))continue;const i=Y*W+X;if(pred(i))return i;
  }
  return -1;
}
function randomLand(pred,tries=4000){for(let t=0;t<tries;t++){const i=(R()*N)|0;if(pred(i))return i}return -1}

/* spatial grid so creatures find neighbours fast */
const GC=8,GW=Math.ceil(W/GC),GH=Math.ceil(H/GC),grid=[];
for(let i=0;i<GW*GH;i++)grid.push([]);
function rebuildGrid(){
  for(let i=0;i<grid.length;i++)grid[i].length=0;
  for(let i=0;i<units.length;i++){const u=units[i];if(u.dead||u.inside||u.dig>step)continue;grid[clamp(u.y/GC|0,0,GH-1)*GW+clamp(u.x/GC|0,0,GW-1)].push(u)}
}
function nearest(u,r,pred){
  let best=null,bd=r*r;
  const gx0=clamp((u.x-r)/GC|0,0,GW-1),gx1=clamp((u.x+r)/GC|0,0,GW-1),gy0=clamp((u.y-r)/GC|0,0,GH-1),gy1=clamp((u.y+r)/GC|0,0,GH-1);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
    const cell=grid[gy*GW+gx];
    for(let n=0;n<cell.length;n++){
      const v=cell[n];
      if(v.dead||v===u||v.inside)continue;
      const dx=v.x-u.x,dy=v.y-u.y,d=dx*dx+dy*dy;
      if(d<bd&&pred(v)){bd=d;best=v}
    }
  }
  return best;
}
