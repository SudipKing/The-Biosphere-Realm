"use strict";
/* ============ 3D-shaded props: trees, boulders, ore and a shared building edge pass ============
   Light comes from the top left: every surface has a highlight on its upper left, a core tone, and a shade on its lower right, with a
   soft ground shadow falling to the lower right. Props are baked once per look and drawn y-sorted by render.js (drawPropRow). */
function h2(x,y,z){let h=(Math.imul(x+z*131,374761393)+Math.imul(y+z*71,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
const SHADOW_C=[0,0,0,58];
/* a grid plus a mask of the pixels that belong to the prop itself (not its shadow), so the outline only rings the prop */
function PM(g){return{g,m:new Uint8Array(g.w*g.h)}}
function pput(p,x,y,c){x|=0;y|=0;if(x<0||y<0||x>=p.g.w||y>=p.g.h)return;p.g.d[y*p.g.w+x]=c;p.m[y*p.g.w+x]=1}
function poutline(p,c){
  const g=p.g,w=g.w,h=g.h,add=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(p.m[y*w+x])continue;
    if((x>0&&p.m[y*w+x-1])||(x<w-1&&p.m[y*w+x+1])||(y>0&&p.m[(y-1)*w+x])||(y<h-1&&p.m[(y+1)*w+x]))add.push(y*w+x);
  }
  for(const k of add)g.d[k]=c;
}
function pshadow(p,cx,cy,rx,ry){
  const g=p.g;
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){
    const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;
    if(dx*dx+dy*dy<=1&&!g.d[y*g.w+x])g.d[y*g.w+x]=SHADOW_C;
  }
}
function pline(p,x0,y0,x1,y1,c){
  const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;
  for(let k=0;k<=n;k++)pput(p,Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),c);
}
/* shade a union of ellipses: lit from the upper left, darker toward the lower right and the bottom, with a leafy paired dither */
function pblobs(p,blobs,tn,salt,floorY,accent){
  const g=p.g;
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){
    let best=null,bd=9;
    for(const b of blobs){const dx=(x+.5-b[0])/b[2],dy=(y+.5-b[1])/b[3],d=dx*dx+dy*dy;if(d<=1&&d<bd){bd=d;best=b}}
    if(!best)continue;
    const nx=(x+.5-best[0])/best[2],ny=(y+.5-best[1])/best[3];
    const lit=-(nx*.55+ny*.85)*.85+(1-bd)*.28+(h2(x>>1,y,salt)-.5)*.62-(y/(floorY||g.h))*.22;
    let c=lit>.58?tn[3]:lit>.16?tn[2]:lit>-.3?tn[1]:tn[0];
    if(accent&&h2(x,y,salt+9)<.13&&lit>-.1)c=accent;
    pput(p,x,y,c);
  }
}
/* the seasonal colours of one tree look: tones dark..highlight, trunk, accent (ph>=0 is a Paradox colour phase) */
function treeLook(kind,sea,ph,vi){
  const T=TREES[kind],vv=.88+vi*.08,P={};
  for(const k in T.pal){
    let c=T.pal[k];
    if(T.dec&&k!=='W'&&k!=='k'){if(sea===2&&AUT[k])c=AUT[k];else if(sea===3&&WIN[k])c=WIN[k]}
    else if(!T.dec&&sea===3&&(k==='v'||k==='l')&&!T.glow&&kind!=='candy'&&kind!=='dead'){const a=k==='v'?.75:.4;c=[c[0]+(240-c[0])*a,c[1]+(246-c[1])*a,c[2]+(252-c[2])*a]}
    if(ph>=0){const q=paraCol(ph/12*6.2832+k.charCodeAt(0)*.5);c=[q[0]*.85,q[1]*.85,q[2]*.85]}
    P[k]=[c[0]*vv,c[1]*vv,c[2]*vv].map(Math.round);
  }
  const lighten=c=>c.map(v=>Math.min(255,v+34));
  let tn;
  if(kind==='flower')tn=[P.D,P.p,P.l,P.v];
  else if(kind==='crystal')tn=[P.d,P.c,P.v,lighten(P.v)];
  else if(P.l)tn=[P.D||sh(P.l,.66),P.l,P.v||lighten(P.l),lighten(P.v||P.l)];
  else tn=[P.W,P.W,P.W,P.W];
  return{tn,w:P.W||[100,80,60],acc:kind==='lemon'?P.y:null,k:P.k};
}
/* [painter, canopy width, canopy height, total height, trunk width] in pixels (a tile is 8) */
const TREE_SHAPE={
  oak:['blob',14,13,19,2],jungle:['blob',17,14,19,3],lemon:['blob',13,12,18,2],flower:['blob',13,12,18,2],candy:['blob',12,12,19,2],
  clover:['blob',13,8,13,2],stunt:['blob',9,8,12,2],birch:['blob',9,14,20,2],
  pine:['cone',11,17,21,2],forest:['cone',12,18,22,2],acacia:['flat',17,8,17,2],crystal:['crys',11,17,17,0],dead:['bare',10,13,16,2],corrupt:['bare',10,14,17,2]};
const TREE_KINDS=Object.keys(TREE_SHAPE),TKI={};TREE_KINDS.forEach((k,i)=>{TKI[k]=i});
/* one baked tree: size sz 0..2, brightness vi 0..3, season sea, paradox phase ph (-1 normally). s.ax,s.ay anchor the trunk's foot */
function treeSprite(kind,sz,vi,sea,ph){
  const S=TREE_SHAPE[kind],f=[.82,1,1.2][sz],L=treeLook(kind,sea,ph,vi);
  const cw=Math.max(5,Math.round(S[1]*f)),ch=Math.max(4,Math.round(S[2]*f)),tH=Math.round(S[3]*f),tw=S[4]?Math.max(1,Math.round(S[4]*(sz===2?1.5:1))):0;
  const gw=cw+8,gh=tH+3,cx=gw>>1,base=tH-1,salt=TKI[kind]*7+sz*3+vi,p=PM(G(gw,gh));
  const ol=sh(L.tn[0],.52),W=L.w,Wl=W.map(v=>Math.min(255,v+28)),Wd=sh(W,.62);
  pshadow(p,cx+2,base+.3,Math.max(3.5,cw*.46),1.9);
  const trunk=(top,bot)=>{
    for(let y=top;y<=bot;y++){
      const flare=y>=bot-1?1:0,x0=cx-(tw>>1)-flare;
      for(let x=0;x<tw+flare*2;x++){
        const c=x===0?Wl:x>=tw+flare*2-1?Wd:W;
        pput(p,x0+x,y,y-top<2?sh(c,.72):c);
      }
    }
  };
  switch(S[0]){
    case'blob':{
      trunk(Math.round(ch*.55),base);
      const bl=[[cx,ch*.5,cw*.5,ch*.5]],n=Math.round(cw*ch/20);
      for(let k=0;k<n;k++){
        const a=h2(k,1,salt)*6.283,r=Math.sqrt(h2(k,2,salt))*.62,rr=Math.max(2.2,cw*(.2+h2(k,3,salt)*.1));
        bl.push([cx+Math.cos(a)*r*cw*.5,ch*.5+Math.sin(a)*r*ch*.5,rr,rr*.92]);
      }
      if(kind==='birch'){for(let y=Math.round(ch*.6);y<=base;y++)if(h2(1,y,salt)<.4)pput(p,cx,y,L.k||[50,46,44])}
      pblobs(p,bl,L.tn,salt,ch+2,L.acc);
      if(kind==='candy'){for(let y=0;y<ch;y++)for(let x=0;x<gw;x++)if(p.m[y*gw+x]&&(x*2+y)%7===0)p.g.d[y*gw+x]=[252,250,252]}
      break}
    case'cone':{
      trunk(ch-3,base);
      const t=sz===0?3:4,th=Math.round(ch/t*1.55);
      for(let k=t-1;k>=0;k--){
        const y0=Math.round(k*(ch-th)/(t-1||1)),hw=2+(cw/2-2)*(k+1)/t;
        for(let y=y0;y<y0+th;y++){
          const r=hw*((y-y0+.6)/th);
          for(let x=0;x<gw;x++){
            const dx=x+.5-cx;if(Math.abs(dx)>r)continue;
            const nx=dx/Math.max(.8,r);
            let lit=-nx*.95+(h2(x>>1,y,salt)-.5)*.6+(1-(y-y0)/th)*.25;
            if(y>=y0+th-1)lit-=.7;
            pput(p,x,y,lit>.52?L.tn[3]:lit>.1?L.tn[2]:lit>-.35?L.tn[1]:L.tn[0]);
          }
        }
      }
      break}
    case'flat':{
      const ty=ch-1;
      trunk(ty+1,base);
      pline(p,cx,ty+2,cx-3,ty,W);pline(p,cx,ty+2,cx+3,ty,W);
      pblobs(p,[[cx,ch*.55,cw*.5,ch*.5],[cx-cw*.26,ch*.62,cw*.28,ch*.42],[cx+cw*.26,ch*.5,cw*.3,ch*.44]],L.tn,salt,ch*1.2,null);
      break}
    case'crys':{
      const hw=Math.max(2,Math.round(cw*.22));
      const shards=[[cx,base,ch,hw+1],[cx-hw-1,base,Math.round(ch*.62),hw],[cx+hw+1,base,Math.round(ch*.5),hw]];
      for(const [sx,sb,sht,sw] of shards){
        const top=sb-sht+1;
        for(let y=top;y<=sb;y++){
          const u=(y-top)/(sht-1||1),half=u<.6?sw*(u/.6):sw*(1-(u-.6)/.4*.8);
          for(let x=-sw;x<=sw;x++){
            if(Math.abs(x)>half+.2)continue;
            const lit=-x/(sw||1)+(1-u)*.3;
            pput(p,sx+x,y,x===0&&u<.7?L.tn[3]:lit>.25?L.tn[2]:lit>-.3?L.tn[1]:L.tn[0]);
          }
        }
      }
      break}
    case'bare':{
      const tl=Math.round(tH*.5),top=base-tl,pc=kind==='corrupt'?TREES.corrupt.pal.p:null;
      trunk(top,base);
      const br=[[-4,-5],[3,-6],[-2,-8],[4,-3],[0,-9],[-5,-2]];
      for(let k=0;k<br.length;k++){
        const dx=(br[k][0]*(f>1?1.2:1))|0,dy=br[k][1],oy=(k&1)*2;
        pline(p,cx,top+1+oy,cx+dx,top+dy+oy,k%2?Wd:W);
        if(pc&&k%2===0)pput(p,cx+dx,top+dy+oy,pc);
      }
      break}
  }
  poutline(p,ol);
  const s=bake(p.g,false);s.ax=cx+1;s.ay=base+1;return s;
}
/* a lump of rock: stone gray, or flecked and veined with an ore's colours (o=0 is a plain boulder) */
function rockSprite(o,sz,vi){
  const ore=o>0?ORES[o]:null,W=[5,7,9,12][sz],Hh=[4,5,7,9][sz],gw=W+6,gh=Hh+4,cx=gw>>1,base=Hh+1,salt=o*11+sz*3+vi+500,p=PM(G(gw,gh));
  const bc=o===ORE.COAL?[52,50,60]:!o||o===ORE.GEMS||o===ORE.STONE?[148,144,138]:[128,124,118],k=.9+vi*.07;
  const tn=[sh(bc,.5*k),sh(bc,.76*k),sh(bc,k),sh(bc,1.25*k)];
  pshadow(p,cx+2,base+.2,W*.5,1.9);
  pblobs(p,[[cx,base-Hh*.5,W*.5,Hh*.52],[cx-W*.2,base-Hh*.62,W*.3,Hh*.46],[cx+W*.25,base-Hh*.4,W*.28,Hh*.4]],tn,salt,gh,null);
  /* a crack or two */
  for(let q=0;q<2;q++){
    const x=(cx-W*.2+h2(q,5,salt)*W*.5)|0,y=(base-Hh*.7)|0;
    if(p.m[y*gw+x]&&p.m[(y+2)*gw+x+1]){p.g.d[(y+1)*gw+x]=tn[0];p.g.d[(y+2)*gw+x+1]=tn[0]}
  }
  if(ore&&o!==ORE.STONE){
    const c=ore.c,hi=ore.hi,dc=sh(c,.62),n=o===ORE.GEMS?2+sz:1+sz;
    for(let q=0;q<n;q++){
      const x=Math.round(cx-W*.34+h2(q,1,salt)*W*.68),y=Math.round(base-Hh*.85+h2(q,2,salt)*Hh*.6);
      if(!p.m[y*gw+x])continue;
      if(o===ORE.GEMS||o===ORE.SILVER||o===ORE.GOLD){
        /* a small angular crystal: lit left, core, shaded right, bright tip */
        pput(p,x,y-1,hi);pput(p,x,y,hi);pput(p,x+1,y,c);pput(p,x,y+1,c);pput(p,x+1,y+1,dc);pput(p,x-1,y+1,c);
      }else{pput(p,x,y,hi);pput(p,x+1,y,c);pput(p,x,y+1,c);pput(p,x+1,y+1,dc)}
    }
  }
  poutline(p,sh(tn[0],.55));
  const s=bake(p.g,false);s.ax=cx+1;s.ay=base+1;return s;
}
/* a soft ground shadow (pixel ellipse) that render.js scales under units and buildings */
function shadowSprite(){
  const g=G(16,6);
  for(let y=0;y<6;y++)for(let x=0;x<16;x++){
    const dx=(x+.5-8)/8,dy=(y+.5-3)/3,d=dx*dx+dy*dy;
    if(d<=1)g.d[y*16+x]=d<.45?[0,0,0,70]:[0,0,0,38];
  }
  return bake(g,false);
}
/* shared 3D pass for buildings: a gentle light-to-shade gradient across the sprite, a lit rim on its upper-left edges and a
   shaded rim on the lower-right ones. Works on any baked sprite and leaves its outline pixels alone */
function shade3d(s){
  const w=s.w,h=s.h,x=s.c.getContext('2d'),im=x.getImageData(0,0,w,h),d=im.data;
  const solid=(X,Y)=>{if(X<0||Y<0||X>=w||Y>=h)return false;const o=(Y*w+X)*4;return d[o+3]>200&&!(d[o]===OUTC[0]&&d[o+1]===OUTC[1]&&d[o+2]===OUTC[2])};
  const out=new Uint8ClampedArray(d);
  for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){
    if(!solid(X,Y))continue;
    const o=(Y*w+X)*4;
    let f=1.07-.15*(X/w)-.05*(Y/h);
    if(!solid(X-1,Y)||!solid(X,Y-1))f*=1.1;
    if(!solid(X+1,Y)||!solid(X,Y+1))f*=.84;
    out[o]=d[o]*f;out[o+1]=d[o+1]*f;out[o+2]=d[o+2]*f;
  }
  im.data.set(out);x.putImageData(im,0,0);return s;
}
