"use strict";
/* ============ Terrain: 8 px per tile, drawn into 32x32-tile chunks so edits stay cheap ============ */
const CHT=32,CCW=Math.ceil(W/CHT),CCH=Math.ceil(H/CHT);
const chunks=[];
for(let cy=0;cy<CCH;cy++)for(let cx=0;cx<CCW;cx++){
  const tw=Math.min(CHT,W-cx*CHT),th=Math.min(CHT,H-cy*CHT),c=document.createElement('canvas');
  c.width=tw*TS;c.height=th*TS;
  const x=c.getContext('2d'),img=x.createImageData(tw*TS,th*TS);
  /* dx0..dy1: the tiles changed since the last upload, so only that rectangle goes to the canvas */
  chunks.push({c,x,img,buf:new Uint32Array(img.data.buffer),x0:cx*CHT,y0:cy*CHT,tw,th,pw:tw*TS,dirty:false,dx0:CHT,dy0:CHT,dx1:-1,dy1:-1});
}
const tileFlag=new Uint8Array(N);let tileQ=[];
/* derived village layout (never saved, rebuilt from the buildings): dirt roads, and crop fields beside houses */
const road=new Uint8Array(N),fld=new Uint8Array(N),roadNew=new Uint8Array(N),fldNew=new Uint8Array(N);
let pnoise=null,frameN=0,curSea=1;
/* seasons repaint as a random dissolve (not a sweep), so a change of season creeps across the whole map at once */
const tq=new Uint8Array(N),perm=new Uint32Array(N);let permPtr=0;
for(let i=0;i<N;i++)perm[i]=i;
for(let i=N-1;i>0;i--){const j=(Math.random()*(i+1))|0,t=perm[i];perm[i]=perm[j];perm[j]=t}
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
const SEA_MUL=[[1.0,1.06,.97],[1.04,1.03,.9],[1.16,.93,.7],[.93,.98,1.02]];
const SEA_SNOW=[0,0,0,.55];
const paraCol=(ph)=>[128+120*Math.sin(ph),128+120*Math.sin(ph+2.1),128+120*Math.sin(ph+4.2)];
function pcol(h,dh,n,n2,lv,bt,lvn,bmi,tx,ty,dirt){
  if(lv)return lvn<.25?P(76,32,24):lvn<.72?P(232,92,26):P(255,172,54);
  let r,g,b;
  if(h<.30){const t=h<.14?0:h<.22?.5:1;r=24+t*10;g=72+t*26;b=140+t*30;if(n2<.022){r+=28;g+=36;b+=30}else if(n>.993){r-=10;g-=14;b-=8}return P(r,g,b)}
  if(h<.38){const t=h<.335?0:1;r=62+t*34;g=150+t*38;b=212+t*22;
    if(h>.367){if(n<.75)return P(204,232,238)}else if(n2<.04){r+=24;g+=26;b+=18}else if(n>.985){r-=14;g-=14;b-=8}
    if(curSea===3&&h>.34){const k=(h-.34)/.04*.7;r+=(228-r)*k;g+=(240-g)*k;b+=(250-b)*k}
    return P(r,g,b)}
  if(h<.42){r=238;g=224;b=168;if(n<.08){r=212;g=192;b=136}else if(n>.95){r=250;g=240;b=198}
    if(curSea===3){r+=(244-r)*.18;g+=(246-g)*.18;b+=(250-b)*.18}}
  else if(h<.62){const t=(h-.42)/.2;r=100-t*26;g=184-t*32;b=72-t*14;
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
    if(dirt){const a=Math.min(.8,dirt*(.4+n*.45));r+=(150-r)*a;g+=(116-g)*a;b+=(78-b)*a}
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
/* small details scattered over open ground: grass tufts, bushes, boulders, shells */
function decorTile(buf,pw,lx,ly,tx,ty,bmi,b0){
  if(b0===2){
    if(hash(tx*5+1,ty*9+2)<.09){const px=1+((hash(tx,ty+4)*6)|0),py=1+((hash(tx+4,ty)*6)|0);buf[(ly+py)*pw+lx+px]=hash(tx,ty)<.5?P(252,244,236):P(238,178,176)}
    return;
  }
  const B=bmi?BIOMES[bmi]:null;let base=B&&B.c?B.c:(b0===4?[84,128,60]:[96,160,66]);
  if(bmi===BM.PARA)return;
  const m=SEA_MUL[curSea];base=[base[0]*m[0],base[1]*m[1],base[2]*m[2]];
  const snow=curSea===3;
  if(snow)base=[196,208,222];
  const dark=P(base[0]*.62,base[1]*.7,base[2]*.62),light=P(base[0]*1.18+8,base[1]*1.2+8,base[2]*1.1+8),mid=P(base[0]*.82,base[1]*.88,base[2]*.78);
  const n=snow?0:1+((hash(tx*3,ty*7)*3)|0);
  for(let k=0;k<n;k++){
    const px=1+((hash(tx+k*31,ty)*6)|0),py=2+((hash(tx,ty+k*17)*5)|0);
    buf[(ly+py)*pw+lx+px]=dark;buf[(ly+py-1)*pw+lx+px-1]=light;buf[(ly+py-1)*pw+lx+px+1]=light;
  }
  const h=hash(tx*13+5,ty*11+9);
  if(h<.04&&bmi!==BM.WASTE&&bmi!==BM.ROCK){
    const px=1+((hash(tx+7,ty)*3)|0),py=2+((hash(tx,ty+7)*3)|0),lo=P(base[0]*.5,base[1]*.58,base[2]*.5);
    for(let x=1;x<3;x++)buf[(ly+py)*pw+lx+px+x]=light;
    for(let x=0;x<4;x++){buf[(ly+py+1)*pw+lx+px+x]=mid;buf[(ly+py+2)*pw+lx+px+x]=x===0||x===3?lo:dark}
    buf[(ly+py+1)*pw+lx+px+1]=light;
    if(!snow&&!bmi&&hash(tx,ty+3)<.3)buf[(ly+py+1)*pw+lx+px+3]=P(220,60,60);
  }else if(h>.975&&(b0===4||bmi===BM.ROCK||bmi===BM.WASTE)){
    const px=1+((hash(tx+2,ty)*4)|0),py=3+((hash(tx,ty+2)*3)|0);
    for(let x=0;x<3;x++){buf[(ly+py)*pw+lx+px+x]=P(138,134,130);buf[(ly+py+1)*pw+lx+px+x]=P(92,88,86)}
    buf[(ly+py)*pw+lx+px]=P(184,180,172);
  }
}
function bmAt(fx,fy,px,py){
  const q=((py>>1)<<1)*OW+((px>>1)<<1),a=pnoise[q]/255,b=pnoise[(q+524287)%pnoise.length]/255;
  const X=clamp((fx+.5+(a-.5)*.95)|0,0,W-1),Y=clamp((fy+.5+(b-.5)*.95)|0,0,H-1);
  return bm[Y*W+X];
}
function renderTile(i){
  const tx=i%W,ty=(i/W)|0,ch=chunks[((ty/CHT)|0)*CCW+((tx/CHT)|0)],buf=ch.buf,pw=ch.pw;
  const lx=(tx-ch.x0)*TS,ly=(ty-ch.y0)*TS;
  const lv=lava[i]>0,bt=burnt[i]>step?Math.min(1,(burnt[i]-step)/600)*.8:0,lt=frameN>>3,bmi=bm[i];
  let dirt=0;
  if(bld[i]!==-1)dirt=1;
  else for(let k=0;k<8;k++){const X=tx+N8[k][0],Y=ty+N8[k][1];if(X>=0&&Y>=0&&X<W&&Y<H&&bld[Y*W+X]!==-1){dirt=.55;break}}
  /* biome borders are ragged and organic rather than square: near an edge each pixel borrows a neighbour's biome */
  const edge=(tx>0&&bm[i-1]!==bmi)||(tx<W-1&&bm[i+1]!==bmi)||(ty>0&&bm[i-W]!==bmi)||(ty<H-1&&bm[i+W]!==bmi);
  for(let sy=0;sy<TS;sy++){
    const py=ty*TS+sy,fy=ty+(sy+.5)/TS-.5,row=py*OW;
    let o=(ly+sy)*pw+lx;
    for(let sx=0;sx<TS;sx++,o++){
      const px=tx*TS+sx,fx=tx+(sx+.5)/TS-.5,n=pnoise[row+px]/255,n2=pnoise[(row+px+524287)%pnoise.length]/255;
      const hb=hAt(fx,fy);
      buf[o]=pcol(hb+(n-.5)*.01,hb-hAt(fx-.35,fy-.35),n,n2,lv,bt,lv?hash(px>>1,(py>>1)+lt):0,edge?bmAt(fx,fy,px,py):bmi,tx,ty,dirt);
    }
  }
  tq[i]=curSea;
  if(!lv&&!tree[i]&&!ore[i]&&bld[i]===-1&&!bt&&!road[i]&&!fld[i]){const b0=bio(hgt[i]);if(b0>=2&&b0<=4)decorTile(buf,pw,lx,ly,tx,ty,bmi,b0)}
  if((road[i]||fld[i])&&!lv&&!bt&&hgt[i]>=.38)paintVillage(buf,pw,lx,ly,tx,ty,i);
  if(ore[i]&&!lv)drawOre(buf,pw,lx,ly,ore[i],tx,ty);
  if(tree[i]&&!lv){
    const kind=treeKind(i),T=TREES[kind],rows=T.rows,v=.86+hash(tx,ty+999)*.26,pal=treePal(kind,v,tx,ty,bmi);
    /* each tree is nudged and sometimes mirrored, so a forest never looks like a grid */
    const jx=((hash(tx+3,ty)*3)|0)-1,jy=-((hash(tx,ty+3)*2)|0),fl=hash(tx+9,ty+9)<.5;
    for(let y=0;y<8;y++){const r=rows[y],Y=y+jy;if(Y<0||Y>7)continue;for(let x=0;x<8;x++){const c=r[fl?7-x:x],X=x+jx;if(X<0||X>7)continue;if(c!=='.'&&pal[c]!==undefined)buf[(ly+Y)*pw+lx+X]=pal[c]}}
  }
  ch.dirty=true;
  const cx=tx-ch.x0,cy=ty-ch.y0;
  if(cx<ch.dx0)ch.dx0=cx;if(cx>ch.dx1)ch.dx1=cx;if(cy<ch.dy0)ch.dy0=cy;if(cy>ch.dy1)ch.dy1=cy;
}
function uploadChunk(ch){
  ch.x.putImageData(ch.img,0,0,ch.dx0*TS,ch.dy0*TS,(ch.dx1-ch.dx0+1)*TS,(ch.dy1-ch.dy0+1)*TS);
  ch.dirty=false;ch.dx0=ch.dy0=CHT;ch.dx1=ch.dy1=-1;
}
function initTerrain(){
  computeRoads();
  pnoise=new Uint8Array(OW*OH);
  for(let i=0;i<pnoise.length;i++){const x=i%OW,y=(i/OW)|0;pnoise[i]=(hash(x,y)*255)|0}
  tileFlag.fill(0);tileQ=[];
  curSea=season();
  for(let i=0;i<N;i++)renderTile(i);
  for(const ch of chunks)uploadChunk(ch);
}
/* terrain work per frame is held to a time budget: edits first, then the season dissolve, so 9x stays smooth */
const TERRAIN_MS=4;
function updateTerrain(){
  if(frameN%6===0)for(const i of lavas)markTile(i);
  /* paradox ground and trees shimmer through every colour */
  if(frameN%9===0)for(let i=0;i<N;i++)if(bm[i]===BM.PARA)markTile(i);
  curSea=season();
  const t0=performance.now();
  let n=0;
  while(tileQ.length&&n<1100){
    const i=tileQ.pop();tileFlag[i]=0;renderTile(i);n++;
    if((n&31)===0&&performance.now()-t0>TERRAIN_MS)break;
  }
  let scan=0,fresh=0;
  while(scan<3000&&fresh<420){
    const i=perm[permPtr];permPtr=permPtr+1===N?0:permPtr+1;scan++;
    if(tq[i]!==curSea&&!tileFlag[i]){renderTile(i);fresh++;if((fresh&31)===0&&performance.now()-t0>TERRAIN_MS)break}
  }
  /* uploads are the costly part: at most CHUNK_UPLOADS a frame, taken in turn, so a season sweep never floods the GPU */
  for(let k=0,up=0;k<chunks.length&&up<CHUNK_UPLOADS;k++){
    const ch=chunks[upPtr];upPtr=(upPtr+1)%chunks.length;
    if(ch.dirty){uploadChunk(ch);up++}
  }
}
const CHUNK_UPLOADS=6;let upPtr=0;

/* roads and fields are painted over the ground: roads have ragged edges where they meet grass, fields are furrowed rows that follow the seasons */
function paintVillage(buf,pw,lx,ly,tx,ty,i){
  if(fld[i]){
    const v=fld[i],vert=v===2,sea=curSea;
    for(let sy=0;sy<TS;sy++)for(let sx=0;sx<TS;sx++){
      const n=pnoise[(ty*TS+sy)*OW+tx*TS+sx]/255,q=vert?sx:sy,furrow=(q&1)===0;let c;
      if(sx===0&&(tx===0||fld[i-1]!==v)||sy===0&&(ty===0||fld[i-W]!==v)||sx===TS-1&&(tx===W-1||fld[i+1]!==v)||sy===TS-1&&(ty===H-1||fld[i+W]!==v))c=P(112,78,48);
      else if(sea===3)c=furrow?P(170,150,138):(n<.3?P(226,232,242):P(240,244,250));
      else if(furrow)c=P(122,86,54);
      else if(sea===0)c=n<.4?P(110,186,64):P(150,214,92);
      else if(sea===1)c=n<.4?P(232,190,62):P(250,222,104);
      else c=n<.5?P(188,148,82):P(210,170,102);
      buf[(ly+sy)*pw+lx+sx]=c;
    }
    return;
  }
  const conn=j=>road[j]||bld[j]!==-1,L=tx>0&&conn(i-1),Rr=tx<W-1&&conn(i+1),U=ty>0&&conn(i-W),D=ty<H-1&&conn(i+W);
  for(let sy=0;sy<TS;sy++)for(let sx=0;sx<TS;sx++){
    const n=pnoise[(ty*TS+sy)*OW+tx*TS+sx]/255;
    if(((sx===0&&!L)||(sx===TS-1&&!Rr)||(sy===0&&!U)||(sy===TS-1&&!D))&&n<.55)continue;
    let c=n<.22?P(166,128,86):n>.9?P(226,196,146):P(198,164,114);
    if(curSea===3&&n>.35)c=P(222,224,230);
    buf[(ly+sy)*pw+lx+sx]=c;
  }
}
/* the village plan: every house is joined by a dirt path to its village centre, villages to the capital,
   and farming peoples get a 2x2 crop field beside some houses. Pure function of the buildings, so saves need nothing */
function computeRoads(){
  roadNew.fill(0);fldNew.fill(0);
  const mark=(x,y)=>{if(!inb(x,y))return false;const j=y*W+x;if(hgt[j]<.38||lava[j])return false;if(bld[j]===-1&&!ore[j])roadNew[j]=1;return true};
  const walk=(x0,y0,x1,y1,hf)=>{
    let x=x0,y=y0;
    if(hf){while(x!==x1){if(!mark(x,y))return;x+=x<x1?1:-1}while(y!==y1){if(!mark(x,y))return;y+=y<y1?1:-1}}
    else{while(y!==y1){if(!mark(x,y))return;y+=y<y1?1:-1}while(x!==x1){if(!mark(x,y))return;x+=x<x1?1:-1}}
    mark(x,y);
  };
  for(const T of tribes){
    if(!T.alive||!T.towns.length)continue;
    const c0=T.towns[0];
    for(let k=1;k<T.towns.length;k++){
      const H=T.towns[k];if(!H.houses)continue;
      if(Math.abs(H.x-c0.x)+Math.abs(H.y-c0.y)<=60)walk(H.x,H.y,c0.x,c0.y,k&1);
    }
  }
  for(let i=0;i<N;i++){
    const o=bld[i];if(o<0||btype[i]>=3)continue;
    const T=tribes[o];if(!T||!T.alive||!T.towns.length)continue;
    const bx=i%W,by=(i/W)|0,H=T.towns[nearestTown(T,bx,by)];
    if(Math.abs(H.x-bx)+Math.abs(H.y-by)<=16)walk(bx,by+1,H.x,H.y,hash(bx,by+13)<.5);
  }
  for(let i=0;i<N;i++){
    const o=bld[i];if(o<0||btype[i]!==0)continue;
    const T=tribes[o];if(!T||!T.alive)continue;
    const rb=RB(T.race);if(rb!=='human'&&rb!=='elf')continue;
    const bx=i%W,by=(i/W)|0;if(hash(bx+3,by+5)>.9)continue;
    const s0=(hash(bx+5,by+9)*8)|0;
    for(let c=0;c<8;c++){
      const [dx,dy]=FIELD_OFF[(s0+c)&7],fx=bx+dx,fy=by+dy;let ok=true;
      for(let yy=0;yy<2&&ok;yy++)for(let xx=0;xx<2;xx++){
        const X=fx+xx,Y=fy+yy;if(!inb(X,Y)){ok=false;break}
        const j=Y*W+X;
        if(bio(hgt[j])!==3||tree[j]||ore[j]||bld[j]!==-1||roadNew[j]||fldNew[j]||fire[j]||lava[j]){ok=false;break}
      }
      if(!ok)continue;
      const v=1+((hash(fx,fy)*2)|0);
      for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++)fldNew[(fy+yy)*W+fx+xx]=v;
      break;
    }
  }
  for(let i=0;i<N;i++){
    if(road[i]!==roadNew[i]||fld[i]!==fldNew[i]){road[i]=roadNew[i];fld[i]=fldNew[i];markDirty(i)}
  }
}
const FIELD_OFF=[[2,-1],[-3,0],[-3,-2],[2,1],[0,2],[0,-3],[-1,2],[3,-1]];
