"use strict";
/* ============ Camera & rendering ============ */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d',{alpha:false});
const stage=document.getElementById('stage');
let dpr=1,cw=0,ch=0,camInit=false,alpha=1,viewInfo={water:0,close:0};
const cam={pz:1,tpz:1,ax:0,ay:0,ox:0,oy:0,vx:0,vy:0,fit:.5};
const fitPz=()=>Math.min(cw/OW,ch/OH);
const maxPz=()=>6*dpr;
function centerOn(x,y){cam.ox=cw/2-x*TS*cam.pz;cam.oy=ch/2-y*TS*cam.pz}
function viewCenter(){return[(cw/2-cam.ox)/(TS*cam.pz),(ch/2-cam.oy)/(TS*cam.pz)]}
function resize(){
  const c=camInit?viewCenter():null;
  const nd=window.devicePixelRatio||1,r=stage.getBoundingClientRect();
  const nw=Math.max(1,Math.round(r.width*nd)),nh=Math.max(1,Math.round(r.height*nd));
  /* a resize that changes nothing must not touch the canvas: setting its size wipes it to black */
  if(camInit&&nw===cw&&nh===ch&&nd===dpr)return;
  const wasFit=camInit&&cam.tpz<=cam.fit*1.001;
  dpr=nd;cw=nw;ch=nh;cv.width=cw;cv.height=ch;cam.fit=fitPz();
  /* a new world opens on the whole map */
  if(!camInit){camInit=true;cam.pz=cam.tpz=cam.fit;centerOn(W/2,H/2)}
  else{if(wasFit)cam.pz=cam.tpz=cam.fit;centerOn(c[0],c[1])}
  /* redraw at once, so the frame between a resize and the next animation frame is never blank */
  if(typeof draw==='function'&&hgt)try{draw(0)}catch(e){}
}
/* the whole map, centred */
function showWholeWorld(){cam.fit=fitPz();cam.pz=cam.tpz=cam.fit;cam.vx=cam.vy=0;cam.flyTo=null;centerOn(W/2,H/2)}
function fitView(){cam.fit=fitPz();zoomTo(cw/2,ch/2,cam.fit);const c=[W/2,H/2];cam.flyTo=c}
function zoomRaw(sx,sy,nz){cam.ox=sx-(sx-cam.ox)*nz/cam.pz;cam.oy=sy-(sy-cam.oy)*nz/cam.pz;cam.pz=nz}
function zoomTo(sx,sy,nz){cam.tpz=clamp(nz,cam.fit*.9,maxPz());cam.ax=sx;cam.ay=sy}
function stepZoom(sx,sy,dir){
  const z=cam.tpz;let nz;
  if(dir>0){nz=z>=1?Math.floor(z+1e-6)+1:z*1.35;if(z<1&&nz>1)nz=1}
  else{nz=z>1?Math.ceil(z-1e-6)-1:z/1.35;if(z>1&&nz<1)nz=1}
  zoomTo(sx,sy,nz);
}
function flyTo(x,y,pz){cam.flyTo=[x,y];if(pz)cam.tpz=clamp(pz,cam.fit*.9,maxPz());cam.ax=cw/2;cam.ay=ch/2}
const keys=new Set();
function updateCamera(dt){
  const k=1-Math.exp(-dt/70);
  if(Math.abs(cam.tpz-cam.pz)>1e-4){const nz=Math.abs(cam.tpz-cam.pz)<.002?cam.tpz:cam.pz+(cam.tpz-cam.pz)*k;zoomRaw(cam.ax,cam.ay,nz)}
  if(cam.flyTo){
    const c=viewCenter(),dx=cam.flyTo[0]-c[0],dy=cam.flyTo[1]-c[1];
    if(Math.hypot(dx,dy)<.05)cam.flyTo=null;else centerOn(c[0]+dx*k*1.3,c[1]+dy*k*1.3);
  }
  if(follow&&sel&&sel.u&&!sel.u.dead){
    const c=viewCenter(),[x,y]=ipos(sel.u);
    centerOn(c[0]+(x-c[0])*k,c[1]+(y-.5-c[1])*k);
  }
  let kx=0,ky=0;
  if(keys.has('a')||keys.has('arrowleft'))kx++;if(keys.has('d')||keys.has('arrowright'))kx--;
  if(keys.has('w')||keys.has('arrowup'))ky++;if(keys.has('s')||keys.has('arrowdown'))ky--;
  if(kx||ky){cam.ox+=kx*dt*.9*dpr;cam.oy+=ky*dt*.9*dpr;follow=false;cam.flyTo=null}
  if(!drag&&(cam.vx||cam.vy)){
    cam.ox+=cam.vx*dt;cam.oy+=cam.vy*dt;
    const f=Math.pow(.92,dt/16.7);cam.vx*=f;cam.vy*=f;
    if(Math.abs(cam.vx)+Math.abs(cam.vy)<.01)cam.vx=cam.vy=0;
  }
  const mw=OW*cam.pz,mh=OH*cam.pz;
  cam.ox=mw<cw?(cw-mw)/2:clamp(cam.ox,cw*.35-mw,cw*.65);
  cam.oy=mh<ch?(ch-mh)/2:clamp(cam.oy,ch*.35-mh,ch*.65);
}
new ResizeObserver(()=>{if(hgt)resize()}).observe(stage);

const ipos=u=>[u.px+(u.x-u.px)*alpha,u.py+(u.y-u.py)*alpha];
/* each unit keeps its two walk frames, so drawing never builds a cache key; the signature changes with colour, age or job.
   Fields starting with _ are render caches and are never saved */
/* a general rides from the Bronze Age on (chariot, horse, jeep, hover bike); farmers drive tractors in the fields from the Industrial Age */
const rides=(u,T)=>u.job==='general'?T.age>=1:u.job==='farmer'&&T.age>=5&&u.task==='forage';
function unitSprite(u,fr){
  const job=u.k===0&&adult(u)?u.job:null,T=u.k===0?tribes[u.tribe]:null,veh=T&&job?rides(u,T):false;
  /* the signature covers everything the sprite shows that can change: colour, job, age, looks, era, mount and species (Mutate) */
  const sig=u.k===0?T.ci*32+(adult(u)?JOB_KEYS.indexOf(job)+2:0)+(u.genes.skin*16+u.genes.hair)*4096+T.age*1e6+(veh?1e7:0):u.sp==='horse'&&u.owner>=0?tribes[u.owner].ci:-1;
  if(u._sg!==sig||u._ssp!==u.sp||!u._sp){u._sg=sig;u._ssp=u.sp;u._sp=[null,null]}
  let s=u._sp[fr];
  if(!s){
    if(u.k===0)s=spr(`p|${u.race}|${u.genes.skin}|${u.genes.hair}|${T.ci}|${fr}|${job||''}|${T.age}|${veh?1:0}`,()=>personSprite(u.race,u.genes.skin,u.genes.hair,T.color,fr,job,T.age,veh?{vehicle:true}:null));
    else s=animalSpr(u,fr);
    u._sp[fr]=s;
  }
  return s;
}
/* draw list objects are pooled and reused every frame */
const drawPool=[],items=[],vis=[],visB=[],fireSpots=[];
function drawItem(y){let it=drawPool[items.length];if(!it){it={y:0,b:null,u:null,boat:null,mono:null,x:0,ry:0};drawPool.push(it)}it.y=y;it.b=it.u=it.boat=it.mono=null;items.push(it);return it}
const byY=(a,b)=>a.y-b.y;
/* bake the sprites a fresh world needs up front, so the first zoom-in doesn't stall */
function warmSprites(){
  for(const u of units){unitSprite(u,0);unitSprite(u,1)}
  if(bDirty)rebuildBList();
  for(const b of bList){const T=b.t>=0?tribes[b.t]:null;if(T)buildingSprite(T.race,b.ty,T.ci,T.rel.domain,b.tier,b.v)}
}
function rebuildBList(){
  bList=[];
  for(let i=0;i<N;i++)if(bld[i]!==-1)bList.push({i,x:i%W,y:(i/W)|0,t:bld[i],ty:bld[i]===-2?3:btype[i],tier:btier[i],v:(hash(i%W,(i/W|0)+77)*4)|0});
  bDirty=false;
}

/* domains: a colour layer per kingdom, one owner per tile. Each sub-pixel takes the owner with the most weight among
   the four nearest tile centres, so borders run smoothly along diagonals instead of in steps */
const OVS=4;let ovC=null,ovX=null,ovOwn=null,ovImg=null,ovBuf=null;
const packRGBA=(r,g,b,a)=>((a<<24)|(b<<16)|(g<<8)|r)>>>0;
const ovCand=[0,0,0,0],ovWt=[0,0,0,0],OV_MS=3;let ovJob=null;
/* owner of each sub-pixel in one row */
function ovOwnRow(py,px0,px1){
  const ow=W*OVS,fy=(py+.5)/OVS-.5,y0=Math.floor(fy),ty=fy-y0,ya=y0<0?0:y0,yb=y0+1>=H?H-1:y0+1,cand=ovCand,wt=ovWt;
  for(let px=px0;px<px1;px++){
    const fx=(px+.5)/OVS-.5,x0=Math.floor(fx),tx=fx-x0,xa=x0<0?0:x0,xb=x0+1>=W?W-1:x0+1;
    cand[0]=own[ya*W+xa];cand[1]=own[ya*W+xb];cand[2]=own[yb*W+xa];cand[3]=own[yb*W+xb];
    if(cand[0]===cand[1]&&cand[0]===cand[2]&&cand[0]===cand[3]){ovOwn[py*ow+px]=cand[0];continue}
    wt[0]=(1-tx)*(1-ty);wt[1]=tx*(1-ty);wt[2]=(1-tx)*ty;wt[3]=tx*ty;
    let best=cand[0],bw=-1;
    for(let a=0;a<4;a++){let w=0;for(let b=0;b<4;b++)if(cand[b]===cand[a])w+=wt[b];if(w>bw){bw=w;best=cand[a]}}
    ovOwn[py*ow+px]=best;
  }
}
/* colour of each sub-pixel in one row, darker along borders */
function ovColourRow(py,px0,px1,cols){
  const ow=W*OVS,oh=H*OVS,buf=ovBuf;
  for(let px=px0;px<px1;px++){
    const k=py*ow+px,o=ovOwn[k];if(o<0){buf[k]=0;continue}
    const e=(px>0&&ovOwn[k-1]!==o)||(px<ow-1&&ovOwn[k+1]!==o)||(py>0&&ovOwn[k-ow]!==o)||(py<oh-1&&ovOwn[k+ow]!==o);
    const c=cols[o];buf[k]=c?c[e?1:0]:0;
  }
}
/* the layer is redrawn only around tiles whose owner changed, a few rows per frame within OV_MS, so it never stalls a frame.
   Colours trail the owner rows by one, because a border pixel needs the row below it */
function buildOverlay(){
  const ow=W*OVS,oh=H*OVS;
  if(!ovC){ovC=document.createElement('canvas');ovC.width=ow;ovC.height=oh;ovX=ovC.getContext('2d');ovOwn=new Int16Array(ow*oh);
    ovImg=ovX.createImageData(ow,oh);ovBuf=new Uint32Array(ovImg.data.buffer);ovFull=true}
  if(ovFull)ovJob=null;
  if(!ovJob){
    let tx0=0,ty0=0,tx1=W-1,ty1=H-1;
    if(!ovFull){
      if(ovBox[2]<0){ovDirty=false;return}
      tx0=Math.max(0,ovBox[0]-2);ty0=Math.max(0,ovBox[1]-2);tx1=Math.min(W-1,ovBox[2]+2);ty1=Math.min(H-1,ovBox[3]+2);
    }
    ovBox[0]=W;ovBox[1]=H;ovBox[2]=ovBox[3]=-1;ovFull=false;
    ovJob={px0:tx0*OVS,px1:(tx1+1)*OVS,py0:ty0*OVS,py1:(ty1+1)*OVS,y:ty0*OVS,cols:[]};
  }
  const J=ovJob,t0=performance.now();let first=-1,last=-1;
  /* a job spans several frames and a kingdom can be founded meanwhile (rebellion, a new village), so the colours
     are extended to every kingdom that exists now; a missing entry used to throw on every frame and freeze the whole picture */
  for(let k=J.cols.length;k<tribes.length;k++){const c=tribes[k].color;J.cols.push([packRGBA(c[0],c[1],c[2],150),packRGBA(c[0]*.78|0,c[1]*.78|0,c[2]*.78|0,250)])}
  while(J.y<J.py1){
    ovOwnRow(J.y,J.px0,J.px1);
    if(J.y>J.py0){ovColourRow(J.y-1,J.px0,J.px1,J.cols);if(first<0)first=J.y-1;last=J.y-1}
    J.y++;
    if(performance.now()-t0>OV_MS)break;
  }
  if(J.y>=J.py1){
    ovColourRow(J.py1-1,J.px0,J.px1,J.cols);if(first<0)first=J.py1-1;last=J.py1-1;
    ovJob=null;ovDirty=ovFull||ovBox[2]>=0;
  }
  if(first>=0)ovX.putImageData(ovImg,0,0,J.px0,first,J.px1-J.px0,last-first+1);
}

/* the visible part of the domain colour layer, scaled onto the map. It is bold when zoomed out, so the map reads as
   a political map, and fades as you zoom in so villages and people show through */
function domainAlpha(tz){const z=tz/TS/dpr;return z<=.8?1:z>=4?.3:1-.7*Math.log(z/.8)/Math.log(5)}
function drawDomains(ox,oy,tz){
  const vx0=clamp(Math.floor(-ox/tz)-1,0,W),vx1=clamp(Math.ceil((cw-ox)/tz)+1,0,W),vy0=clamp(Math.floor(-oy/tz)-1,0,H),vy1=clamp(Math.ceil((ch-oy)/tz)+1,0,H);
  if(vx1<=vx0||vy1<=vy0)return;
  ctx.globalAlpha=domainAlpha(tz);ctx.imageSmoothingEnabled=true;
  ctx.drawImage(ovC,vx0*OVS,vy0*OVS,(vx1-vx0)*OVS,(vy1-vy0)*OVS,Math.round(ox+vx0*tz),Math.round(oy+vy0*tz),Math.round((vx1-vx0)*tz),Math.round((vy1-vy0)*tz));
  ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;
}

/* ambient life that isn't simulated: birds, fish, fireflies */
const flocks=[];
function initFlocks(){
  flocks.length=0;
  for(let k=0;k<5;k++)flocks.push({x:RC()*W,y:RC()*H,a:RC()*6.28,n:3+(RC()*5|0),seed:RC()*100});
}
const GLOW_W=glowSprite(255,190,110),GLOW_C=glowSprite(170,230,255),GLOW_F=glowSprite(255,140,50);
const CLOUD_D=cloudTexture(true),CLOUD_L=cloudTexture(false);
let cloudX=0,cloudY=0,fishT=0;
const drops=[];

/* ---------- combat visuals: all render-side, fed by HITQ/DEATHQ from sim.js ---------- */
const corpses=[];
const TINT=new WeakMap();
function tinted(img,red){
  let t=TINT.get(img);if(!t){t={};TINT.set(img,t)}
  const k=red?'r':'w';
  if(!t[k]){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=red?'rgba(235,40,30,.7)':'rgba(255,255,255,.85)';x.fillRect(0,0,c.width,c.height);t[k]=c}
  return t[k];
}
function drainCombat(inView,pz){
  for(let i=0;i<HITQ.length;i++){
    const h=HITQ[i];if(pz<.9||!inView(h.x,h.y)||effects.length>280)continue;
    effects.push({type:'dmg',x:h.x+(RC()-.5)*.4,y:h.y,s:String(Math.max(1,Math.round(h.d))),big:h.k,t:0,dur:reduceMotion?24:42});
    if(!reduceMotion){
      effects.push({type:'spark',x:h.x,y:h.y-.5,t:0,dur:9,n:h.k?7:4,a:RC()*6.28});
      if(h.m)effects.push({type:'slash',x:h.x,y:h.y-.5,a:RC()*6.28,t:0,dur:9});
    }
  }
  HITQ.length=0;
  const now=performance.now();
  for(let i=0;i<DEATHQ.length;i++){
    const u=DEATHQ[i];
    if(pz<.5||!inView(u.x,u.y))continue;
    if(corpses.length>=90)corpses.shift();
    corpses.push({u,x:u.x,y:u.y,dir:u.dir,t0:now});
  }
  DEATHQ.length=0;
}
function drawCorpses(SX,SY,pz,now){
  if(!corpses.length)return;
  const life=reduceMotion?700:2000,mark=reduceMotion?1500:4500;let n=0;
  for(let i=0;i<corpses.length;i++){
    const c=corpses[i],age=Math.max(0,now-c.t0);
    if(age>=mark)continue;
    corpses[n++]=c;
    const X=SX(c.x*TS),Y=SY((c.y+.35)*TS);
    const ma=Math.min(1,age/250)*(1-age/mark)*.55;
    ctx.fillStyle='rgba(120,20,20,'+ma+')';
    ctx.beginPath();ctx.ellipse(X,Y-pz*.5,pz*5*Math.min(1,.4+age/400),pz*2.2,0,0,7);ctx.fill();
    if(age>=life)continue;
    const u=c.u,s=unitSprite(u,0);let sc=adult(u)?1:u.k===0?.7:.65;if(u.scale)sc*=u.scale;if(u.k!==0&&SPECIES[u.sp].sz)sc*=SPECIES[u.sp].sz;
    const img=c.dir<0?flipped(s):s.c,fall=reduceMotion?1:Math.min(1,age/260),e=fall*fall*(3-2*fall);
    ctx.globalAlpha=age<life*.35?1:1-(age-life*.35)/(life*.65);
    ctx.save();ctx.translate(X,Y);ctx.rotate((c.dir<0?1:-1)*1.5708*e);
    ctx.drawImage(img,-Math.round(s.w*sc*pz/2),-Math.round(s.h*sc*pz),Math.round(s.w*sc*pz),Math.round(s.h*sc*pz));
    ctx.restore();ctx.globalAlpha=1;
  }
  corpses.length=n;
}

/* trees, ore and boulders are sprites, drawn row by row between the y-sorted items so they overlap people and homes with depth.
   Sprites are cached by a numeric key (kind, size, shade, season, paradox phase), so a frame allocates nothing */
/* every prop sprite (and its mirror) is copied once into one shared atlas, so a forest of hundreds of trees is drawn from a single
   source canvas and the GPU can batch the lot. If the atlas ever fills, a sprite just keeps drawing from its own canvas */
const AT_W=2048,AT_H=1024,ATLAS=document.createElement('canvas'),ATX=(ATLAS.width=AT_W,ATLAS.height=AT_H,ATLAS.getContext('2d'));
let atX=0,atY=0,atRow=0;
function atlasPut(c,w,h){
  if(atX+w>AT_W){atX=0;atY+=atRow;atRow=0}
  if(atY+h>AT_H)return null;
  ATX.drawImage(c,atX,atY);const r=[atX,atY];atX+=w+1;if(h+1>atRow)atRow=h+1;return r;
}
function propSprite(s){
  const a=atlasPut(s.c,s.w,s.h),b=a&&atlasPut(flipped(s),s.w,s.h);
  s.at=a&&b?[a[0],a[1],b[0],b[1]]:null;return s;
}
const SHD=shadowSprite().c,TSPR=[],ORSPR=[],TWO_PI=6.2832;
/* baking a prop sprite costs a few ms, so a frame bakes at most PROP_BAKES (a tree not baked yet borrows one of its kind),
   and spare frames bake the current season's trees ahead of time (warmProps) so panning never stalls */
const PROP_BAKES=4,TFALL=[];let propBakes=0,warmK=0;
function warmProps(){
  const sea=curSea,tot=TREE_KINDS.length*12;
  for(let n=0;n<tot&&propBakes<2;n++){
    const j=warmK++%tot,kind=TREE_KINDS[(j/12)|0],sz=((j%12)/4)|0,vi=j%4,key=(((TKI[kind]*3+sz)*4+vi)*4+sea)*13;
    if(TSPR[key])continue;propBakes++;const t=TSPR[key]=propSprite(treeSprite(kind,sz,vi,sea,-1));TFALL[TKI[kind]*4+sea]=TFALL[TKI[kind]*4+sea]||t;
  }
}
function drawPropRow(ty,xa,xb,ox,oy,pz){
  const row=ty*W;
  for(let x=xa;x<xb;x++){
    const i=row+x;
    let s,jx=0,jy=0,mir=false;
    if(tree[i]){
      if(lava[i])continue;
      const kind=treeKind(i),sea=tq[i],r=hash(x+9,ty+9),sz=r<.28?0:r<.78?1:2,vi=(hash(x,ty+999)*4)|0;
      let ph=-1;if(bm[i]===BM.PARA)ph=((((frameN*.012+(x+ty)*.14)%TWO_PI)+TWO_PI)%TWO_PI/TWO_PI*12|0)%12;
      const key=(((TKI[kind]*3+sz)*4+vi)*4+sea)*13+ph+1;
      s=TSPR[key];
      if(!s){if(propBakes<PROP_BAKES){propBakes++;s=TSPR[key]=propSprite(treeSprite(kind,sz,vi,sea,ph));TFALL[TKI[kind]*4+sea]=TFALL[TKI[kind]*4+sea]||s}else if(!(s=TFALL[TKI[kind]*4+sea]))continue}
      jx=((hash(x+3,ty+11)*5)|0)-2;jy=((hash(x+5,ty+3)*3)|0)-1;mir=hash(x+3,ty)<.5;
    }else if(ore[i]){
      if(lava[i])continue;
      const o=ore[i],a=oreAmt[i],sz=a<12?0:a<26?1:a<42?2:3,vi=(hash(x+1,ty+2)*4)|0,key=(o*4+sz)*4+vi;
      s=ORSPR[key];if(!s){if(propBakes>=PROP_BAKES)continue;propBakes++;s=ORSPR[key]=propSprite(rockSprite(o,sz,vi))}mir=hash(x+7,ty)<.5;
    }else if(deco[i]){
      const sz=hash(x+2,ty)<.6?1:2,vi=(hash(x,ty+2)*4)|0,key=1000+sz*4+vi;
      s=ORSPR[key];if(!s){if(propBakes>=PROP_BAKES)continue;propBakes++;s=ORSPR[key]=propSprite(rockSprite(0,sz,vi))}mir=hash(x+7,ty)<.5;jx=((hash(x+1,ty+4)*3)|0)-1;
    }else continue;
    const ax=mir?s.w-1-s.ax:s.ax,dx=Math.round(ox+(x*TS+4+jx-ax)*pz),dy=Math.round(oy+(ty*TS+6+jy-s.ay)*pz),dw=Math.round(s.w*pz),dh=Math.round(s.h*pz),at=s.at;
    if(at)ctx.drawImage(ATLAS,mir?at[2]:at[0],mir?at[3]:at[1],s.w,s.h,dx,dy,dw,dh);
    else ctx.drawImage(mir?flipped(s):s.c,dx,dy,dw,dh);
  }
}
/* far zoom: thousands of tiny tree sprites cost a draw call each, so props are painted into one small layer
   (3px per tile) refreshed about once a second and drawn with a single call. */
const FAR_TZ=6,FL=3,FCOL=new Map();let flC=null,flX=null,flImg=null,flBuf=null,flAt=-1e9;
function meanCol(s){
  const d=s.c.getContext('2d').getImageData(0,0,s.w,s.h).data;let r=0,g=0,b=0,n=0;
  for(let k=0;k<d.length;k+=4)if(d[k+3]>200){r+=d[k];g+=d[k+1];b+=d[k+2];n++}
  if(!n)return [0xff406030,0xff507838,0xff283c20];
  r/=n;g/=n;b/=n;const pk=(f)=>(0xff000000|(Math.min(255,b*f)<<16)|(Math.min(255,g*f)<<8)|Math.min(255,r*f))>>>0;
  return [pk(1),pk(1.25),pk(.62)];
}
function farCol(key,mk){let c=FCOL.get(key);if(!c){c=meanCol(mk());FCOL.set(key,c)}return c}
function buildFarLayer(){
  const lw=W*FL,lh=H*FL;
  if(!flC){flC=document.createElement('canvas');flC.width=lw;flC.height=lh;flX=flC.getContext('2d');flImg=flX.createImageData(lw,lh);flBuf=new Uint32Array(flImg.data.buffer)}
  flBuf.fill(0);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x;let c;
    if(tree[i]&&!lava[i]){const kind=treeKind(i),sea=tq[i];c=farCol('t'+kind+'_'+sea,()=>treeSprite(kind,1,0,sea,-1));
      const o=(y*FL)*lw+x*FL;flBuf[o+1]=c[1];flBuf[o+lw]=c[0];flBuf[o+lw+1]=c[0];flBuf[o+lw+2]=c[0];flBuf[o+2*lw+1]=c[2];if(hash(x,y)<.5)flBuf[o]=c[0];else flBuf[o+2]=c[0]}
    else if(ore[i]&&!lava[i]){const o0=ore[i];c=farCol('o'+o0,()=>rockSprite(o0,2,0));const o=(y*FL+1)*lw+x*FL;flBuf[o]=c[1];flBuf[o+1]=c[0];flBuf[o+lw]=c[0];flBuf[o+lw+1]=c[2]}
    else if(deco[i]){c=farCol('o0',()=>rockSprite(0,2,0));const o=(y*FL+1)*lw+x*FL+1;flBuf[o]=c[1];flBuf[o+lw]=c[2]}
  }
  flX.putImageData(flImg,0,0);flAt=frameN;
}
function draw(dt){
  frameN++;const nowT=performance.now();propBakes=0;
  updateTerrain();
  if(bDirty)rebuildBList();
  updateCamera(dt);
  const run=speed>0?SPS[speed]/20:0;
  ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#123068';ctx.fillRect(0,0,cw,ch);
  let sx=0,sy=0;
  const qs=quakeShake();
  if(shake>0||qs>0){const sh=Math.max(shake,qs);sx=(RC()-.5)*sh*dpr;sy=(RC()-.5)*sh*dpr;if(shake>0){shake*=Math.pow(.88,dt/16.7);if(shake<.4)shake=0}}
  const pz=cam.pz,ox=cam.ox+sx,oy=cam.oy+sy,tz=pz*TS;
  const SX=v=>Math.round(ox+v*pz),SY=v=>Math.round(oy+v*pz);

  ctx.imageSmoothingEnabled=Math.abs(pz-Math.round(pz))>.02;
  for(const c of chunks){
    const X0=SX(c.x0*TS),X1=SX((c.x0+c.tw)*TS),Y0=SY(c.y0*TS),Y1=SY((c.y0+c.th)*TS);
    if(X1<0||Y1<0||X0>cw||Y0>ch)continue;
    ctx.drawImage(c.c,X0,Y0,X1-X0,Y1-Y0);
  }
  ctx.imageSmoothingEnabled=false;
  if(showDomains){if(ovDirty||!ovC)buildOverlay();drawDomains(ox,oy,tz)}
  const x0=Math.floor(-ox/tz)-3,x1=Math.ceil((cw-ox)/tz)+3,y0=Math.floor(-oy/tz)-2,y1=Math.ceil((ch-oy)/tz)+4;
  const inView=(x,y)=>x>=x0&&x<x1&&y>=y0&&y<y1;
  /* sunlight glinting on open water */
  if(pz>=1.2&&light>.25){
    const per=70;ctx.fillStyle='#ffffff';
    for(let k=0;k<60;k++){
      const ph=(frameN+k*17)%per,ep=((frameN+k*17)/per)|0,fx=x0+hash(k,ep)*(x1-x0-4)+2,fy=y0+hash(k+99,ep)*(y1-y0-4)+2;
      if(!inb(fx|0,fy|0)||bio(hgt[(fy|0)*W+(fx|0)])>1)continue;
      const a=Math.sin(ph/per*Math.PI)*.55*light;ctx.globalAlpha=a;
      ctx.fillRect(SX(fx*TS),SY(fy*TS),Math.max(1,Math.round(pz*2)),Math.max(1,Math.round(pz)));
    }
    ctx.globalAlpha=1;
  }
  const blit=(img,w,h,X,Y,sc)=>{const a=SX(X),b=SY(Y);ctx.drawImage(img,a,b,Math.round(w*pz*sc),Math.round(h*pz*sc))};

  items.length=0;vis.length=0;visB.length=0;fireSpots.length=0;
  /* each village keeps a bonfire at its heart (drawn under the people), flickering and lighting the night */
  for(const T of tribes){
    if(!T.alive)continue;
    for(const H of T.towns){
      if(H.houses<2||!inView(H.x,H.y))continue;
      let bx=H.x;const by=H.y;
      if(bld[by*W+bx]!==-1){bx++;if(!inb(bx,by)||bld[by*W+bx]!==-1){bx-=2;if(!inb(bx,by)||bld[by*W+bx]!==-1)continue}}
      const s=bonfireSprite(((frameN>>2)+bx*3+by)%3);
      blit(s.c,s.w,s.h,(bx+.5)*TS-s.w/2,(by+1)*TS-s.h+1,1);fireSpots.push(bx+.5,by+.4);
    }
  }
  for(const b of bList)if(inView(b.x,b.y)){drawItem(b.y+.95).b=b;visB.push(b)}
  for(const u of units){
    if(u.inside)continue;
    const x=u.px+(u.x-u.px)*alpha,y=u.py+(u.y-u.py)*alpha;
    if(inView(x,y)){const it=drawItem(u.fly?y+SPECIES[u.sp].alt*.1:y);it.u=u;it.x=x;it.ry=y;vis.push(u)}
  }
  for(const b of boats){const x=b.px+(b.x-b.px)*alpha,y=b.py+(b.y-b.py)*alpha;if(inView(x,y)){const it=drawItem(y+.3);it.boat=b;it.x=x}}
  for(const m of monoliths)if(inView(m.x,m.y))drawItem(m.y+.95).mono=m;
  items.sort(byY);
  const close=pz>=1.5;
  drainCombat(inView,pz);drawCorpses(SX,SY,pz,nowT);
  let tr=Math.max(0,y0),trEnd=Math.min(H-1,y1-2);const pxa=Math.max(0,x0),pxb=Math.min(W,x1);
  if(tz<FAR_TZ){
    if(!flC||frameN-flAt>60)buildFarLayer();
    const lp=tz/FL;ctx.drawImage(flC,Math.round(ox),Math.round(oy-tz*.35),Math.round(W*FL*lp),Math.round(H*FL*lp));
    tr=trEnd+1;
  }
  for(const it of items){
    while(tr<=trEnd&&tr+.55<it.y)drawPropRow(tr++,pxa,pxb,ox,oy,pz);
    if(it.b){
      const b=it.b,T=b.t>=0?tribes[b.t]:null;
      const s=T?buildingSprite(T.race,b.ty,T.ci,T.rel.domain,b.tier,b.v):buildingSprite('',3,0,'');
      {const sw=s.w*.98;ctx.drawImage(SHD,SX((b.x+.5)*TS-s.w/2+s.w*.07),SY((b.y+1)*TS-3.2),Math.round(sw*pz),Math.round(Math.min(8,3+s.w*.2)*pz))}
      blit(s.c,s.w,s.h,(b.x+.5)*TS-s.w/2,(b.y+1)*TS-s.h+1,1);
      if(b.ty===8&&s.hub){const h=s.hub,hx=(b.x+.5)*TS-s.w/2+h.x,hy=(b.y+1)*TS-s.h+1+h.y,L=h.len,st=6.2832/h.n,a=(reduceMotion?0:frameN*.045)+b.x;ctx.strokeStyle=h.col;ctx.lineWidth=Math.max(1,pz*1.1);ctx.beginPath();for(let q=0;q<h.n;q++){const an=a+q*st;ctx.moveTo(SX(hx),SY(hy));ctx.lineTo(SX(hx+Math.cos(an)*L),SY(hy+Math.sin(an)*L))}ctx.stroke();ctx.strokeStyle='rgba(60,50,40,.55)';ctx.lineWidth=Math.max(1,pz*.5);ctx.beginPath();for(let q=0;q<h.n;q++){const an=a+q*st+.08;ctx.moveTo(SX(hx),SY(hy));ctx.lineTo(SX(hx+Math.cos(an)*L),SY(hy+Math.sin(an)*L))}ctx.stroke()}
      if(T&&close&&b.ty===5&&b.tier<=5&&RC()<(b.tier===5?.03:.012)*(dt/16.7)&&effects.length<300)effects.push({type:'smoke',x:b.x+.85,y:b.y-.6,t:0,dur:80});
      if(T&&close&&b.ty<2&&b.tier<6&&(T.race==='human'||T.race==='dwarf'||b.tier>=4)&&RC()<.006*(dt/16.7)&&effects.length<300)
        effects.push({type:'smoke',x:b.x+(T.race==='human'?.85:.95)-(b.ty===1?.4:0),y:b.y-1.2,t:0,dur:80});
    }else if(it.u){
      const u=it.u,y=it.ry,moving=u.moving&&speed>0,fr=moving||u.fly&&speed>0?(((frameN>>(u.fly?2:3))+u.id)&1):0,alt=u.fly?SPECIES[u.sp].alt+Math.sin(frameN/14+u.id)*1.2:0;
      const s=unitSprite(u,fr);let sc=adult(u)?1:u.k===0?.7:.65;
      if(u.scale)sc*=u.scale;
      if(u.k!==0&&SPECIES[u.sp].sz)sc*=SPECIES[u.sp].sz;
      let fx=it.x*TS,fy=(y+.35)*TS;
      let img=u.dir<0?flipped(s):s.c;
      if(!reduceMotion){
        const la=nowT-u._atkAt,ha=nowT-u._hitAt;
        if(la<170){const o=Math.sin(la/170*Math.PI)*.38*TS;fx+=u._ax*o;fy+=u._ay*o*.6}
        if(ha<150){const o=(1-ha/150)*.22*TS;fx+=u._kx*o;fy+=u._ky*o*.6}
      }
      {const ha=nowT-u._hitAt;if(ha<130)img=tinted(img,ha>55)}
      if(pz>=.8){const sw=Math.max(5,s.w*sc*.78);if(u.fly)ctx.globalAlpha=.55;ctx.drawImage(SHD,SX(fx-sw/2+.8),SY(fy-sw*.12-.4),Math.round(sw*pz),Math.max(1,Math.round(sw*.3*pz)));ctx.globalAlpha=1}
      if(u.sp==='wraith')ctx.globalAlpha=.78;
      if(u.dig>step){
        /* burrowed: only a moving mound of sand and a spray of dust show where it is */
        const mx=SX(fx),my=SY(fy),dr=u.tx>u.x?1:-1;
        for(let q=3;q>=0;q--){const rr=tz*(.95-q*.14),ox2=-dr*q*tz*.55;ctx.fillStyle=q?'rgba(170,128,78,'+(.5-q*.1)+')':'rgba(196,152,98,.95)';ctx.beginPath();ctx.ellipse(mx+ox2,my-q*.2*pz,rr,rr*.42,0,0,7);ctx.fill()}
        ctx.fillStyle='rgba(236,204,150,.9)';ctx.beginPath();ctx.ellipse(mx,my-tz*.12,tz*.55,tz*.2,0,0,7);ctx.fill();
        if(!reduceMotion&&speed>0&&RC()<.18*(dt/16.7)&&effects.length<300)effects.push({type:'dust',x:u.x+(RC()-.5)*.8,y:u.y,t:0,dur:26});
      }else
      blit(img,s.w,s.h,fx-s.w*sc/2,fy-s.h*sc-alt-(moving&&fr&&!u.fly?.7:0),sc);
      ctx.globalAlpha=1;
      if(u.frozen>step){ctx.fillStyle='rgba(176,224,255,.42)';ctx.fillRect(SX(fx-s.w*sc/2-.5),SY(fy-s.h*sc-alt-.5),Math.round((s.w*sc+1)*pz),Math.round((s.h*sc+1)*pz));ctx.strokeStyle='rgba(235,250,255,.8)';ctx.lineWidth=Math.max(1,pz*.5);ctx.strokeRect(SX(fx-s.w*sc/2-.5),SY(fy-s.h*sc-alt-.5),Math.round((s.w*sc+1)*pz),Math.round((s.h*sc+1)*pz))}
      if(u.shield>step){ctx.strokeStyle=`rgba(255,226,120,${.45+.3*Math.sin(frameN/6+u.id)})`;ctx.lineWidth=Math.max(1,pz*.7);ctx.beginPath();ctx.arc(SX(fx),SY(fy-s.h*sc*.5-alt),Math.max(4,s.h*sc*pz*.72),0,7);ctx.stroke()}
      if(u.haste>step&&moving){ctx.fillStyle='rgba(140,240,255,.6)';for(let q=1;q<3;q++)ctx.fillRect(SX(fx-u.dir*(s.w*sc/2+q*2)),SY(fy-s.h*sc*.5-alt+q),Math.round(pz*2),Math.max(1,Math.round(pz*.6)))}
      if(u.k===1&&pz>=.55&&u.hp<u.maxhp&&u.hp>0&&SPECIES[u.sp].boss){
        /* great beasts carry a broad red health bar */
        const f=u.hp/u.maxhp,pw=Math.max(1,Math.round(pz)),bw=Math.round(16*pz),bx=SX(fx-8),by=SY(fy-s.h*sc-4-alt);
        ctx.fillStyle='rgba(10,6,6,.85)';ctx.fillRect(bx-pw,by-pw,bw+2*pw,3*pw);
        ctx.fillStyle='#e0301f';ctx.fillRect(bx,by,Math.max(pw,Math.round(bw*f)),pw);
        ctx.fillStyle='rgba(255,170,150,.55)';ctx.fillRect(bx,by,Math.max(pw,Math.round(bw*f)),Math.max(1,pw>>1));
      }else if(pz>=1&&u.hp<u.maxhp&&u.hp>0){
        /* pixel health bar: dark frame, fill coloured by health */
        const f=u.hp/u.maxhp,pw=Math.max(1,Math.round(pz)),bw=Math.round(8*pz),bx=SX(fx-4),by=SY(fy-s.h*sc-3-alt);
        ctx.fillStyle='rgba(10,8,8,.8)';ctx.fillRect(bx-pw,by-pw,bw+2*pw,3*pw);
        ctx.fillStyle=f>.6?'#6fd36a':f>.3?'#e8c23c':'#e5533d';ctx.fillRect(bx,by,Math.max(pw,Math.round(bw*f)),pw);
      }
    }else if(it.mono){
      const m=it.mono,s=spr('monolith',monolithSprite);
      blit(s.c,s.w,s.h,(m.x+.5)*TS-s.w/2,(m.y+1)*TS-s.h+1,1);
      const pulse=.25+.25*Math.sin(frameN/12);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=pulse;
      const rad=1.6*tz;ctx.drawImage(GLOW_C,SX((m.x+.5)*TS)-rad,SY((m.y+.2)*TS)-rad,rad*2,rad*2);
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }else{
      const b=it.boat,[bx,by]=ipos(b),s=boatSprite(b.kind,b.race,b.ci,tribes[b.tribe].age),bob=Math.sin(frameN/18+b.id)*.8;
      blit(b.dir<0?flipped(s):s.c,s.w,s.h,bx*TS-s.w/2,(by+.5)*TS-s.h+2+bob,1);
      boatWake(b,s,bx,by,bob,SX,SY,pz);
      if(close&&speed>0&&frameN%10===0&&b.x!==b.px&&effects.length<300)effects.push({type:'wake',x:bx,y:by+.35,t:0,dur:40});
    }
  }
  while(tr<=trEnd)drawPropRow(tr++,pxa,pxb,ox,oy,pz);
  const fs=[spr('flame0',()=>flameSprite(0)),spr('flame1',()=>flameSprite(1))];
  let fireVis=0;
  for(const i of fires){
    const x=i%W,y=(i/W)|0;if(!inView(x,y))continue;fireVis++;
    const s=fs[((frameN>>2)+i)&1];blit(s.c,s.w,s.h,x*TS,(y+1)*TS-s.h,1);
  }
  /* birds fly over everything */
  const bat=light<.3;
  for(const f of flocks){
    if(speed>0){f.a+=Math.sin(frameN/200+f.seed)*.004*run;f.x+=Math.cos(f.a)*.045*run*(dt/16.7);f.y+=Math.sin(f.a)*.03*run*(dt/16.7)}
    if(f.x<-5)f.x=W+4;if(f.x>W+5)f.x=-4;if(f.y<-5)f.y=H+4;if(f.y>H+5)f.y=-4;
    const n=bat?Math.min(f.n,3):f.n;
    for(let k=0;k<n;k++){
      const bx=f.x+Math.cos(k*2.1+f.seed)*1.2*(k>0),by=f.y+Math.sin(k*1.7+f.seed)*.8*(k>0)-2;
      if(!inView(bx,by))continue;
      const s=spr(`bird|${((frameN>>2)+k)&1}|${bat}`,()=>birdSprite(((frameN>>2)+k)&1,bat));
      ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(SX(bx*TS),SY((by+3)*TS),Math.round(4*pz),Math.round(pz));
      blit(Math.cos(f.a)<0?flipped(s):s.c,s.w,s.h,bx*TS,by*TS,1);
    }
  }
  /* cloud shadows */
  cloudX+=dt*.01*WX.wind*(run||.15);cloudY+=dt*.003*(run||.15);
  if(WX.cloud>.03){
    const size=1024*pz,bx=ox+cloudX*pz,by=oy+cloudY*pz;
    ctx.globalAlpha=Math.min(1,WX.cloud*.65);
    for(let i=Math.floor(-bx/size);i*size+bx<cw;i++)for(let j=Math.floor(-by/size);j*size+by<ch;j++)ctx.drawImage(CLOUD_D,bx+i*size,by+j*size,size,size);
    ctx.globalAlpha=1;
  }
  /* time of day tint */
  let r=lerp(46,255,light),g=lerp(58,255,light),b=lerp(122,255,light);
  const warm=Math.exp(-Math.pow(sunH/.22,2))*.6;
  r=lerp(r,255,warm*.25);g=lerp(g,176,warm);b=lerp(b,128,warm);
  const dim=1-WX.cloud*.1-WX.rain*.1-WX.storm*.14;r*=dim;g*=dim;b*=dim;
  if(r<253||g<253||b<253){ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(${r|0},${g|0},${b|0})`;ctx.fillRect(0,0,cw,ch)}
  /* lights */
  const dark=clamp(1-light+WX.storm*.25,0,1);
  ctx.globalCompositeOperation='lighter';
  if(dark>.06){
    ctx.globalAlpha=dark*.85;
    for(const bb of visB){
      if(bb.ty===3)continue;const T=tribes[bb.t];
      const rad=(bb.ty===1?3.4:bb.ty===4?1.9:bb.ty===5?2.8:bb.ty===8||bb.ty===6?1.2:2.4)*tz,X=SX((bb.x+.5)*TS),Y=SY((bb.y+.3)*TS);
      ctx.drawImage((bb.ty===2||bb.ty===4)?glowCol(DOMAINS[T.rel.domain].c):(T.race==='elf'?GLOW_C:GLOW_W),X-rad,Y-rad,rad*2,rad*2);
    }
    for(const bo of boats){const [x,y]=ipos(bo);if(!inView(x,y))continue;const rad=1.2*tz;ctx.drawImage(GLOW_W,SX(x*TS)-rad,SY(y*TS)-rad,rad*2,rad*2)}
    for(let k=0;k<fireSpots.length;k+=2){const rad=(3+(reduceMotion?0:Math.sin(frameN/5+k)*.3))*tz;ctx.drawImage(GLOW_F,SX(fireSpots[k]*TS)-rad,SY(fireSpots[k+1]*TS)-rad,rad*2,rad*2)}
    for(const m of monoliths){if(!inView(m.x,m.y))continue;const rad=3*tz;ctx.drawImage(GLOW_C,SX((m.x+.5)*TS)-rad,SY((m.y-.5)*TS)-rad,rad*2,rad*2)}
    if(dark>.5&&!reduceMotion){
      ctx.globalAlpha=(dark-.5)*1.6;ctx.fillStyle='rgb(220,255,140)';
      for(let k=0;k<60;k++){
        const fx=x0+hash(k,7)*(x1-x0),fy=y0+hash(k,9)*(y1-y0),ti=(fy|0)*W+(fx|0);
        if(!inb(fx|0,fy|0)||!tree[ti])continue;
        const tt=frameN/40+k;if(Math.sin(tt*1.7)<.3)continue;
        ctx.fillRect(SX(fx*TS+Math.sin(tt)*6),SY(fy*TS+Math.cos(tt*.8)*5),Math.max(1,pz),Math.max(1,pz));
      }
    }
  }
  ctx.globalAlpha=Math.min(1,.35+dark);
  let fl=0;
  for(const i of fires){if(fl++>160)break;const x=i%W,y=(i/W)|0;if(!inView(x,y))continue;const rad=2.2*tz*(.9+RC()*.2);ctx.drawImage(GLOW_F,SX((x+.5)*TS)-rad,SY((y+.5)*TS)-rad,rad*2,rad*2)}
  for(const i of lavas){const x=i%W,y=(i/W)|0;if(!inView(x,y))continue;const rad=1.8*tz;ctx.drawImage(GLOW_F,SX((x+.5)*TS)-rad,SY((y+.5)*TS)-rad,rad*2,rad*2)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  /* zoomed out at night the kingdoms would vanish into the dark, so their colours glow back through a little */
  if(showDomains&&ovC&&dark>.3&&pz<1.6*dpr){ctx.globalAlpha=Math.min(.55,(dark-.3)*.8);drawDomains(ox,oy,tz);ctx.globalAlpha=1}
  /* fog & snow light */
  if(WX.fog>.03){
    const size=700*pz,bx=ox-cloudX*.6*pz,by=oy+cloudY*.4*pz;
    ctx.globalAlpha=WX.fog*.5;
    for(let i=Math.floor(-bx/size);i*size+bx<cw;i++)for(let j=Math.floor(-by/size);j*size+by<ch;j++)ctx.drawImage(CLOUD_L,bx+i*size,by+j*size,size,size);
    ctx.globalAlpha=1;ctx.fillStyle=`rgba(220,226,232,${WX.fog*.14})`;ctx.fillRect(0,0,cw,ch);
  }
  if(WX.snow>.03){ctx.fillStyle=`rgba(235,242,255,${WX.snow*.1})`;ctx.fillRect(0,0,cw,ch)}
  drawPrecip(dt,run);
  drawWorldFx(ox,oy,pz,inView);
  drawDivine(ox,oy,pz);
  drawEffects(ox,oy,pz,dt);
  drawWarArrows(ox,oy,pz);
  drawLabels(ox,oy,pz,inView);
  if(sel){
    let px,py,ok=true;
    if(sel.u){ok=!sel.u.dead&&!sel.u.inside;[px,py]=ipos(sel.u);py+=.35}
    else if(sel.boat){ok=!sel.boat.dead;[px,py]=ipos(sel.boat);py+=.5}
    else if(sel.i!=null){ok=bld[sel.i]!==-1;px=sel.i%W+.5;py=((sel.i/W)|0)+1}
    else if(sel.t!=null){px=sel.t%W+.5;py=((sel.t/W)|0)+.8}
    if(ok){
      const X=ox+px*tz,Y=oy+py*tz,rr=Math.max(6*dpr,tz*(sel.i!=null?1.1:.55));
      ctx.strokeStyle=`rgba(255,236,150,${reduceMotion?.9:.6+.4*Math.sin(frameN/8)})`;ctx.lineWidth=Math.max(2,dpr*2);
      ctx.beginPath();ctx.ellipse(X,Y,rr,rr*.45,0,0,7);ctx.stroke();
    }
  }
  if(hover&&tool!=='move'&&tool!=='inspect'){
    const X=ox+((hover.x|0)+.5)*tz,Y=oy+((hover.y|0)+.5)*tz;
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1.5,dpr*1.5);
    const rr=BRUSH.has(tool)?(brushSize-.5)*tz:tz*1.6;
    ctx.beginPath();ctx.arc(X,Y,Math.max(rr,4*dpr),0,7);ctx.stroke();
  }
  /* sound */
  let water=0;for(let k=0;k<9;k++){const tx=clamp(x0+((k%3)+.5)*(x1-x0)/3|0,0,W-1),ty=clamp(y0+(((k/3)|0)+.5)*(y1-y0)/3|0,0,H-1);if(isWater(ty*W+tx))water++}
  viewInfo={water:water/9,close:clamp((pz/dpr-.4)/1.4,0,1)};
  processSound(ox,oy,pz,vis,fireVis,dt);
  if(tz>=FAR_TZ||frameN%4===0)warmProps();
  if(speed>0&&close&&(fishT+=dt)>1800){fishT=RC()*900;for(let k=0;k<12;k++){const fx=x0+RC()*(x1-x0),fy=y0+RC()*(y1-y0);if(inb(fx|0,fy|0)&&isWater((fy|0)*W+(fx|0))&&(fx|0)>0){effects.push({type:'fish',x:fx,y:fy,t:0,dur:36});SFXQ.push({t:'fish',x:fx,y:fy});break}}}
}
function drawPrecip(dt,run){
  if(reduceMotion){drops.length=0;return}
  const want=Math.round((cw*ch/(dpr*dpr))/2600*Math.max(WX.rain,WX.snow)),snow=WX.snow>WX.rain;
  while(drops.length<want)drops.push({x:RC()*cw,y:RC()*ch,v:.6+RC()*.5,s:RC()});
  if(drops.length>want)drops.length=want;
  if(!drops.length)return;
  const k=dt/16.7,wind=WX.wind*(snow?.6:2.2)*dpr;
  if(snow){
    ctx.fillStyle='rgba(250,252,255,.85)';
    for(const d of drops){d.y+=d.v*1.6*dpr*k;d.x+=(wind+Math.sin(frameN/30+d.s*9))*k*.6;if(d.y>ch){d.y=-4;d.x=RC()*cw}if(d.x<0)d.x+=cw;if(d.x>cw)d.x-=cw;
      const z=(1+d.s*1.5)*dpr;ctx.fillRect(d.x,d.y,z,z)}
  }else{
    ctx.strokeStyle=`rgba(180,205,235,${.35+WX.storm*.2})`;ctx.lineWidth=Math.max(1,dpr*.8);ctx.beginPath();
    for(const d of drops){d.y+=d.v*14*dpr*k;d.x+=wind*k;if(d.y>ch){d.y=-20;d.x=RC()*cw}if(d.x<0)d.x+=cw;if(d.x>cw)d.x-=cw;
      ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-wind*1.5,d.y-12*dpr*d.v)}
    ctx.stroke();
  }
}
/* a 5x7 pixel sword, h pixels tall */
const SWORD=['..#..','..#..','..#..','..#..','#####','..#..','..#..'];
function drawSword(x,y,h){
  const p=h/7;
  for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(SWORD[r][c]==='#'){ctx.fillStyle=r===4?'#f2c14e':r>4?'#c89a5a':'#e8eef8';ctx.fillRect(Math.round(x+c*p),Math.round(y+r*p),Math.ceil(p),Math.ceil(p))}
}
function drawLabels(ox,oy,pz,inView){
  const tz=pz*TS,fsz=Math.round(Math.max(11*dpr,Math.min(15*dpr,pz*5)));
  ctx.font=`600 ${fsz}px "Pixelify Sans", "Courier New", monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
  for(const T of tribes){
    if(!T.alive||T.hall<0)continue;
    const x=T.hall%W,y=(T.hall/W)|0;if(!inView(x,y))continue;
    const X=ox+(x+.5)*tz,Y=oy+(y+1)*tz-30*pz-fsz*.9;
    /* name and people, then a drawn sword and the soldiers: a font glyph for the sword looks different on every system */
    const label=`${RACES[T.race].icon} ${T.name}  ${T.pop}`,sold=String((T.jobs&&T.jobs.soldier)||0);
    const wl=ctx.measureText(label).width,ws=ctx.measureText(sold).width,sw=fsz*.75,w=wl+sw+ws+fsz*1.5,L=X-w/2;
    ctx.fillStyle=`rgba(${T.color[0]*.55|0},${T.color[1]*.55|0},${T.color[2]*.55|0},.88)`;
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(L,Y-fsz*.7,w,fsz*1.4,fsz*.4);else ctx.rect(L,Y-fsz*.7,w,fsz*1.4);ctx.fill();
    ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(label,L+fsz*.5,Y+1);
    drawSword(L+fsz*.5+wl+fsz*.35,Y-fsz*.45,fsz*.9);
    ctx.fillStyle='#fff';ctx.fillText(sold,L+fsz*.5+wl+fsz*.35+sw,Y+1);ctx.textAlign='center';
  }
  /* villages of a kingdom carry its colour, with a smaller banner */
  if(pz<.9*dpr)return;
  const f2=Math.round(fsz*.82);ctx.font=`600 ${f2}px "Pixelify Sans", "Courier New", monospace`;
  for(const T of tribes){
    if(!T.alive)continue;
    for(let k=1;k<T.towns.length;k++){
      const H=T.towns[k];if(!H.houses&&!H.pop)continue;if(!inView(H.x,H.y))continue;
      const X=ox+(H.x+.5)*tz,Y=oy+(H.y-1.6)*tz-f2;
      const label=`${H.name} ${H.pop}`,w=ctx.measureText(label).width+f2*1.6;
      ctx.fillStyle=`rgba(${T.color[0]*.45|0},${T.color[1]*.45|0},${T.color[2]*.45|0},.8)`;
      ctx.beginPath();if(ctx.roundRect)ctx.roundRect(X-w/2,Y-f2*.7,w,f2*1.4,f2*.4);else ctx.rect(X-w/2,Y-f2*.7,w,f2*1.4);ctx.fill();
      ctx.fillStyle=css(T.color);ctx.fillRect(X-w/2+f2*.35,Y-f2*.35,f2*.6,f2*.7);
      ctx.fillStyle='#fff';ctx.fillText(label,X+f2*.3,Y+1);
    }
  }
}
function drawEffects(ox,oy,pz){
  const tz=pz*TS,T2S=(x,y)=>[ox+x*tz,oy+y*tz];
  for(const e of effects){
    if(e.type==='rite'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y),c=e.c;
      ctx.globalCompositeOperation='lighter';
      for(let r=0;r<3;r++){const q=clamp(p*1.3-r*.18,0,1);if(q<=0)continue;
        ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${(1-q)*.8})`;ctx.lineWidth=Math.max(2,pz*1.5);
        ctx.beginPath();ctx.ellipse(X,Y,tz*(1+q*(e.big?7:3.5)),tz*(.4+q*(e.big?3:1.5)),0,0,7);ctx.stroke()}
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${1-p})`;
      for(let k=0;k<(e.big?16:8);k++){const ang=k*2.4+p*3,rr=tz*(.6+((k*37)%10)/10*(e.big?3:1.5));
        ctx.fillRect(Math.round(X+Math.cos(ang)*rr),Math.round(Y-p*tz*(2+k%4)+Math.sin(ang)*rr*.4),Math.max(2,pz*1.5),Math.max(2,pz*1.5))}
      ctx.globalCompositeOperation='source-over';
    }else if(e.type==='bolt'){
      const a=1-e.t/e.dur;
      ctx.fillStyle=`rgba(255,255,240,${a*.25})`;ctx.fillRect(0,0,cw,ch);
      ctx.strokeStyle=`rgba(255,250,200,${a})`;ctx.lineWidth=Math.max(2,pz*3);ctx.lineJoin='round';
      ctx.beginPath();e.pts.forEach((p,k)=>{const [X,Y]=T2S(p[0],p[1]);k?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.stroke();
    }else if(e.type==='meteor'){
      if(e.t<22){
        const p=e.t/22,q=Math.max(0,p-.25),[X,Y]=T2S(e.x+34-34*p+.5*p,e.y-48+48.5*p),[X0,Y0]=T2S(e.x+34-34*q,e.y-48+48*q);
        const g=ctx.createLinearGradient(X0,Y0,X,Y);g.addColorStop(0,'rgba(255,140,40,0)');g.addColorStop(1,'rgba(255,220,120,1)');
        ctx.strokeStyle=g;ctx.lineWidth=Math.max(3,tz*1.2);ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X,Y);ctx.stroke();
        ctx.fillStyle='#fff3c0';ctx.beginPath();ctx.arc(X,Y,Math.max(3,tz*1.1),0,7);ctx.fill();
      }else{
        const t=(e.t-22)/(e.dur-22),[X,Y]=T2S(e.x+.5,e.y+.5);
        ctx.fillStyle=`rgba(255,170,80,${(1-t)*.35})`;ctx.fillRect(0,0,cw,ch);
        ctx.strokeStyle=`rgba(255,230,180,${1-t})`;ctx.lineWidth=Math.max(2,tz*.6);
        ctx.beginPath();ctx.arc(X,Y,tz*(2+t*12),0,7);ctx.stroke();
      }
    }else if(e.type==='blast'){
      const p=clamp(e.t/e.dur,0,1),[X,Y]=T2S(e.x,e.y),c=e.c,rad=tz*e.r;
      if(e.dark){
        ctx.fillStyle=`rgba(10,0,20,${(1-p)*.6})`;ctx.beginPath();ctx.arc(X,Y,rad*(.25+p*.75),0,7);ctx.fill();
        ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${1-p})`;ctx.lineWidth=Math.max(2,tz*.6);ctx.beginPath();ctx.arc(X,Y,rad*(.15+p*1.1),0,7);ctx.stroke();
      }else{
        if(e.big&&p<.2){ctx.fillStyle=`rgba(255,248,224,${(1-p/.2)*.85})`;ctx.fillRect(0,0,cw,ch)}
        ctx.globalCompositeOperation='lighter';
        const rr=Math.max(4,rad*(.2+Math.sqrt(p)*.85)),g=ctx.createRadialGradient(X,Y,0,X,Y,rr);
        g.addColorStop(0,`rgba(255,255,230,${(1-p)*.9})`);g.addColorStop(.45,`rgba(${c[0]},${c[1]},${c[2]},${(1-p)*.7})`);g.addColorStop(1,`rgba(${c[0]},${c[1]*.5|0},${c[2]*.3|0},0)`);
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,rr,0,7);ctx.fill();
        ctx.strokeStyle=`rgba(255,240,200,${(1-p)*.8})`;ctx.lineWidth=Math.max(2,tz*.4);ctx.beginPath();ctx.arc(X,Y,rad*(.3+p*1.1),0,7);ctx.stroke();
        if(e.big){
          const cy=Y-rad*(.3+p*1.6),cr=rad*(.28+p*.4);
          ctx.fillStyle=`rgba(${c[0]},${c[1]*.8|0},${c[2]*.5|0},${(1-p)*.6})`;
          ctx.fillRect(X-cr*.28,cy,cr*.56,Y-cy);
          ctx.beginPath();ctx.ellipse(X,cy,cr,cr*.62,0,0,7);ctx.fill();
        }
        ctx.globalCompositeOperation='source-over';
      }
    }else if(e.type==='laser'){
      const p=clamp(e.t/e.dur,0,1),[X0,Y0]=T2S(e.x0,e.y0),[X1,Y1]=T2S(e.x1,e.y1),a=p<.15?p/.15:1-(p-.15)/.85;
      ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
      ctx.strokeStyle=`rgba(255,80,60,${a*.5})`;ctx.lineWidth=Math.max(6,tz*2.6);ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X1,Y1);ctx.stroke();
      ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=Math.max(2,tz*.8);ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X1,Y1);ctx.stroke();
      ctx.globalCompositeOperation='source-over';
    }else if(e.type==='flame'){
      const p=clamp(e.t/e.dur,0,1);ctx.globalCompositeOperation='lighter';
      for(let k=0;k<7;k++){
        const q=clamp(p*1.3-k*.06,0,1);if(q<=0||q>=1)continue;
        const [X,Y]=T2S(e.x0+(e.x1-e.x0)*q,e.y0+(e.y1-e.y0)*q+Math.sin(k*2+e.t)*.12),r=tz*(.35+q*.9);
        ctx.fillStyle=`rgba(255,${150+k*12},40,${(1-q)*.75})`;ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';
    }else if(e.type==='beam'){
      const p=clamp(e.t/e.dur,0,1),[X,Y]=T2S(e.x,e.y),a=p<.2?p/.2:1-(p-.2)/.8,bw=Math.max(4,tz*.9);
      ctx.globalCompositeOperation='lighter';
      const g=ctx.createLinearGradient(0,Y-tz*30,0,Y);g.addColorStop(0,'rgba(120,220,255,0)');g.addColorStop(1,`rgba(170,240,255,${a*.85})`);
      ctx.fillStyle=g;ctx.fillRect(X-bw/2,Y-tz*30,bw,tz*30);
      ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fillRect(X-bw/6,Y-tz*30,bw/3,tz*30);
      ctx.strokeStyle=`rgba(150,230,255,${a})`;ctx.lineWidth=Math.max(2,tz*.35);
      ctx.beginPath();ctx.ellipse(X,Y,tz*e.r*Math.min(1,p*2.2),tz*e.r*.45*Math.min(1,p*2.2),0,0,7);ctx.stroke();
      ctx.globalCompositeOperation='source-over';
    }else if(e.type==='drop'){
      const [X,Y]=T2S(e.x,e.y+e.t*.35);
      ctx.strokeStyle='rgba(190,220,255,.8)';ctx.lineWidth=Math.max(1,dpr);
      ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X-tz*.2,Y+tz*.9);ctx.stroke();
    }else if(e.type==='arrow'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x0+(e.x1-e.x0)*p,e.y0+(e.y1-e.y0)*p),[X2,Y2]=T2S(e.x0+(e.x1-e.x0)*Math.max(0,p-.25),e.y0+(e.y1-e.y0)*Math.max(0,p-.25));
      ctx.strokeStyle=e.c||'#f3ead0';ctx.lineWidth=Math.max(1,pz*(e.c?2:1));ctx.beginPath();ctx.moveTo(X2,Y2);ctx.lineTo(X,Y);ctx.stroke();
    }else if(e.type==='quake'){
      const p=clamp(e.t/e.dur,0,1),[X,Y]=T2S(e.x,e.y),rr=tz*e.r*(.25+p*.85);
      ctx.strokeStyle=`rgba(120,86,50,${(1-p)*.9})`;ctx.lineWidth=Math.max(2,tz*.28*(1-p*.6));
      ctx.beginPath();ctx.ellipse(X,Y,rr,rr*.42,0,0,7);ctx.stroke();
      ctx.fillStyle=`rgba(190,150,100,${(1-p)*.5})`;
      for(let k=0;k<9;k++){const a=k*.7+e.x,q=rr*(.7+((k*13)%5)/10);ctx.fillRect(Math.round(X+Math.cos(a)*q),Math.round(Y+Math.sin(a)*q*.42-p*tz*(.6+k%3*.3)),Math.max(2,pz*1.6),Math.max(2,pz*1.6))}
    }else if(e.type==='boulder'){
      const p=clamp(e.t/e.dur,0,1),bx=e.x0+(e.x1-e.x0)*p,by=e.y0+(e.y1-e.y0)*p-Math.sin(p*Math.PI)*2.4,[X,Y]=T2S(bx,by);
      ctx.fillStyle='#7a7468';ctx.beginPath();ctx.arc(X,Y,Math.max(3,tz*.38),0,7);ctx.fill();ctx.fillStyle='#a49e90';ctx.beginPath();ctx.arc(X-tz*.1,Y-tz*.1,Math.max(1.5,tz*.16),0,7);ctx.fill();
    }else if(e.type==='web'){
      const p=clamp(e.t/e.dur,0,1),[X0,Y0]=T2S(e.x0,e.y0),[X1,Y1]=T2S(e.x1,e.y1),a=p<.2?1:1-(p-.2)/.8;
      ctx.strokeStyle=`rgba(240,240,248,${a*.85})`;ctx.lineWidth=Math.max(1,pz*.7);
      if(p<.25){ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X0+(X1-X0)*p*4,Y0+(Y1-Y0)*p*4);ctx.stroke()}
      ctx.beginPath();for(let k=0;k<6;k++){const an=k*1.0472;ctx.moveTo(X1,Y1);ctx.lineTo(X1+Math.cos(an)*tz*.7,Y1+Math.sin(an)*tz*.5)}ctx.stroke();
      for(let r=1;r<=2;r++){ctx.beginPath();ctx.ellipse(X1,Y1,tz*.3*r,tz*.21*r,0,0,7);ctx.stroke()}
    }else if(e.type==='dust'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y-p*.9);
      ctx.fillStyle=`rgba(214,180,124,${(1-p)*.7})`;ctx.fillRect(Math.round(X),Math.round(Y),Math.ceil(pz*(2+p*2)),Math.ceil(pz*(2+p*2)));
    }else if(e.type==='dmg'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y-.9-p*.8);
      ctx.font='700 '+Math.round(Math.max(9*dpr,pz*(e.big?5.5:4.2)))+'px "Pixelify Sans", "Courier New", monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.globalAlpha=p<.6?1:1-(p-.6)/.4;ctx.lineWidth=Math.max(2,dpr*2);ctx.strokeStyle='rgba(20,8,8,.9)';ctx.strokeText(e.s,X,Y);
      ctx.fillStyle=e.big?'#ff6a4a':'#fff3b0';ctx.fillText(e.s,X,Y);ctx.globalAlpha=1;
    }else if(e.type==='spark'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y),sz=Math.max(1,Math.ceil(pz*1.2));
      ctx.fillStyle='rgba(255,'+(230-p*100|0)+',120,'+(1-p)+')';
      for(let k=0;k<e.n;k++){const a=e.a+k*6.28/e.n,r=tz*(.15+p*.55);ctx.fillRect(Math.round(X+Math.cos(a)*r),Math.round(Y+Math.sin(a)*r*.7),sz,sz)}
    }else if(e.type==='slash'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y);
      ctx.lineCap='round';ctx.strokeStyle='rgba(255,'+(245-p*40|0)+','+(200-p*120|0)+','+(1-p)+')';ctx.lineWidth=Math.max(2,pz*1.6*(1-p*.5));
      ctx.beginPath();ctx.arc(X,Y,tz*.55,e.a-.9+p*.5,e.a+.5+p*1.0);ctx.stroke();
    }else if(e.type==='smoke'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x+Math.sin(e.t/9)*.15+p*.4,e.y-p*1.6);
      ctx.fillStyle=`rgba(210,210,215,${(1-p)*.55})`;ctx.fillRect(Math.round(X),Math.round(Y),Math.ceil(pz*(2+p*2)),Math.ceil(pz*(2+p*2)));
    }else if(e.type==='wake'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y);
      ctx.strokeStyle=`rgba(230,245,255,${(1-p)*.6})`;ctx.lineWidth=Math.max(1,pz*.8);
      ctx.beginPath();ctx.ellipse(X,Y,Math.max(0,tz*(.3+p*.9)),Math.max(0,tz*(.12+p*.3)),0,0,7);ctx.stroke();
    }else if(e.type==='fish'){
      const p=e.t/e.dur,[X,Y]=T2S(e.x,e.y);
      ctx.strokeStyle=`rgba(230,245,255,${(1-p)*.7})`;ctx.lineWidth=Math.max(1,pz*.8);
      ctx.beginPath();ctx.ellipse(X,Y,Math.max(0,tz*(.2+p*.8)),Math.max(0,tz*(.08+p*.3)),0,0,7);ctx.stroke();
      if(p<.6){const q=p/.6,fx=X+(q-.5)*tz,fy=Y-Math.sin(q*Math.PI)*tz*.9;ctx.fillStyle='#c9d6de';ctx.fillRect(Math.round(fx),Math.round(fy),Math.ceil(pz*3),Math.ceil(pz*1.5))}
    }
  }
}
function updEffects(dt){
  const k=Math.max(0,dt)/16.7;
  for(const e of effects){const was=e.t;e.t+=k;if(e.type==='meteor'&&was<22&&e.t>=22){impact(e.x,e.y)}}
  effects=effects.filter(e=>e.t<e.dur);
  /* a flood of taps can never pile up effects without end */
  if(effects.length>600)effects.splice(0,effects.length-600);
}
/* spatial sound: only what's on screen is heard, louder the closer you zoom */
const GLOBAL_SFX=new Set(['horn','thunder','boom','rumble']);
function processSound(ox,oy,pz,vis,fireVis,dt){
  if(!AU.ready||!AU.sfx||speed===0){SFXQ.length=0;return}
  AU.tokens=Math.min(8,AU.tokens+dt/140);
  const tz=pz*TS,closeF=clamp((pz/dpr-.35)/1.5,0,1),now=performance.now();
  const place=(x,y)=>{const X=ox+x*tz,Y=oy+y*tz;if(X<-cw*.15||X>cw*1.15||Y<-ch*.15||Y>ch*1.15)return null;
    const d=Math.hypot(X-cw/2,Y-ch/2)/Math.hypot(cw/2,ch/2);return{v:(1-d*.55),p:(X/cw*2-1)*.75}};
  for(const e of SFXQ){
    if(AU.tokens<1)break;
    const key=e.t+(e.o||'');if((AU.cool[key]||0)>now)continue;
    let v,p;
    if(e.x==null||GLOBAL_SFX.has(e.t)){const pl=e.x==null?null:place(e.x,e.y);v=pl?.9:.45;p=pl?pl.p:0;if(e.t!=='horn'&&!pl&&e.x!=null)v=.3}
    else{const pl=place(e.x,e.y);if(!pl)continue;v=pl.v*(.25+closeF*.75);p=pl.p}
    if(e.t==='cry'){playAt('cry',v*.9,p,e.o)}else playAt(e.t,v,p,e.o);
    AU.tokens-=1;AU.cool[key]=now+(e.t==='clang'||e.t==='thud'?90:e.t==='chop'||e.t==='mine'?160:250);
  }
  SFXQ.length=0;
  if(fireVis&&RC()<.08*Math.min(3,fireVis/4))playAt('crackle',.3+closeF*.4,0);
  if(closeF>.15&&vis.length&&AU.tokens>=1&&RC()<.035*(dt/16.7)){
    const u=pick(vis),[x,y]=ipos(u),pl=place(x,y);
    if(pl&&(u.lastCall||0)<now){
      const night=light<.3;
      if(u.k===1){
        const ok=night?(u.sp==='wolf'||u.sp==='fox'||u.sp==='bear'||RC()<.15):(u.sp!=='wolf'||RC()<.3);
        if(ok){playAt('call',pl.v*closeF,pl.p,u.sp);u.lastCall=now+6000;AU.tokens--}
      }else if(!night||RC()<.25){playAt('speak',pl.v*closeF*.8,pl.p,{race:u.race,child:!adult(u)});u.lastCall=now+5000;AU.tokens--}
    }
  }
}

/* red arrows from every aggressor toward the kingdom it is attacking */
function drawWarArrows(ox,oy,pz){
  if(!wars.length)return;
  const tz=pz*TS,lw=Math.max(2.5*dpr,Math.min(7*dpr,tz*.5));
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(const w of wars){
    const A=tribes[w.a],B=tribes[w.b];if(!A||!B||!A.alive||!B.alive)continue;
    let x0=ox+(A.cx+.5)*tz,y0=oy+(A.cy+.5)*tz,x1=ox+(B.cx+.5)*tz,y1=oy+(B.cy+.5)*tz;
    const d=Math.hypot(x1-x0,y1-y0);if(d<tz*4)continue;
    const ux=(x1-x0)/d,uy=(y1-y0)/d,pad=Math.min(d*.2,tz*4);
    x0+=ux*pad;y0+=uy*pad;x1-=ux*pad;y1-=uy*pad;
    const bend=Math.min(d*.15,tz*10),mx=(x0+x1)/2-uy*bend,my=(y0+y1)/2+ux*bend;
    const tx=x1-mx,ty=y1-my,tl=Math.hypot(tx,ty)||1,hx=tx/tl,hy=ty/tl,hs=lw*3.2;
    const ex=x1-hx*hs*.6,ey=y1-hy*hs*.6;
    ctx.strokeStyle='rgba(60,0,0,.55)';ctx.lineWidth=lw+3*dpr;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
    ctx.strokeStyle='rgba(230,40,32,.92)';ctx.lineWidth=lw;ctx.setLineDash([lw*2.4,lw*1.4]);ctx.lineDashOffset=-frameN*.6;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(230,40,32,.95)';ctx.strokeStyle='rgba(60,0,0,.7)';ctx.lineWidth=1.5*dpr;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-hx*hs-hy*hs*.6,y1-hy*hs+hx*hs*.6);ctx.lineTo(x1-hx*hs+hy*hs*.6,y1-hy*hs-hx*hs*.6);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.restore();
}
/* tornadoes, black holes, thunderclouds and acid rain drawn where the simulation has them */
function drawWorldFx(ox,oy,pz,inView){
  if(!wfx.length)return;
  const tz=pz*TS;
  for(const f of wfx){
    if(f.type==='delay'||!inView(f.x,f.y))continue;
    const X=ox+f.x*tz,Y=oy+f.y*tz;
    if(f.type==='tornado'){
      for(let k=0;k<9;k++){
        const h=k/8,r=tz*(.35+h*1.5),yy=Y-h*tz*5,sw=Math.sin(frameN*.2+k)*tz*.35;
        ctx.strokeStyle=`rgba(${190-k*6},${190-k*6},${205-k*5},${.75-h*.35})`;ctx.lineWidth=Math.max(1.5,tz*.3);
        ctx.beginPath();ctx.ellipse(X+sw,yy,r,r*.32,0,0,7);ctx.stroke();
      }
      ctx.fillStyle='rgba(120,110,100,.5)';
      for(let k=0;k<6;k++){const a=frameN*.25+k*1.05,r=tz*(1+k%3*.4);ctx.fillRect(Math.round(X+Math.cos(a)*r),Math.round(Y-tz*.4+Math.sin(a)*r*.3),Math.ceil(pz*1.5),Math.ceil(pz*1.5))}
    }else if(f.type==='hole'){
      const r=tz*f.r,g=ctx.createRadialGradient(X,Y,0,X,Y,r);
      g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.25,'rgba(10,0,25,.95)');g.addColorStop(.6,'rgba(90,40,160,.35)');g.addColorStop(1,'rgba(90,40,160,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
      ctx.strokeStyle='rgba(210,160,255,.8)';ctx.lineWidth=Math.max(1.5,tz*.25);
      for(let k=0;k<3;k++){const a=-frameN*.08+k*2.1;ctx.beginPath();ctx.arc(X,Y,r*(.3+k*.18),a,a+1.6);ctx.stroke()}
    }else if(f.type==='storm'){
      const r=tz*f.r*1.1,g=ctx.createRadialGradient(X,Y,0,X,Y,r);
      g.addColorStop(0,'rgba(20,24,40,.45)');g.addColorStop(1,'rgba(20,24,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
    }else if(f.type==='acid'){
      const r=tz*f.r;ctx.fillStyle='rgba(140,230,60,.15)';ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
      ctx.strokeStyle='rgba(170,255,80,.75)';ctx.lineWidth=Math.max(1,pz*.6);ctx.beginPath();
      for(let k=0;k<40;k++){const a=hash(k,7)*6.28,d=Math.sqrt(hash(k,9))*r,yy=((frameN*6+k*37)%(tz*3));ctx.moveTo(X+Math.cos(a)*d,Y+Math.sin(a)*d*.6-tz*2+yy);ctx.lineTo(X+Math.cos(a)*d-pz,Y+Math.sin(a)*d*.6-tz*2+yy+tz*.5)}
      ctx.stroke();
    }else if(FXDRAW[f.type])FXDRAW[f.type](f,X,Y,tz,pz);
  }
}
