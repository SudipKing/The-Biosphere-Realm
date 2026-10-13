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
let pnoise=null,frameN=0,curSea=1,seaDone=-1;
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
/* seasons: r,g,b multipliers for land, and how much snow lies on it */
const SEA_MUL=[[1.0,1.07,.96],[1.07,1.04,.85],[1.3,.88,.55],[.92,.97,1.02]];
const SEA_SNOW=[0,0,0,.6];
const paraCol=(ph)=>[128+120*Math.sin(ph),128+120*Math.sin(ph+2.1),128+120*Math.sin(ph+4.2)];
function pcol(h,dh,n,n2,lv,bt,lvn,bmi,tx,ty){
  if(lv)return lvn<.25?P(76,32,24):lvn<.72?P(232,92,26):P(255,172,54);
  let r,g,b;
  if(h<.30){const t=Math.max(0,h)/.30;r=18+t*16;g=48+t*40;b=104+t*48;if(n2<.018){r+=22;g+=28;b+=28}return P(r,g,b)}
  if(h<.38){const t=(h-.30)/.08;r=40+t*44;g=114+t*52;b=172+t*26;
    if(h>.367){if(n<.75)return P(204,232,238)}else if(n2<.03){r+=20;g+=24;b+=20}
    if(curSea===3&&h>.34){const k=(h-.34)/.04*.7;r+=(228-r)*k;g+=(240-g)*k;b+=(250-b)*k}
    return P(r,g,b)}
  if(h<.42){r=226;g=210;b=152;if(n<.08){r=204;g=184;b=128}else if(n>.95){r=242;g=230;b=184}
    if(curSea===3){r+=(244-r)*.18;g+=(246-g)*.18;b+=(250-b)*.18}}
  else if(h<.62){const t=(h-.42)/.2;r=108-t*28;g=178-t*32;b=78-t*16;
    if(n<.35){r*=.92;g*=.93;b*=.92}
    if(n>.988){if(n2<.33){r=250;g=236;b=110}else if(n2<.66){r=250;g=250;b=246}else{r=236;g=140;b=186}}
    else if(n>.955){r*=.76;g*=.82;b*=.76}}
  else if(h<.74){const t=(h-.62)/.12;r=86+t*38;g=138-t*14;b=64+t*24;
    if(n<.3){r*=.92;g*=.92;b*=.92}else if(n>.975){r=122;g=112;b=96}}
  else if(h<.86){const t=(h-.74)/.12;r=124+t*36;g=118+t*36;b=112+t*38;
    if(n<.12){r*=.8;g*=.8;b*=.8}else if(n>.94){r*=1.12;g*=1.12;b*=1.12}}
  else{r=238;g=242;b=250;if(n<.2){r=216;g=226;b=242}}
  if(h>=.42&&h<.74){
    if(bmi){
      const B=BIOMES[bmi],c=bmi===BM.PARA?paraCol(frameN*.012+(tx+ty)*.14):B.c,k=(r+g+b)/363;
      r=c[0]*(.78+k*.22)*(n<.35?.93:1);g=c[1]*(.78+k*.22)*(n<.35?.93:1);b=c[2]*(.78+k*.22)*(n<.35?.93:1);
      const th=bmi===BM.FLOWER?.9:bmi===BM.CRYS||bmi===BM.CANDY?.95:.965;
      if(n>th&&B.sp){const s=bmi===BM.PARA?[255,255,255]:B.sp[(n2*B.sp.length)|0];r=s[0];g=s[1];b=s[2]}
    }
    const m=SEA_MUL[curSea];r*=m[0];g*=m[1];b*=m[2];
    const sn=SEA_SNOW[curSea];if(sn){const a=sn*(.55+n2*.5>1?1:.55+n2*.5);r+=(238-r)*a;g+=(244-g)*a;b+=(252-b)*a}
  }
  const s=dh*14+1,sc=s<.72?.72:s>1.3?1.3:s;
  r*=sc;g*=sc;b*=sc;
  if(bt>0&&h<.74){r=r*(1-bt)+58*bt;g=g*(1-bt)+52*bt;b=b*(1-bt)+48*bt;if(n<.008){r=220;g=96;b=34}}
  return P(r,g,b);
}

/* ---------- trees: every biome grows its own ---------- */
const TREE_OAK=["..DDDD..",".DllvlD.","DllvvllD","DlllllvD","DllllllD",".DDllDD.","...WW...","...WW..."];
const TREE_PINE=["...DD...","...lD...","..DlvD..","..llDD..",".DlvlDD.",".lllllD.","DDllllDD","...WW..."];
const TREE_ACACIA=["DDDDDDDD","DllvvllD",".DDllDD.","...W....","...W....","..WW....","..W.....","..W....."];
const TREE_BIRCH=["..lvl...",".lvvvl..","lvvlvvl.",".lvvvl..","..lvl...","...W....","...Wk...","...W...."];
const TREE_JUNGLE=["DDDDDDDD","DlllvllD","DlvllvlD","DllvllvD",".DlllDD.","..DWWD..","...WW...","...WW..."];
const TREE_CRYSTAL=["...cc...","..cvvc..","..cvvc..",".cvvvvc.",".cvvvvc.","cvvdvvvc","..cddc..","...dd..."];
const TREE_CANDY=["..lvvl..",".lvDlvl.","lvlDDvlv",".lvDlvl.","..lvvl..","...W....","...W....","...W...."];
const TREE_LEMON=["..DDDD..",".DllylD.","DlylllyD","DllylllD","DylllylD",".DDllDD.","...WW...","...WW..."];
const TREE_FLOWER=["..DDDD..",".DpplpD.","DpplppvD","DpvppplD","DppppvpD",".DDppDD.","...WW...","...WW..."];
const TREE_CLOVER=["........",".ll..ll.","lvllllvl","llllllll",".lllvll.","..llll..","...W....","...W...."];
const TREE_DEAD=[".W..W...","..W.W...","W..WW.W.","W.WWW.W.","..WWW.W.","...WW...","...WW...","...WW..."];
const TREE_CORRUPT=["W..W..W.",".WWWWWW.","W.WpWW.W","..WWW.W.",".WpWW...","..WWW...","..WW....","..WW...."];
const TREE_STUNT=["........","........","...DD...","..DlvD..",".DlvlDD.",".lllllD.","...WW...","...WW..."];
/* palettes are raw rgb; dec = deciduous (turns orange in autumn, bare and frosted in winter) */
const TREES={
  oak:{rows:TREE_OAK,dec:1,pal:{D:[34,92,44],l:[60,136,58],v:[98,172,74],W:[104,70,42]}},
  pine:{rows:TREE_PINE,pal:{D:[26,72,48],l:[44,110,64],v:[72,144,82],W:[96,64,40]}},
  forest:{rows:TREE_PINE,pal:{D:[22,64,38],l:[36,98,52],v:[60,130,66],W:[86,58,36]}},
  acacia:{rows:TREE_ACACIA,dec:1,pal:{D:[96,120,48],l:[134,158,60],v:[176,190,84],W:[122,90,52]}},
  birch:{rows:TREE_BIRCH,dec:1,pal:{l:[132,188,86],v:[184,224,120],W:[238,236,226],k:[50,46,44]}},
  jungle:{rows:TREE_JUNGLE,pal:{D:[10,66,34],l:[20,110,52],v:[48,160,70],W:[92,64,40]}},
  crystal:{rows:TREE_CRYSTAL,pal:{c:[120,150,230],v:[170,224,255],d:[96,86,190]},glow:1},
  candy:{rows:TREE_CANDY,dec:0,pal:{l:[255,150,196],v:[255,206,226],D:[236,96,160],W:[250,250,250]}},
  lemon:{rows:TREE_LEMON,dec:1,pal:{D:[60,118,40],l:[96,160,50],y:[255,224,52],W:[110,76,44]}},
  flower:{rows:TREE_FLOWER,dec:1,pal:{D:[168,72,116],p:[240,140,186],l:[252,176,208],v:[255,218,236],W:[104,70,42]}},
  clover:{rows:TREE_CLOVER,pal:{l:[56,170,70],v:[130,216,110],W:[88,120,56]}},
  dead:{rows:TREE_DEAD,pal:{W:[96,84,72]}},
  corrupt:{rows:TREE_CORRUPT,pal:{W:[64,38,82],p:[220,70,230]},glow:1},
  stunt:{rows:TREE_STUNT,pal:{D:[60,84,60],l:[88,112,80],v:[116,140,98],W:[96,80,60]}},
};
const PARA_KINDS=['oak','acacia','birch','jungle','crystal','candy','lemon','flower','clover'];
const BM_TREE=[null,'forest','acacia','birch','stunt','jungle','crystal','candy','dead','lemon','flower','clover',null,'corrupt'];
const AUT={D:[140,64,26],l:[208,108,34],v:[240,164,56],y:[255,224,52],p:[240,140,186]};
const WIN={D:[150,166,184],l:[214,224,236],v:[246,248,252],y:[240,244,250],p:[236,226,240]};
function treeKind(i){
  const b=bm[i];
  if(b===BM.PARA)return PARA_KINDS[(hash(i%W,(i/W|0)+31)*PARA_KINDS.length)|0];
  if(b&&BM_TREE[b])return BM_TREE[b];
  return bio(hgt[i])===4?'pine':'oak';
}
function treePal(kind,v,tx,ty,bmi){
  const T=TREES[kind],out={};
  for(const k in T.pal){
    let c=T.pal[k];
    if(T.dec&&k!=='W'&&k!=='k'){
      if(curSea===2&&AUT[k])c=AUT[k];
      else if(curSea===3&&WIN[k])c=WIN[k];
    }else if(!T.dec&&curSea===3&&(k==='v'||k==='l')&&!T.glow&&kind!=='candy'&&kind!=='dead'){const a=k==='v'?.75:.4;c=[c[0]+(240-c[0])*a,c[1]+(246-c[1])*a,c[2]+(252-c[2])*a]}
    if(bmi===BM.PARA){const q=paraCol(frameN*.012+(tx+ty)*.14+k.charCodeAt(0)*.5);c=[q[0]*.85,q[1]*.85,q[2]*.85]}
    out[k]=P(c[0]*v,c[1]*v,c[2]*v);
  }
  return out;
}
function drawOre(buf,pw,lx,ly,o,tx,ty){
  const O=ORES[o],c=O.c,hi=O.hi,dk=sh(c,.55);
  const C=P(c[0],c[1],c[2]),H=P(hi[0],hi[1],hi[2]),D=P(dk[0],dk[1],dk[2]);
  const n=o===ORE.STONE?4:6;
  for(let k=0;k<n;k++){
    const px=1+((hash(tx*13+k,ty*7+o)*5)|0),py=1+((hash(tx*5+o,ty*11+k)*5)|0),big=o===ORE.STONE||o===ORE.COAL;
    const w=big?2:1,h=big?2:2;
    for(let y=0;y<h;y++)for(let x=0;x<w+1;x++){const q=(ly+py+y)*pw+lx+px+x;buf[q]=C}
    buf[(ly+py)*pw+lx+px]=H;buf[(ly+py+h)*pw+lx+px+1]=D;
    if(o===ORE.GEMS||o===ORE.SILVER||o===ORE.GOLD)buf[(ly+py-1)*pw+lx+px+1]=H;
  }
}
function renderTile(i){
  const tx=i%W,ty=(i/W)|0,ch=chunks[((ty/CHT)|0)*CCW+((tx/CHT)|0)],buf=ch.buf,pw=ch.pw;
  const lx=(tx-ch.x0)*TS,ly=(ty-ch.y0)*TS;
  const lv=lava[i]>0,bt=burnt[i]>step?Math.min(1,(burnt[i]-step)/600)*.8:0,lt=frameN>>3,bmi=bm[i];
  for(let sy=0;sy<TS;sy++){
    const py=ty*TS+sy,fy=ty+(sy+.5)/TS-.5,row=py*OW;
    let o=(ly+sy)*pw+lx;
    for(let sx=0;sx<TS;sx++,o++){
      const px=tx*TS+sx,fx=tx+(sx+.5)/TS-.5,n=pnoise[row+px]/255,n2=pnoise[(row+px+524287)%pnoise.length]/255;
      const hb=hAt(fx,fy);
      buf[o]=pcol(hb+(n-.5)*.01,hb-hAt(fx-.35,fy-.35),n,n2,lv,bt,lv?hash(px>>1,(py>>1)+lt):0,bmi,tx,ty);
    }
  }
  if(ore[i]&&!lv)drawOre(buf,pw,lx,ly,ore[i],tx,ty);
  if(tree[i]&&!lv){
    const kind=treeKind(i),T=TREES[kind],rows=T.rows,v=.86+hash(tx,ty+999)*.26,pal=treePal(kind,v,tx,ty,bmi);
    for(let y=0;y<8;y++){const r=rows[y];for(let x=0;x<8;x++){const c=r[x];if(c!=='.'&&pal[c]!==undefined)buf[(ly+y)*pw+lx+x]=pal[c]}}
  }
  ch.dirty=true;
}
function initTerrain(){
  pnoise=new Uint8Array(OW*OH);
  for(let i=0;i<pnoise.length;i++){const x=i%OW,y=(i/OW)|0;pnoise[i]=(hash(x,y)*255)|0}
  tileFlag.fill(0);tileQ=[];
  curSea=seaDone=season();
  for(let i=0;i<N;i++)renderTile(i);
  for(const ch of chunks){ch.x.putImageData(ch.img,0,0);ch.dirty=false}
}
function updateTerrain(){
  if(frameN%6===0)for(const i of lavas)markTile(i);
  /* paradox ground and trees shimmer through every colour */
  if(frameN%9===0)for(let i=0;i<N;i++)if(bm[i]===BM.PARA)markTile(i);
  const s=season();
  if(s!==seaDone&&!tileQ.length){seaDone=s;curSea=s;for(let i=0;i<N;i++)markTile(i)}
  let n=0;const budget=1100;
  while(tileQ.length&&n<budget){
    const i=tileQ.pop();tileFlag[i]=0;renderTile(i);n++;
  }
  for(const ch of chunks)if(ch.dirty){ch.x.putImageData(ch.img,0,0);ch.dirty=false}
}
