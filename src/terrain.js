"use strict";
/* ============ Terrain: 8 px per tile, drawn into 32x32-tile chunks so edits stay cheap ============ */
const CHT=32,CCW=Math.ceil(W/CHT),CCH=Math.ceil(H/CHT);
const chunks=[];
for(let cy=0;cy<CCH;cy++)for(let cx=0;cx<CCW;cx++){
  const tw=Math.min(CHT,W-cx*CHT),th=Math.min(CHT,H-cy*CHT),c=document.createElement('canvas');
  c.width=tw*TS;c.height=th*TS;
  const x=c.getContext('2d'),img=x.createImageData(tw*TS,th*TS);
  chunks.push({c,x,img,buf:new Uint32Array(img.data.buffer),x0:cx*CHT,y0:cy*CHT,tw,th,pw:tw*TS,dirty:false});
}
const tileFlag=new Uint8Array(N);let tileQ=[];
let pnoise=null,frameN=0;
const cl=v=>v<0?0:v>255?255:v|0;
const P=(r,g,b)=>(0xff000000|(cl(b)<<16)|(cl(g)<<8)|cl(r))>>>0;
function markTile(i){if(!tileFlag[i]){tileFlag[i]=1;tileQ.push(i)}}
function markDirty(i){const x=i%W,y=(i/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(inb(X,Y))markTile(Y*W+X)}}
function hAt(fx,fy){
  if(fx<0)fx=0;else if(fx>W-1)fx=W-1;
  if(fy<0)fy=0;else if(fy>H-1)fy=H-1;
  const x0=fx|0,y0=fy|0,x1=x0<W-1?x0+1:x0,y1=y0<H-1?y0+1:y0,tx=fx-x0,ty=fy-y0;
  const a=hgt[y0*W+x0],b=hgt[y0*W+x1],c=hgt[y1*W+x0],d=hgt[y1*W+x1];
  return (a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
}
function pcol(h,dh,n,n2,lv,bt,lvn){
  if(lv)return lvn<.25?P(76,32,24):lvn<.72?P(232,92,26):P(255,172,54);
  let r,g,b;
  if(h<.30){const t=Math.max(0,h)/.30;r=18+t*16;g=48+t*40;b=104+t*48;if(n2<.018){r+=22;g+=28;b+=28}return P(r,g,b)}
  if(h<.38){const t=(h-.30)/.08;r=40+t*44;g=114+t*52;b=172+t*26;
    if(h>.367){if(n<.75)return P(204,232,238)}else if(n2<.03){r+=20;g+=24;b+=20}
    return P(r,g,b)}
  if(h<.42){r=226;g=210;b=152;if(n<.08){r=204;g=184;b=128}else if(n>.95){r=242;g=230;b=184}}
  else if(h<.62){const t=(h-.42)/.2;r=108-t*28;g=178-t*32;b=78-t*16;
    if(n<.35){r*=.92;g*=.93;b*=.92}
    if(n>.988){if(n2<.33){r=250;g=236;b=110}else if(n2<.66){r=250;g=250;b=246}else{r=236;g=140;b=186}}
    else if(n>.955){r*=.76;g*=.82;b*=.76}}
  else if(h<.74){const t=(h-.62)/.12;r=86+t*38;g=138-t*14;b=64+t*24;
    if(n<.3){r*=.92;g*=.92;b*=.92}else if(n>.975){r=122;g=112;b=96}}
  else if(h<.86){const t=(h-.74)/.12;r=124+t*36;g=118+t*36;b=112+t*38;
    if(n<.12){r*=.8;g*=.8;b*=.8}else if(n>.94){r*=1.12;g*=1.12;b*=1.12}}
  else{r=238;g=242;b=250;if(n<.2){r=216;g=226;b=242}}
  const s=dh*14+1,sc=s<.72?.72:s>1.3?1.3:s;
  r*=sc;g*=sc;b*=sc;
  if(bt>0&&h<.74){r=r*(1-bt)+58*bt;g=g*(1-bt)+52*bt;b=b*(1-bt)+48*bt;if(n<.008){r=220;g=96;b=34}}
  return P(r,g,b);
}
const TREE_OAK=["..DDDD..",".DllvlD.","DllvvllD","DlllllvD","DllllllD",".DDllDD.","...WW...","...WW..."];
const TREE_PINE=["...DD...","...lD...","..DlvD..","..llDD..",".DlvlDD.",".lllllD.","DDllllDD","...WW..."];
function renderTile(i){
  const tx=i%W,ty=(i/W)|0,ch=chunks[((ty/CHT)|0)*CCW+((tx/CHT)|0)],buf=ch.buf,pw=ch.pw;
  const lx=(tx-ch.x0)*TS,ly=(ty-ch.y0)*TS;
  const lv=lava[i]>0,bt=burnt[i]>step?Math.min(1,(burnt[i]-step)/600)*.8:0,lt=frameN>>3;
  for(let sy=0;sy<TS;sy++){
    const py=ty*TS+sy,fy=ty+(sy+.5)/TS-.5,row=py*OW;
    let o=(ly+sy)*pw+lx;
    for(let sx=0;sx<TS;sx++,o++){
      const px=tx*TS+sx,fx=tx+(sx+.5)/TS-.5,n=pnoise[row+px]/255,n2=pnoise[(row+px+524287)%pnoise.length]/255;
      const hb=hAt(fx,fy);
      buf[o]=pcol(hb+(n-.5)*.01,hb-hAt(fx-.35,fy-.35),n,n2,lv,bt,lv?hash(px>>1,(py>>1)+lt):0);
    }
  }
  if(tree[i]&&!lv){
    const pine=bio(hgt[i])===4,rows=pine?TREE_PINE:TREE_OAK,v=.86+hash(tx,ty+999)*.26;
    const pal=pine?{D:P(26*v,72*v,48*v),l:P(44*v,110*v,64*v),v:P(72*v,144*v,82*v),W:P(96,64,40)}
                  :{D:P(34*v,92*v,44*v),l:P(60*v,136*v,58*v),v:P(98*v,172*v,74*v),W:P(104,70,42)};
    for(let y=0;y<8;y++){const r=rows[y];for(let x=0;x<8;x++){const c=r[x];if(c!=='.')buf[(ly+y)*pw+lx+x]=pal[c]}}
  }
  ch.dirty=true;
}
function initTerrain(){
  pnoise=new Uint8Array(OW*OH);
  for(let i=0;i<pnoise.length;i++){const x=i%OW,y=(i/OW)|0;pnoise[i]=(hash(x,y)*255)|0}
  tileFlag.fill(0);tileQ=[];
  for(let i=0;i<N;i++)renderTile(i);
  for(const ch of chunks){ch.x.putImageData(ch.img,0,0);ch.dirty=false}
}
function updateTerrain(){
  if(frameN%6===0)for(const i of lavas)markTile(i);
  let n=0;const budget=1100;
  while(tileQ.length&&n<budget){
    const i=tileQ.pop();tileFlag[i]=0;renderTile(i);n++;
  }
  for(const ch of chunks)if(ch.dirty){ch.x.putImageData(ch.img,0,0);ch.dirty=false}
}
