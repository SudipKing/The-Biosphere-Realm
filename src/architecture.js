"use strict";
/* ============ Architecture: buildings and boats for every race and era ============ */
/* ---------- buildings ---------- */
function bHuman(type,k,dom){
  const kd=sh(k,.7),kl=sh(k,1.2);let g;
  if(type===0){
    g=G(16,16);
    gr(g,11,1,2,5,CL.stone);gr(g,11,1,2,1,CL.stoneD);
    for(let r=0;r<8;r++){const hf=1+r;gr(g,8-hf,r,hf*2,1,r===7?kd:(r%2?k:sh(k,.86)));gp(g,8-hf,r,kl);gp(g,7+hf,r,kd);if(r>1&&r<7)for(let x=9-hf+(r&1);x<7+hf;x+=3)gp(g,x,r,kd)}
    gr(g,8,0,1,1,kl);gr(g,10,8,5,1,kd);
    gr(g,1,8,14,8,CL.plaster);gr(g,1,8,14,1,CL.woodD);gr(g,1,8,1,8,CL.woodD);gr(g,14,8,1,8,CL.woodD);gr(g,7,8,1,8,CL.woodD);
    gr(g,3,10,3,3,CL.glass);gp(g,4,11,CL.woodD);gr(g,3,13,3,1,CL.woodD);gr(g,2,10,1,3,k);gr(g,6,10,1,3,k);
    gr(g,9,11,3,5,CL.wood);gr(g,9,11,1,5,CL.woodD);gp(g,11,13,CL.gold);
    gr(g,0,15,16,1,CL.stoneD);
  }else if(type===1){
    g=G(22,23);
    gr(g,10,0,1,4,CL.woodD);gr(g,11,0,4,2,k);gp(g,13,0,kl);
    for(let r=0;r<10;r++){const hf=2+r;gr(g,11-hf,3+r,hf*2,1,r===9?kd:(r%2?k:sh(k,.86)));gp(g,11-hf,3+r,kl);gp(g,10+hf,3+r,kd)}
    gr(g,10,6,2,2,CL.glass);
    gr(g,1,13,20,10,CL.plaster);gr(g,1,13,20,1,CL.woodD);gr(g,1,13,1,10,CL.woodD);gr(g,20,13,1,10,CL.woodD);
    gr(g,6,13,1,10,CL.woodD);gr(g,15,13,1,10,CL.woodD);
    gr(g,2,15,3,3,CL.glass);gp(g,3,16,CL.woodD);gr(g,17,15,3,3,CL.glass);gp(g,18,16,CL.woodD);
    gr(g,8,14,6,2,k);gp(g,10,14,CL.gold);gp(g,11,14,CL.gold);
    gr(g,9,17,4,6,CL.wood);gr(g,11,17,1,6,CL.woodD);gp(g,10,20,CL.gold);gp(g,12,20,CL.gold);
    gr(g,0,22,22,1,CL.stoneD);
  }else{
    g=G(18,24);
    gbricks(g,1,13,16,11,CL.stone,CL.stoneD);
    gr(g,0,12,18,1,kd);
    gbricks(g,6,5,7,19,CL.stoneL,CL.stone);
    for(let r=0;r<5;r++)gr(g,9-r,0+r,2*r+1,1,r%2?kd:k);
    gp(g,9,0,CL.gold);
    gr(g,7,7,5,5,[60,50,60]);gsym(g,7,7,dom);
    gr(g,8,19,3,5,CL.dark);gp(g,9,18,CL.dark);
    gr(g,2,16,2,3,kl);gr(g,14,16,2,3,kl);
  }
  return g;
}
function bElf(type,k,dom){
  const kl=sh(k,1.2);let g;
  if(type===0){
    g=G(16,18);
    gr(g,6,8,4,9,CL.wood);for(let y=9;y<16;y+=2)gp(g,7,y,CL.woodD);
    gr(g,4,16,8,2,CL.wood);gr(g,4,17,8,1,CL.woodD);
    gr(g,7,13,2,4,CL.dark);gr(g,7,12,2,1,CL.dark);gp(g,9,11,CL.glow);
    gell(g,8,5,8,5.4,CL.leafD);gell(g,8,4.4,7.2,4.6,CL.leaf);gell(g,6,3,3.2,2,CL.leafL);
    gp(g,3,6,kl);gp(g,12,7,k);gp(g,9,2,kl);gp(g,13,4,CL.glow);gp(g,4,3,CL.glow);gr(g,14,0,1,5,CL.woodD);gr(g,12,0,2,2,k);
  }else if(type===1){
    g=G(22,22);
    gr(g,8,10,6,11,CL.wood);for(let y=11;y<20;y+=2){gp(g,9,y,CL.woodD);gp(g,12,y+1,CL.woodD)}
    gr(g,5,20,12,2,CL.wood);gr(g,5,21,12,1,CL.woodD);
    gr(g,10,16,2,5,CL.dark);gr(g,10,15,2,1,CL.dark);gp(g,9,13,CL.glow);gp(g,12,12,CL.glow);
    gell(g,11,6,11,6.5,CL.leafD);gell(g,11,5.4,10,5.6,CL.leaf);gell(g,8,3.5,4,2.3,CL.leafL);gell(g,15,4,3,2,CL.leafL);
    gr(g,3,10,1,4,k);gp(g,3,14,CL.gold);gr(g,18,10,1,4,k);gp(g,18,14,CL.gold);
    gp(g,5,8,CL.glow);gp(g,16,9,CL.glow);gp(g,11,2,kl);gp(g,19,6,kl);
  }else{
    g=G(19,21);
    gell(g,9.5,8,7.5,7,CL.marble);gclr(g,5,6,9,15);
    for(let y=0;y<21;y++)for(let x=5;x<14;x++){const dx=(x+.5-9.5)/4.5,dy=(y+.5-8.5)/5.5;if(dx*dx+dy*dy<=1&&y>2)gclr(g,x,y,1,1)}
    gr(g,2,7,3,13,CL.marble);gr(g,14,7,3,13,CL.marble);gr(g,2,7,1,13,CL.marbleD);gr(g,14,7,1,13,CL.marbleD);
    gr(g,0,19,19,2,CL.marbleD);
    gsym(g,7,10,dom);
    gp(g,2,10,CL.leaf);gp(g,3,12,CL.leafL);gp(g,16,9,CL.leaf);gp(g,15,14,CL.leaf);gp(g,9,1,kl);
  }
  return g;
}
function bOrc(type,k,dom){
  const kd=sh(k,.7);let g;
  if(type===0){
    g=G(16,15);
    gp(g,5,0,CL.woodD);gp(g,6,1,CL.woodD);gp(g,10,0,CL.woodD);gp(g,9,1,CL.woodD);
    for(let y=2;y<15;y++){const hf=Math.round((y-1)*.55)+1;for(let x=8-hf;x<8+hf;x++)gp(g,x,y,((x*3+y*5)%11===0)?CL.hideD:CL.hide)}
    for(let x=0;x<16;x++){if(g.d[8*16+x])g.d[8*16+x]=k;if(g.d[9*16+x])g.d[9*16+x]=kd}
    for(let y=10;y<15;y++){const hw=(y-9)>>1;gr(g,7-hw,y,2+2*hw,1,CL.dark)}
    gp(g,3,14,CL.tusk);gp(g,3,13,CL.tusk);gp(g,4,12,CL.tusk);gp(g,12,14,CL.tusk);gp(g,12,13,CL.tusk);gp(g,11,12,CL.tusk);
  }else if(type===1){
    g=G(24,18);
    gr(g,1,0,1,14,CL.woodD);gr(g,2,0,4,3,k);gp(g,3,1,CL.tusk);
    for(let y=4;y<10;y++){const ins=9-y;gr(g,1+ins,y,22-2*ins,1,y%2?CL.hide:CL.hideD)}
    gp(g,7,3,CL.tusk);gp(g,7,2,CL.tusk);gp(g,11,3,CL.tusk);gp(g,11,2,CL.tusk);gp(g,16,3,CL.tusk);gp(g,16,2,CL.tusk);
    gr(g,2,10,20,8,CL.wood);for(let x=2;x<22;x+=3)gr(g,x,10,1,8,CL.woodD);
    gr(g,10,12,4,6,CL.dark);gr(g,11,10,2,2,CL.tusk);gp(g,11,11,CL.dark);
    gr(g,4,12,2,4,k);gr(g,18,12,2,4,k);gp(g,8,13,CL.fire2);gp(g,15,13,CL.fire2);
  }else{
    g=G(14,24);
    gr(g,2,21,10,3,CL.stoneD);
    gr(g,5,5,5,16,CL.wood);gr(g,5,5,1,16,CL.woodD);
    gr(g,1,7,4,2,k);gr(g,10,7,4,2,k);gp(g,0,6,k);gp(g,13,6,k);
    for(const y of [13,17]){gr(g,5,y-1,5,1,k);gp(g,6,y,CL.dark);gp(g,8,y,CL.dark);gr(g,6,y+2,3,1,CL.dark);gp(g,7,y+2,CL.tusk)}
    gr(g,5,6,5,5,[70,50,40]);gsym(g,5,6,dom);
    gr(g,3,3,8,2,CL.stoneD);gr(g,4,1,6,2,CL.fire2);gp(g,5,0,CL.fire1);gp(g,7,0,CL.fire1);gp(g,8,1,CL.fire1);gp(g,6,1,CL.fire1);
  }
  return g;
}
function bDwarf(type,k,dom){
  const kd=sh(k,.7);let g;
  if(type===0){
    g=G(18,14);
    gr(g,13,0,2,4,CL.stoneD);gr(g,13,0,2,1,CL.dark);
    gell(g,9,14,9,12,CL.stone);gbricks(g,0,0,18,14,CL.stone,CL.stoneD,true);
    for(let x=0;x<18;x++){for(let y=0;y<14;y++){if(g.d[y*18+x]&&!(x>=13&&x<15&&y<4)){gp(g,x,y,CL.moss);if(y+1<14)gp(g,x,y+1,CL.leafD);break}}}
    gr(g,6,7,6,7,CL.stoneL);gr(g,7,8,4,6,CL.wood);gr(g,7,8,1,6,CL.woodD);gp(g,8,10,CL.steelD);gp(g,10,10,CL.steelD);gp(g,9,12,CL.gold);
    gr(g,8,4,2,3,k);gp(g,8,6,kd);gr(g,3,0,1,5,CL.woodD);gr(g,4,0,3,2,k);gp(g,6,1,kd);
    gp(g,3,9,CL.glow);gp(g,14,9,CL.glow);
  }else if(type===1){
    g=G(24,20);
    for(let y=2;y<20;y++){const ins=Math.max(0,Math.round((10-y)*.75));for(let x=ins;x<24-ins;x++){const n=hash(x,y+77);gp(g,x,y,n<.3?CL.stoneD:n<.85?CL.stone:CL.stoneL)}}
    for(let x=0;x<24;x++)for(let y=0;y<20;y++){if(g.d[y*24+x]){gp(g,x,y,[236,240,248]);break}}
    gr(g,5,8,14,2,CL.stoneL);for(let x=7;x<18;x+=2)gp(g,x,8,CL.gold);
    gr(g,5,10,2,10,CL.stoneL);gr(g,17,10,2,10,CL.stoneL);
    gr(g,8,11,8,9,CL.wood);gr(g,9,10,6,1,CL.wood);gr(g,10,11,1,9,CL.woodD);gr(g,13,11,1,9,CL.woodD);
    gr(g,8,13,8,1,CL.steelD);gr(g,8,17,8,1,CL.steelD);
    gr(g,2,11,2,5,k);gp(g,2,16,kd);gp(g,3,16,kd);gr(g,20,11,2,5,k);gp(g,20,16,kd);gp(g,21,16,kd);
    gp(g,4,18,CL.fire2);gp(g,19,18,CL.fire2);
  }else{
    g=G(18,18);
    gbricks(g,1,10,16,8,CL.stone,CL.stoneD);
    gr(g,2,3,2,7,CL.stoneL);gr(g,14,3,2,7,CL.stoneL);gr(g,2,1,14,2,CL.stoneL);gr(g,4,3,10,7,[58,46,52]);
    gsym(g,6,4,dom);
    gr(g,6,12,6,2,CL.steelD);gr(g,8,14,2,2,CL.steelD);gr(g,7,16,4,1,CL.steelD);gp(g,6,12,CL.steel);
    gp(g,4,11,CL.fire2);gp(g,13,11,CL.fire2);gp(g,4,10,CL.fire1);gp(g,13,10,CL.fire1);
    for(const x of [3,5,12,14])gp(g,x,15,CL.gold);
    gr(g,7,0,4,1,k);
  }
  return g;
}
/* metallurgy: the same house, rebuilt in better materials as a kingdom climbs the ages */
const BRONZE=[198,130,68],BRONZE_D=[148,92,46],GILD=[240,198,72],GILD_D=[190,146,44];
function tierMap(t){
  const m=new Map(),set=(a,b)=>m.set(a,b);
  if(t>=1){set(CL.plaster,CL.stoneL);set(CL.woodD,CL.stoneD);set(CL.hide,CL.stone);set(CL.hideD,CL.stoneD)}
  if(t>=2){set(CL.wood,BRONZE);set(CL.woodD,BRONZE_D);set(CL.glass,[170,226,240])}
  if(t>=3){set(CL.wood,CL.steelD);set(CL.woodD,[70,76,90]);set(CL.plaster,CL.stone);set(CL.hide,CL.stoneD)}
  if(t>=4){set(CL.plaster,[208,214,226]);set(CL.hide,CL.steel);set(CL.wood,CL.steel);set(CL.woodD,CL.steelD);set(CL.stone,[132,136,148])}
  if(t>=5){set(CL.wood,GILD);set(CL.woodD,GILD_D);set(CL.plaster,[246,238,210]);set(CL.hide,[226,196,120]);set(CL.glass,CL.glow);set(CL.stone,[214,206,184]);set(CL.stoneL,[250,244,222])}
  return m;
}
const TIER_TRIM=[null,[200,196,186],BRONZE,[104,112,130],[214,222,236],GILD];
function tierGrid(g,t){
  if(!t)return g;const m=tierMap(t);
  for(let i=0;i<g.d.length;i++){const c=g.d[i];if(c&&m.has(c))g.d[i]=m.get(c)}
  /* a plinth of the age's metal, a banner from bronze on, and a golden crown in the Golden Age */
  const c=TIER_TRIM[t],cd=sh(c,.68),w=g.w,h=g.h;
  gr(g,0,h-1,w,1,cd);gr(g,1,h-2,w-2,1,c);
  if(t>=2){const x=w-4;gr(g,x,0,1,5,CL.woodD);gr(g,x+1,0,3,2,c);gp(g,x+3,1,cd);gp(g,x+1,2,cd)}
  if(t>=3)for(let x=2;x<w-2;x+=3)gp(g,x,h-3,cd);
  if(t>=5){const cx=w>>1;gp(g,cx,0,GILD);gp(g,cx-1,1,GILD);gp(g,cx+1,1,GILD);gp(g,cx,1,CL.glow)}
  return g;
}
/* every house gets a little something beside it, so a village never looks stamped out */
function withProp(g,v,race){
  if(!v)return g;
  const left=v===2,pw=6,n=G(g.w+pw,g.h),ox=left?pw:0,px=left?0:g.w;
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.d[y*g.w+x];if(c)n.d[y*n.w+x+ox]=c}
  const b=g.h;
  if(v===1){ /* crate and barrel */
    gr(n,px+1,b-4,3,3,[146,104,62]);gr(n,px+1,b-4,3,1,[186,140,86]);gp(n,px+2,b-3,CL.woodD);
    gr(n,px+4,b-3,2,3,[118,80,50]);gp(n,px+4,b-2,CL.steelD);gp(n,px+5,b-2,CL.steelD);gr(n,px+4,b-3,2,1,[160,112,70]);
  }else if(v===2){ /* hay bale or cart of ore */
    if(race==='dwarf'||race==='orc'){gr(n,px,b-3,5,2,CL.stoneD);gr(n,px+1,b-4,3,1,CL.stone);gp(n,px+1,b-1,CL.dark);gp(n,px+3,b-1,CL.dark);gp(n,px+2,b-4,[246,200,56]);gp(n,px+3,b-5,[246,200,56])}
    else{gr(n,px,b-4,5,3,[232,200,92]);gr(n,px,b-4,5,1,[250,226,130]);gp(n,px+1,b-3,[186,146,52]);gp(n,px+3,b-2,[186,146,52]);gr(n,px,b-1,5,1,[160,120,44])}
  }else{ /* flower bed behind a little fence */
    gr(n,px+1,b-2,5,1,[96,150,60]);for(const x of [1,3,5])gp(n,px+x,b-3,[236,96,150]);gp(n,px+2,b-3,[250,226,90]);gp(n,px+4,b-3,[250,250,246]);
    for(const x of [0,3,6])gr(n,px+x,b-3,1,3,CL.wood);gr(n,px,b-1,7,1,CL.woodD);
  }
  return n;
}
/* ---------- shared helpers: deterministic noise, roofs, per-race style ---------- */
function ah(x,y,s){let h=(Math.imul(x+11,374761393)+Math.imul(y+7,668265263)+Math.imul((s|0)+3,2246822519))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
const STRAW=[200,168,88],STRAWD=[164,130,62],SAND=[214,192,132],SANDD=[170,146,96],JADE=[58,166,126],JADED=[34,112,92],JADEL=[120,214,176];
const BRICK=[164,84,64],BRICKD=[118,58,48],CONC=[196,198,204],CONCD=[150,152,162],CONCL=[226,228,234];
const CYAN=[110,240,255],CYAND=[60,170,200],WHITE7=[238,246,252],WHITE7D=[176,196,214];
/* the style table: every people keeps its own look in every age */
const RSTYLE={
  human:{shape:'gable',brick:[176,92,70],brickD:[128,62,50],conc:[200,200,206],roof:null,acc:CL.gold,win:CL.glass,dark:[120,100,84]},
  elf:{shape:'curve',brick:[216,222,200],brickD:[170,182,160],conc:[222,234,222],roof:[56,132,84],acc:[110,200,120],win:[156,238,200],dark:[80,120,90]},
  dwarf:{shape:'slab',brick:[122,118,126],brickD:[84,80,92],conc:[132,130,140],roof:[74,74,90],acc:[214,166,62],win:[255,200,110],dark:[60,56,64]},
  orc:{shape:'hide',brick:[134,62,46],brickD:[92,40,34],conc:[116,88,80],roof:[96,70,50],acc:CL.tusk,win:[255,150,60],dark:[70,40,36]},
  gnome:{shape:'mush',brick:[204,148,102],brickD:[160,108,74],conc:[226,204,176],roof:null,acc:[216,140,70],win:[255,230,150],dark:[120,84,60]},
  goblin:{shape:'crook',brick:[104,116,68],brickD:[72,84,48],conc:[110,116,92],roof:[120,98,60],acc:[190,92,50],win:[220,240,120],dark:[64,58,40]},
  saurian:{shape:'step',brick:[214,194,134],brickD:[170,148,98],conc:[200,218,194],roof:JADE,acc:[240,196,70],win:[120,226,210],dark:[90,110,90]},
};
function rst(race){return RSTYLE[RB(race)]||RSTYLE.human}
/* roof outlines: returns [left,right) of one row of a roof of width w and height h */
function rext(shape,r,h,w){
  const cx=w/2,f=h>1?r/(h-1):1;let hw;
  switch(shape){
    case'curve':case'mush':{const u=(r+.5)/h;hw=Math.max(1.2,cx*Math.sqrt(1-(1-u)*(1-u)));break}
    case'step':hw=cx*(.4+.3*Math.min(2,(r*3/h)|0));break;
    case'slab':hw=Math.max(2,cx-(h-1-r)*1.25);break;
    case'flat':hw=cx;break;
    case'crook':{const ax=cx+2;return[Math.round(ax*(1-f))+(ah(r,3,9)<.3?1:0),Math.round(ax+(w-ax)*f)-(ah(r,5,9)<.3?1:0)]}
    default:hw=1+(cx-1)*f;
  }
  return[Math.round(cx-hw),Math.round(cx+hw)];
}
function roof(g,shape,x0,w,top,h,c,cd,cl){
  cd=cd||sh(c,.72);cl=cl||sh(c,1.2);
  for(let r=0;r<h;r++){
    const[l,rr]=rext(shape,r,h,w);if(rr<=l)continue;
    gr(g,x0+l,top+r,rr-l,1,r%2?c:sh(c,.9));gp(g,x0+l,top+r,cl);gp(g,x0+rr-1,top+r,cd);
    if(shape==='step'&&((r*3/h)|0)!==(((r+1)*3/h)|0)||r===h-1)gr(g,x0+l,top+r,rr-l,1,cd);
  }
}
function flagAt(g,x,y,k,hgt){const kd=sh(k,.7);gr(g,x,y,1,hgt||5,CL.woodD);gr(g,x+1,y,3,2,k);gp(g,x+3,y+1,kd);gp(g,x+1,y+2,kd)}
function skullAt(g,x,y){gr(g,x,y,3,2,CL.tusk);gp(g,x,y+1,CL.dark);gp(g,x+2,y+1,CL.dark);gp(g,x+1,y+2,CL.tusk)}
function windowAt(g,x,y,w,h,c,round){if(round){gell(g,x+w/2,y+h/2,w/2,h/2,c);return}gr(g,x,y,w,h,c);gp(g,x,y,sh(c,1.25))}
function gear(g,cx,cy,c){gp(g,cx,cy-1,c);gp(g,cx,cy+1,c);gp(g,cx-1,cy,c);gp(g,cx+1,cy,c);gp(g,cx,cy,sh(c,.6))}

/* ---------- gnome, goblin and saurian: their own houses for the stone to medieval ages ---------- */
function bGnome(type,k,dom){
  const kd=sh(k,.7),kl=sh(k,1.2);let g;
  if(type===0){
    g=G(16,16);
    gr(g,12,0,2,3,BRONZE_D);gp(g,12,0,BRONZE);gp(g,13,1,CL.steelL);
    gell(g,8,12,6.5,5,CL.plaster);gr(g,2,12,12,4,CL.plaster);
    roof(g,'mush',0,16,2,8,k,kd,kl);gp(g,4,4,CL.white);gp(g,5,4,CL.white);gp(g,11,5,CL.white);gp(g,9,3,CL.white);gp(g,2,7,CL.white);
    gell(g,8,13.2,2.2,2.8,CL.wood);gr(g,6,14,5,2,CL.wood);gp(g,9,13,CL.gold);gr(g,8,11,1,5,CL.woodD);
    gell(g,4,11.5,1.6,1.6,CL.glass);gp(g,4,11,CL.white);gp(g,12,11,CL.glow);gr(g,11,12,3,2,CL.glass);
    gr(g,0,15,16,1,CL.stoneD);gp(g,1,14,CL.leaf);gp(g,14,14,CL.leafL);
  }else if(type===1){
    g=G(24,22);
    gr(g,16,0,2,5,BRONZE_D);gr(g,16,0,2,1,BRONZE);gr(g,19,2,2,3,BRONZE_D);gp(g,19,2,BRONZE);
    gell(g,12,17,9,5,CL.plaster);gr(g,3,16,18,6,CL.plaster);
    roof(g,'mush',0,24,3,11,k,kd,kl);for(const[x,y]of[[5,7],[6,7],[16,6],[10,5],[19,9],[13,9],[3,10]])gr(g,x,y,2,1,CL.white);
    gell(g,12,18.5,3,3.5,CL.wood);gr(g,9,19,6,3,CL.wood);gr(g,12,15,1,7,CL.woodD);gp(g,11,19,CL.gold);gp(g,14,19,CL.gold);
    gell(g,6,17,2,2,CL.glass);gell(g,18,17,2,2,CL.glass);gear(g,12,13,BRONZE);gear(g,6,14,BRONZE_D);
    flagAt(g,1,0,k,6);gr(g,0,21,24,1,CL.stoneD);
  }else{
    g=G(18,24);
    gbricks(g,2,18,14,6,CL.stone,CL.stoneD);gr(g,1,17,16,1,CL.stoneL);
    gr(g,6,9,6,9,CL.plaster);gr(g,6,9,1,9,CL.woodD);gr(g,11,9,1,9,CL.woodD);
    gr(g,6,10,6,6,[60,50,60]);gsym(g,6,10,dom);
    roof(g,'mush',0,18,1,9,k,kd,kl);for(const[x,y]of[[4,4],[11,3],[13,6],[7,6]])gp(g,x,y,CL.glow);gp(g,9,0,CL.glow);
    gr(g,8,20,3,4,CL.dark);gell(g,9.5,20,1.5,1.5,CL.dark);gear(g,3,20,BRONZE);gear(g,15,20,BRONZE);
  }
  return g;
}
function bGoblin(type,k,dom){
  const kd=sh(k,.7);let g;
  const patch=(x,y,w,h)=>{const n=ah(x,y,4);gr(g,x,y,w,h,n<.34?CL.hide:n<.67?CL.steelD:CL.hideD)};
  if(type===0){
    g=G(16,16);
    gp(g,3,0,CL.woodD);gp(g,3,1,CL.woodD);skullAt(g,2,-0>0?0:1>1?0:0);
    for(let y=8;y<16;y++){const l=2+((y-8)>>2),rr=14-(y>11?0:1);gr(g,l,y,rr-l,1,y%2?CL.wood:sh(CL.wood,.9))}
    roof(g,'crook',0,16,2,6,CL.hideD,CL.dark,CL.hide);patch(4,3,3,2);gr(g,8,3,4,2,k);patch(11,5,3,1);
    gr(g,2,8,1,8,CL.woodD);gr(g,13,8,1,8,CL.woodD);patch(3,9,3,3);patch(9,9,3,2);
    gr(g,6,12,4,4,CL.dark);gp(g,6,12,CL.woodD);gr(g,10,13,2,2,CL.glow);gp(g,12,15,CL.woodD);
    gr(g,12,0,1,3,CL.woodD);gr(g,12,0,1,1,CL.steelL);gr(g,0,15,16,1,CL.stoneD);gp(g,1,15,CL.tusk);
  }else if(type===1){
    g=G(24,19);
    for(let y=9;y<19;y++){const l=1+((y-9)>>3),rr=23-((19-y)>7?1:0);gr(g,l,y,rr-l,1,y%2?CL.wood:sh(CL.wood,.88))}
    roof(g,'crook',0,24,3,6,CL.hideD,CL.dark,CL.hide);gr(g,3,9,7,5,CL.wood);roof(g,'crook',3,16,0,4,CL.steelD,CL.dark,CL.steel);
    patch(2,10,4,3);patch(14,11,5,3);patch(8,14,3,2);gr(g,10,5,4,2,k);gr(g,12,0,1,4,CL.woodD);
    gr(g,9,12,5,7,CL.dark);gp(g,10,12,CL.woodD);skullAt(g,10,9);skullAt(g,2,6);skullAt(g,19,6);
    gr(g,17,13,3,3,CL.glow);gp(g,18,14,CL.fire2);gr(g,1,18,22,1,CL.stoneD);gr(g,18,0,1,5,CL.woodD);gr(g,19,0,2,2,k);
  }else{
    g=G(16,22);
    gr(g,3,16,10,6,CL.wood);for(let x=3;x<13;x+=3)gr(g,x,16,1,6,CL.woodD);
    gr(g,2,10,11,6,CL.hideD);patch(2,10,4,3);gr(g,5,6,8,4,CL.wood);gr(g,4,5,2,1,CL.steelD);
    gr(g,5,7,6,3,[70,50,40]);gsym(g,5,7,dom);gr(g,3,17,2,5,CL.dark);
    gr(g,6,2,5,3,CL.stoneD);gr(g,7,0,3,2,CL.fire2);gp(g,8,0,CL.fire1);gp(g,3,1,CL.tusk);gr(g,3,2,1,4,CL.woodD);gp(g,12,4,CL.tusk);
    skullAt(g,9,17);gr(g,11,12,3,2,k);gp(g,13,12,kd);
  }
  return g;
}
function bSaurian(type,k,dom){
  const kd=sh(k,.7),kl=sh(k,1.2);let g;
  const water=(x,y,w)=>{for(let i=0;i<w;i++)gp(g,x+i,y+(i&1),[90,170,226])};
  if(type===0){
    g=G(16,16);
    roof(g,'step',1,14,1,6,JADE,JADED,JADEL);gr(g,2,3,12,1,k);gr(g,5,0,6,1,JADEL);
    gr(g,2,7,12,9,CL.plaster);gr(g,2,7,12,1,SANDD);gr(g,2,7,1,9,SANDD);gr(g,13,7,1,9,SANDD);
    gr(g,6,10,4,6,CL.wood);gr(g,6,9,4,1,CL.gold);water(3,13,3);water(10,13,3);
    gr(g,3,10,2,2,CL.glass);gr(g,11,10,2,2,CL.glass);gr(g,0,15,16,1,CL.stoneD);
  }else if(type===1){
    g=G(22,23);
    roof(g,'step',2,18,1,7,JADE,JADED,JADEL);gr(g,5,4,12,1,k);gr(g,8,0,6,1,CL.gold);gp(g,10,0,kl);gp(g,11,0,kl);
    gr(g,1,8,20,3,CL.plaster);gr(g,1,8,20,1,CL.gold);gr(g,3,11,16,12,CL.plaster);gr(g,3,11,16,1,SANDD);
    for(const x of[4,8,13,17])gr(g,x,12,1,11,SANDD);
    gr(g,9,14,4,9,CL.wood);gr(g,9,13,4,1,CL.gold);water(5,16,3);water(14,16,3);gr(g,5,13,2,2,CL.glass);gr(g,15,13,2,2,CL.glass);
    for(let y=19;y<23;y++)gr(g,5+(y-19),y,12-2*(y-19)+ (y-19)*0,1,CL.stoneL);
    gr(g,0,22,22,1,CL.stoneD);
  }else{
    g=G(18,24);
    for(let i=0;i<4;i++)gr(g,1+i*2,20-i*4+ (i?0:0),16-i*4,4,i%2?CL.stoneL:CL.plaster);
    for(let i=0;i<4;i++)gr(g,1+i*2,20-i*4,16-i*4,1,CL.stoneD);
    gr(g,7,5,4,5,[50,60,64]);gsym(g,6,4,dom);gr(g,8,0,2,3,JADE);gp(g,8,0,JADEL);gr(g,6,8,6,1,CL.gold);
    gr(g,8,20,2,4,CL.dark);water(2,22,3);water(13,22,3);gp(g,3,18,CL.fire2);gp(g,14,18,CL.fire2);gr(g,2,13,3,2,k);gr(g,13,13,3,2,k);
  }
  return g;
}

/* ---------- Stone Age (era 0): huts, lean-tos, cave mouths and standing stones ---------- */
function bPrim(race,type,k,dom){
  const r=RB(race),kd=sh(k,.7),kl=sh(k,1.2);let g;
  const rock=(cx,cy,rx,ry)=>{gell(g,cx,cy,rx,ry,CL.stone);gell(g,cx-rx*.2,cy-ry*.25,rx*.7,ry*.6,CL.stoneL);
    for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.d[y*g.w+x];if(c&&ah(x,y,2)<.12)gp(g,x,y,CL.stoneD)}};
  const key=(race in{gnome:1,goblin:1,saurian:1})?race:r;
  if(key==='human'){
    if(type===0){g=G(16,14);
      for(let y=1;y<11;y++){const hw=1+y*.7;gr(g,Math.round(8-hw),y,Math.round(hw*2),1,y%2?STRAW:STRAWD);gp(g,Math.round(8-hw),y,STRAWD)}
      gr(g,8,0,1,3,CL.woodD);gp(g,7,0,CL.woodD);gp(g,9,0,CL.woodD);
      gr(g,6,6,5,5,CL.dark);gr(g,6,6,5,1,CL.woodD);gr(g,2,10,12,1,STRAWD);gr(g,1,11,14,3,CL.stoneD);for(const x of[1,5,9,13])gr(g,x,11,2,2,CL.stone);gr(g,11,3,2,2,k);gp(g,12,5,kd);
    }else if(type===1){g=G(22,17);
      for(let y=3;y<12;y++){const hw=Math.min(9,2+y*1.0);gr(g,Math.round(11-hw-1),y,Math.round(hw*2+2),1,y%2?STRAW:STRAWD)}
      gr(g,2,10,18,1,STRAWD);for(let x=3;x<20;x+=3)gr(g,x,11,1,6,CL.woodD);gr(g,3,11,16,5,CL.hide);gr(g,3,11,16,1,CL.hideD);
      gr(g,9,11,4,6,CL.dark);gr(g,0,16,22,1,CL.stoneD);gr(g,1,0,1,13,CL.woodD);gr(g,0,0,3,3,k);gp(g,1,1,kd);skullAt(g,1,3);gp(g,0,6,CL.tusk);gp(g,2,6,CL.tusk);
    }else{g=G(18,20);
      for(let i=0;i<7;i++){const a=i/6*Math.PI,x=Math.round(9-Math.cos(a)*7.5),y=Math.round(17-Math.sin(a)*3.5);gr(g,x-1,y-3,2,4,CL.stone);gr(g,x-1,y-3,2,1,CL.stoneL)}
      gr(g,3,4,3,12,CL.stone);gr(g,12,4,3,12,CL.stone);gr(g,2,2,14,3,CL.stoneL);gr(g,2,4,14,1,CL.stoneD);gr(g,3,4,1,12,CL.stoneL);
      gr(g,6,6,6,6,[50,44,52]);gsym(g,6,6,dom);gr(g,6,16,6,2,CL.stoneD);gr(g,7,14,4,2,CL.fire2);gp(g,8,13,CL.fire1);gp(g,9,12,CL.fire1);gr(g,0,18,18,2,CL.stoneD);gp(g,9,1,k);gp(g,9,0,kl)}
  }else if(key==='elf'){
    if(type===0){g=G(16,16);
      gr(g,6,6,4,9,CL.wood);for(let y=7;y<15;y+=2)gp(g,7,y,CL.woodD);
      for(let i=0;i<5;i++){const x=1+i*3;gr(g,x,9-(i%2),1,7,CL.woodD)}
      gell(g,8,6,7,4.6,CL.leafD);gell(g,8,5.4,6,3.8,CL.leaf);gell(g,6,4,2.5,1.6,CL.leafL);
      gr(g,7,11,3,5,CL.dark);gp(g,9,10,CL.glow);gp(g,2,4,k);gp(g,13,6,kl);gp(g,12,3,CL.glow);gr(g,0,15,16,1,CL.leafD);gp(g,3,14,CL.leafL);
    }else if(type===1){g=G(22,21);
      gr(g,8,8,7,12,CL.wood);for(let y=9;y<19;y+=2){gp(g,9,y,CL.woodD);gp(g,13,y+1,CL.woodD)}
      gr(g,4,19,15,2,CL.wood);gr(g,10,13,3,7,CL.dark);gell(g,11.5,13,1.5,1.5,CL.dark);gp(g,9,12,CL.glow);
      gell(g,11,6,10,5.6,CL.leafD);gell(g,11,5.4,9,4.8,CL.leaf);gell(g,8,3.5,3.5,2,CL.leafL);gell(g,15,4,3,1.8,CL.leafL);
      gr(g,2,8,1,8,CL.woodD);gr(g,19,8,1,8,CL.woodD);gr(g,2,8,1,2,k);gr(g,19,8,1,2,k);gp(g,5,9,CL.glow);gp(g,17,7,CL.glow);
    }else{g=G(18,20);
      gell(g,9,16,8,3,CL.leafD);gr(g,6,6,6,12,CL.stoneL);gr(g,6,6,1,12,CL.stone);gr(g,11,6,1,12,CL.stoneD);gr(g,7,4,4,2,CL.stoneL);
      gr(g,7,7,4,5,[50,60,56]);gsym(g,6,7,dom);gell(g,9,3,3,2,CL.leaf);gp(g,9,1,CL.glow);gp(g,3,12,CL.leaf);gp(g,15,13,CL.leafL);gp(g,2,16,CL.glow);gp(g,16,15,CL.glow);gp(g,9,0,kl)}
  }else if(key==='dwarf'){
    if(type===0){g=G(18,13);rock(9,13,9,12);gr(g,6,6,6,7,CL.dark);gr(g,7,5,4,1,CL.dark);gp(g,8,12,CL.fire2);gp(g,9,11,CL.fire1);gr(g,5,5,1,8,CL.stoneL);gr(g,12,5,1,8,CL.stoneL);gr(g,3,1,1,5,CL.woodD);gr(g,4,1,3,2,k);gp(g,6,2,kd);gp(g,14,9,CL.glow);
    }else if(type===1){g=G(24,18);rock(12,18,12,17);gr(g,8,8,8,10,CL.dark);gr(g,9,7,6,1,CL.dark);gr(g,7,7,1,11,CL.stoneL);gr(g,16,7,1,11,CL.stoneL);
      gr(g,10,12,4,6,CL.fire2);gr(g,11,13,2,5,CL.fire1);gp(g,1,3,CL.tusk);gr(g,1,4,1,8,CL.woodD);gr(g,2,4,3,3,k);gr(g,19,4,1,8,CL.woodD);gr(g,20,4,3,3,k);gp(g,4,14,CL.glow);gp(g,20,14,CL.glow);gr(g,0,17,24,1,CL.stoneD);
    }else{g=G(18,18);rock(9,12,8,9);gr(g,5,6,8,9,[56,48,56]);gsym(g,6,7,dom);gr(g,3,13,12,3,CL.stoneL);gr(g,3,15,12,1,CL.stoneD);gp(g,2,14,CL.fire2);gp(g,15,14,CL.fire2);gp(g,2,13,CL.fire1);gp(g,15,13,CL.fire1);gr(g,8,0,2,3,k);gr(g,0,16,18,2,CL.stoneD)}
  }else if(key==='orc'){
    if(type===0){g=G(16,13);
      for(let y=2;y<13;y++){const hw=Math.round((y-1)*.5)+1;gr(g,8-hw,y,hw*2,1,CL.hide);if(y%3===0)gp(g,8-hw,y,CL.hideD)}
      gr(g,6,0,1,3,CL.tusk);gr(g,9,0,1,3,CL.tusk);gr(g,6,7,4,6,CL.dark);gr(g,10,8,3,1,k);gp(g,1,12,CL.tusk);gp(g,14,12,CL.tusk);gp(g,13,11,CL.tusk);skullAt(g,3,10);gr(g,0,12,16,1,CL.stoneD);
    }else if(type===1){g=G(24,17);
      for(let y=3;y<12;y++){const hw=Math.min(10,3+(y-3)*1.0);gr(g,Math.round(12-hw),y,Math.round(hw*2),1,y%2?CL.hide:CL.hideD)}
      for(const x of[5,9,15,19])gr(g,x,1,1,3,CL.tusk);gr(g,8,12,8,5,CL.hideD);gr(g,10,11,4,6,CL.dark);gr(g,1,6,1,9,CL.woodD);gr(g,2,6,4,3,k);skullAt(g,0,3);gr(g,21,6,1,9,CL.woodD);gr(g,17,6,4,3,k);skullAt(g,20,3);gr(g,16,13,3,3,CL.fire2);gp(g,17,12,CL.fire1);gr(g,0,16,24,1,CL.stoneD);
    }else{g=G(14,20);
      gr(g,6,6,2,12,CL.woodD);gr(g,2,9,10,2,CL.wood);for(const[x,y]of[[6,3],[2,12],[10,12],[6,15]])skullAt(g,x-1+((y===3)?1:0),y);
      gr(g,3,6,8,3,[60,44,40]);gsym(g,5,3,dom);gr(g,5,0,4,2,CL.fire2);gp(g,6,0,CL.fire1);gp(g,7,0,CL.fire1);gr(g,3,17,8,3,CL.stoneD);gp(g,2,16,CL.tusk);gp(g,11,16,CL.tusk);gr(g,10,5,3,2,k)}
  }else if(key==='gnome'){
    if(type===0){g=G(14,12);gell(g,7,11,6.5,7,[132,98,66]);gell(g,7,9,5,4.5,[156,118,80]);gr(g,0,11,14,1,CL.stoneD);gell(g,7,10.5,2,2.5,CL.dark);gr(g,6,10,3,2,CL.dark);
      gell(g,11,3,2.4,1.5,k);gr(g,10,4,2,3,CL.white);gp(g,10,2,CL.white);gp(g,3,6,CL.leaf);gp(g,2,7,CL.leafL);
    }else if(type===1){g=G(22,16);gell(g,11,16,10.5,12,[132,98,66]);gell(g,11,13,8,7,[156,118,80]);gr(g,0,15,22,1,CL.stoneD);gell(g,11,13,3,3.5,CL.dark);gr(g,8,13,6,3,CL.dark);
      gell(g,4,5,2.6,1.7,k);gr(g,3,6,2,3,CL.white);gell(g,18,4,2.2,1.5,kl);gr(g,17,5,2,3,CL.white);gp(g,6,12,CL.glow);gp(g,16,12,CL.glow);flagAt(g,10,0,k,4);
    }else{g=G(18,20);gell(g,9,19,8,9,[132,98,66]);gr(g,0,18,18,2,CL.stoneD);gr(g,6,10,6,8,[46,40,50]);gsym(g,6,11,dom);
      gell(g,9,6,7,4.5,k);gell(g,9,5.5,6,3.5,kl);for(const[x,y]of[[6,4],[10,3],[12,6],[8,7]])gp(g,x,y,CL.white);gr(g,8,7,2,4,CL.white);gp(g,2,16,CL.glow);gp(g,15,16,CL.glow)}
  }else if(key==='goblin'){
    if(type===0){g=G(16,13);
      for(let i=0;i<7;i++){const x=1+i*2;gr(g,x,1+((i*3)&3),1,10-((i*3)&3),i%2?CL.woodD:CL.wood)}
      for(let y=5;y<12;y++)gr(g,2+((y>8)?0:1),y,10-(y-5),1,ah(y,1,6)<.5?CL.hide:CL.hideD);
      gr(g,7,8,4,5,CL.dark);gp(g,1,0,CL.steelL);skullAt(g,12,1);gr(g,12,3,1,6,CL.woodD);gr(g,12,8,3,2,k);gr(g,0,12,16,1,CL.stoneD);gp(g,14,11,CL.tusk);
    }else if(type===1){g=G(22,16);
      for(let i=0;i<10;i++){const x=1+i*2;gr(g,x,2+((i*5)%4),1,13-((i*5)%4),i%2?CL.woodD:CL.wood)}
      for(let y=6;y<15;y++)gr(g,2,y,17,1,ah(y,3,6)<.4?CL.hide:y%2?CL.hideD:CL.steelD);
      gr(g,8,8,6,7,CL.dark);skullAt(g,9,5);skullAt(g,1,3);gr(g,19,3,1,8,CL.woodD);gr(g,19,3,3,3,k);gr(g,15,13,3,2,CL.fire2);gp(g,16,12,CL.fire1);gr(g,0,15,22,1,CL.stoneD);
    }else{g=G(14,20);
      gr(g,6,5,2,13,CL.woodD);gr(g,2,10,10,2,CL.wood);gr(g,1,15,12,3,CL.hideD);skullAt(g,5,2);gp(g,3,9,CL.tusk);gp(g,10,9,CL.tusk);gp(g,1,7,CL.steelL);
      gr(g,4,5,6,4,[60,44,40]);gsym(g,4,5,dom);gr(g,5,0,4,2,CL.fire2);gp(g,6,0,CL.fire1);gr(g,9,13,3,2,k);gr(g,0,18,14,2,CL.stoneD)}
  }else{ /* saurian: reed hut on stilts, mud step-shrine */
    if(type===0){g=G(16,16);
      for(const x of[2,6,9,13])gr(g,x,10,1,6,CL.woodD);gr(g,1,9,14,1,CL.wood);
      gr(g,2,8,12,1,STRAWD);roof(g,'curve',1,14,1,7,STRAW,STRAWD,[226,200,120]);gr(g,5,0,6,1,JADE);gr(g,3,4,10,1,k);
      gr(g,6,11,4,5,CL.dark);gp(g,2,14,[90,170,226]);gp(g,13,14,[90,170,226]);gr(g,0,15,16,1,[90,170,226]);
    }else if(type===1){g=G(22,17);
      for(const x of[3,8,13,18])gr(g,x,11,1,6,CL.woodD);gr(g,2,10,18,1,CL.wood);
      roof(g,'curve',1,20,1,9,STRAW,STRAWD,[226,200,120]);gr(g,3,6,16,1,k);gr(g,8,0,6,1,JADE);gp(g,10,0,CL.gold);
      gr(g,9,11,4,6,CL.dark);for(let i=0;i<18;i++)gp(g,2+i,16,[90,170,226]);gp(g,5,12,JADE);gp(g,17,12,JADE);
    }else{g=G(18,18);
      gr(g,1,14,16,4,CL.stoneD);gr(g,3,10,12,4,CL.stone);gr(g,5,6,8,4,CL.stoneL);gr(g,6,7,6,3,[50,60,60]);gsym(g,6,5,dom);
      gr(g,6,3,6,2,CL.stoneL);gr(g,8,0,2,3,JADE);gp(g,8,0,JADEL);gr(g,8,14,2,4,CL.dark);for(let i=0;i<4;i++)gp(g,i*2,17,[90,170,226]);gr(g,2,10,2,3,k)}
  }
  return g;
}

/* ---------- Gunpowder to Future ages (4-7): one body per age, dressed by each people's style ---------- */
function rkey(race){return RSTYLE[race]?race:(RSTYLE[RB(race)]?RB(race):'human')}
function roofCol(key,S,k){return key==='human'||key==='gnome'?k:(S.roof||k)}
function glassFor(key,era){
  if(era>=7)return key==='orc'?[255,90,70]:key==='dwarf'?[255,200,90]:key==='elf'?[140,255,190]:key==='saurian'?[120,255,220]:key==='gnome'?[255,190,240]:CYAN;
  return key==='human'?[126,176,214]:key==='elf'?[130,206,170]:key==='dwarf'?[236,190,100]:key==='orc'?[150,70,56]:key==='gnome'?[186,208,240]:key==='goblin'?[170,200,110]:[96,200,190];
}
/* each people's ornaments over any body that spans x0,y0 .. x0+w,y0+h */
function ornament(g,key,era,x0,y0,w,h,k){
  const kd=sh(k,.7);
  if(key==='elf'){
    for(let y=y0+h-1;y>y0+2;y--){if(ah(1,y,5)<.5){gp(g,x0,y,CL.leaf);if(ah(2,y,5)<.4)gp(g,x0+1,y,CL.leafL)}if(ah(3,y,5)<.4){gp(g,x0+w-1,y,CL.leafD);if(ah(4,y,5)<.3)gp(g,x0+w-2,y,CL.leaf)}}
    for(let i=0;i<w;i+=3)gp(g,x0+i,y0-1,ah(i,0,7)<.5?CL.leaf:CL.leafL);
    if(era>=6)for(let i=1;i<w-1;i+=4)gp(g,x0+i,y0,CL.leafL);
    if(era>=7){gp(g,x0+2,y0+3,CYAN);gp(g,x0+w-3,y0+h-4,CYAN)}
  }else if(key==='dwarf'){
    gr(g,x0,y0+(h*.42|0),w,1,era>=7?GILD:BRONZE);gp(g,x0,y0,GILD);gp(g,x0+w-1,y0,GILD);gp(g,x0,y0+h-1,GILD);gp(g,x0+w-1,y0+h-1,GILD);
    for(let i=2;i<w-2;i+=4)gp(g,x0+i,y0+(h*.42|0)-1,GILD_D);
    if(era>=5){gr(g,x0+w-1,y0+2,1,h-3,BRONZE);gp(g,x0+w-1,y0+2,CL.steelL)}
  }else if(key==='orc'){
    for(let i=1;i<w;i+=3){gp(g,x0+i,y0-1,CL.tusk);if(era<6)gp(g,x0+i,y0-2,CL.tusk)}
    skullAt(g,x0+((w/2)|0)-1,y0+(h*.4|0));
    for(let i=0;i<3;i++)gr(g,x0+2+((i*5)%Math.max(1,w-4)),y0+h-3-i,1,2,CL.fire3);
    if(era>=5)gp(g,x0+w-3,y0-3,CL.red);
  }else if(key==='gnome'){
    gear(g,x0+2,y0+h-4,BRONZE);gear(g,x0+w-3,y0+(h*.4|0),BRONZE_D);
    if(era>=5){gr(g,x0+w-1,y0+1,1,h-4,BRONZE);gp(g,x0+w-1,y0,CL.steelL)}
  }else if(key==='goblin'){
    for(let i=0;i<3;i++){const px=x0+1+((ah(i,y0,3)*(w-5))|0),py=y0+2+((ah(y0,i,3)*(h-6))|0),n=ah(i,i,8);
      gr(g,px,py,3,2,n<.3?CL.hide:n<.6?CL.steelD:n<.8?k:[170,110,70])}
    if(era>=5){gr(g,x0+1,y0-2,1,3,CL.steelD);gr(g,x0+w-2,y0-1,1,2,CL.steelL)}
  }else if(key==='saurian'){
    gr(g,x0,y0+1,w,1,GILD);for(let i=0;i<w;i++)gp(g,x0+i,y0+h-2+(i&1?0:-1),[90,170,226]);
    gp(g,x0+1,y0-1,JADEL);gp(g,x0+w-2,y0-1,JADEL);
  }
}
function brickWall(g,x,y,w,h,c,cd,key){if(key==='elf'||key==='gnome'||key==='saurian'){gr(g,x,y,w,h,c);for(let j=2;j<h;j+=4)gr(g,x,y+j,w,1,cd);gr(g,x,y,1,h,sh(c,1.1));gr(g,x+w-1,y,1,h,cd)}else gbricks(g,x,y,w,h,c,cd)}
function circleWin(g,x,y,c){gell(g,x+1,y+1,1.5,1.5,c);gp(g,x,y,sh(c,1.3))}

function bMod(race,type,era,k,dom){
  const key=rkey(race),S=RSTYLE[key],kd=sh(k,.7),kl=sh(k,1.2),rc=roofCol(key,S,k),win=glassFor(key,era);
  const rnd=(key==='gnome'||key==='elf');let g;
  const wallc=era===4?S.brick:era===5?sh(S.brick,.82):era===6?S.conc:WHITE7;
  const walld=era===4?S.brickD:era===5?sh(S.brickD,.8):era===6?sh(S.conc,.8):WHITE7D;
  if(era===4){
    if(type===0){
      g=G(16,17);
      brickWall(g,1,8,14,9,wallc,walld,key);gr(g,0,16,16,1,CL.stoneD);
      roof(g,S.shape,0,16,1,7,rc,sh(rc,.7),sh(rc,1.2));if(key==='goblin')gr(g,9,3,3,2,k);if(key==='saurian')gr(g,3,4,10,1,k);
      if(key!=='elf'&&key!=='gnome'&&key!=='saurian'){gr(g,11,0,2,4,wallc);gr(g,11,0,2,1,walld);gp(g,12,-1,CL.stoneL)}
      if(rnd){circleWin(g,3,10,win);circleWin(g,11,10,win);gell(g,8,14,1.8,2.4,CL.wood);gr(g,7,14,3,3,CL.wood)}
      else{windowAt(g,3,10,3,3,win);windowAt(g,10,10,3,3,win);gr(g,2,10,1,3,k);gr(g,6,10,1,3,k);gr(g,7,12,3,5,CL.wood);gr(g,7,12,1,5,CL.woodD);gp(g,9,14,CL.gold)}
      ornament(g,key,4,1,8,14,9,k);
    }else if(type===1){
      g=G(24,25);
      brickWall(g,1,12,22,13,wallc,walld,key);gr(g,0,24,24,1,CL.stoneD);
      roof(g,S.shape,0,24,6,7,rc,sh(rc,.7),sh(rc,1.2));
      gr(g,8,0,8,13,wallc);brickWall(g,8,0,8,13,wallc,walld,key);roof(g,S.shape==='slab'?'slab':'gable',7,10,0,4,sh(rc,.9),sh(rc,.6),sh(rc,1.2));
      gell(g,12,8,2.2,2.2,CL.white);gp(g,12,7,CL.dark);gp(g,12,8,CL.dark);gp(g,13,8,CL.dark);
      for(const x of[3,7,15,19]){windowAt(g,x,14,2,3,win);windowAt(g,x,19,2,3,win)}
      gr(g,10,18,4,7,CL.wood);gr(g,10,17,4,1,CL.gold);gr(g,12,18,1,7,CL.woodD);flagAt(g,19,0,k,6);
      ornament(g,key,4,1,12,22,13,k);
    }else{
      g=G(18,28);
      brickWall(g,2,14,14,14,S.brick,S.brickD,key);gr(g,1,13,16,1,CL.stoneL);gr(g,0,27,18,1,CL.stoneD);
      brickWall(g,6,6,6,9,sh(S.brick,1.1),S.brickD,key);
      for(let r=0;r<7;r++)gr(g,9-(r+1)*1,r-0,(r+1)*2,1,r%2?rc:sh(rc,.85));gp(g,9,-1,CL.gold);gr(g,9,0,1,1,CL.glow);
      gr(g,7,8,4,5,[56,54,64]);gsym(g,7,8,dom);
      for(const x of[3,13]){windowAt(g,x,16,2,4,win);windowAt(g,x,22,2,4,win)}
      gr(g,7,22,4,6,CL.dark);gr(g,7,21,4,1,CL.stoneL);
      ornament(g,key,4,2,14,14,14,k);
    }
  }else if(era===5){
    const dome=rnd&&key!=='saurian';
    if(type===0){
      g=G(16,18);
      brickWall(g,1,9,14,9,wallc,walld,key);gr(g,0,17,16,1,CL.stoneD);
      if(dome){gell(g,8,9,7,5,key==='elf'?JADE:BRONZE);gell(g,8,9,5.5,3.5,key==='elf'?JADEL:[226,170,100]);gr(g,0,9,16,1,sh(wallc,.7))}
      else if(S.shape==='step')roof(g,'step',0,16,4,5,JADE,JADED,JADEL);
      else for(let i=0;i<3;i++){const x=1+i*5;for(let r=0;r<5;r++)gr(g,x,4+r,r+1,1,r===4?CL.steelD:CL.steel);gr(g,x+1,4,4,5,r5roof(key,rc));for(let r=0;r<5;r++)gr(g,x,4+r,r+1,1,r===4?CL.steelD:win);gr(g,x+5,4,1,5,sh(rc,.6))}
      if(!dome){gr(g,1,8,14,1,sh(rc,.7))}
      gr(g,11,0,3,9,sh(S.brick,.7));gr(g,11,0,3,1,CL.dark);gr(g,11,1,1,8,sh(S.brick,.9));gp(g,12,-1,[150,150,160,]);
      if(rnd){circleWin(g,3,11,win);circleWin(g,10,11,win)}else{gr(g,2,11,4,4,win);gp(g,3,12,CL.dark);gr(g,10,11,4,4,win);gr(g,12,11,1,4,CL.dark)}
      gr(g,7,13,3,5,CL.dark);
      if(key==='goblin')gr(g,11,-0,3,1,CL.steelD);
      ornament(g,key,5,1,9,14,9,k);gr(g,1,8,14,1,k);
    }else if(type===1){
      g=G(24,26);
      brickWall(g,1,13,22,13,wallc,walld,key);gr(g,0,25,24,1,CL.stoneD);
      /* clock tower */
      brickWall(g,2,2,7,12,sh(wallc,1.05),walld,key);roof(g,'gable',1,9,-0>0?0:0,3,rc,sh(rc,.7),sh(rc,1.2));
      gell(g,5.5,7,2.6,2.6,CL.white);gp(g,5,7,CL.dark);gp(g,5,6,CL.dark);gp(g,6,7,CL.dark);gp(g,5,5,CL.dark);
      for(let i=0;i<3;i++)gr(g,12+i*4,3,3,10,sh(S.brick,.7)),gr(g,12+i*4,3,3,1,CL.dark);gr(g,12+0*4,3,1,10,sh(S.brick,.95));
      for(const x of[11,15,19]){gr(g,x,14,3,4,win);gr(g,x,20,3,4,win)}gr(g,3,16,3,3,win);
      gr(g,8,19,4,7,CL.dark);gr(g,12,0,1,1,CL.stoneL);
      for(let i=0;i<3;i++){gp(g,13+i*4,2,[170,170,180]);gp(g,14+i*4,0,[150,150,160])}
      ornament(g,key,5,1,13,22,13,k);gr(g,1,13,22,1,k);flagAt(g,21,0,k,5);
    }else{
      g=G(18,28);
      brickWall(g,2,14,14,14,sh(S.brick,.85),S.brickD,key);gr(g,1,13,16,1,CL.stoneL);gr(g,0,27,18,1,CL.stoneD);
      brickWall(g,3,4,12,10,sh(S.brick,.9),S.brickD,key);
      gr(g,2,0,3,5,sh(S.brick,.7));gr(g,13,0,3,5,sh(S.brick,.7));for(const x of[2,13])for(let r=0;r<3;r++)gr(g,x+(r===0?1:0),r,3-(r===0?2:0),1,rc);
      gell(g,9,9,3.2,3.2,[50,50,64]);gsym(g,7,7,dom);
      for(const x of[4,12]){gr(g,x,16,2,4,win);gr(g,x,22,2,4,win)}gr(g,7,21,4,7,CL.dark);gr(g,6,20,6,1,CL.stoneL);
      ornament(g,key,5,2,14,14,14,k);
    }
  }else if(era===6){
    if(type===0){
      g=G(16,18);
      gr(g,1,3,14,15,wallc);gr(g,1,3,14,1,CL.stoneL);gr(g,0,2,16,1,walld);gr(g,0,17,16,1,CL.stoneD);
      for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x=2+i*4,y=4+j*4;if(rnd)circleWin(g,x,y,win);else{gr(g,x,y,3,3,win);gp(g,x,y,sh(win,1.3))}}
      gr(g,6,14,4,4,CL.dark);gr(g,3,6+4,10,0,wallc);for(const y of[7,11])gr(g,1,y,14,1,walld);
      gr(g,3,0,3,2,CL.steelL);gr(g,3,0,3,1,CL.steel);gr(g,10,0,1,2,CL.steelD);gp(g,10,-1,CL.steelL);gr(g,13,1,2,1,k);
      if(key==='saurian'){gclr(g,1,3,3,4);gclr(g,13,3,2,4);gr(g,3,3,10,1,JADE)}
      ornament(g,key,6,1,3,14,15,k);
    }else if(type===1){
      g=G(20,32);
      gr(g,4,0,12,4,wallc);gr(g,4,0,12,1,CL.steelL);gr(g,1,4,18,28,wallc);gr(g,0,31,20,1,CL.stoneD);
      for(let y=5;y<28;y+=3)for(let x=2;x<18;x+=3){const gg=win;gr(g,x,y,2,2,((x+y)&1)?gg:sh(gg,.86));gp(g,x,y,sh(gg,1.3))}
      for(let y=5;y<28;y+=3)gr(g,1,y+2,18,1,walld);gr(g,8,26,4,6,CL.dark);gr(g,8,25,4,1,CL.gold);
      for(let y=1;y<4;y+=2)for(let x=5;x<15;x+=3)gr(g,x,y,2,1,win);gr(g,9,-2,1,2,CL.steelL);gr(g,9,0,1,1,CL.red);gr(g,15,6,4,2,k);gr(g,1,6,3,2,k);
      ornament(g,key,6,1,4,18,27,k);
    }else{
      g=G(18,26);
      for(let y=0;y<24;y++){const hw=Math.min(8,y*.5+1.5);gr(g,Math.round(9-hw),y,Math.round(hw*2),1,wallc)}
      for(let y=0;y<24;y++){const hw=Math.min(8,y*.5+1.5);gp(g,Math.round(9-hw),y,CONCL);gp(g,Math.round(9+hw)-1,y,walld)}
      gr(g,0,24,18,2,CL.stoneD);gr(g,5,7,8,9,[40,56,70]);gsym(g,6,9,dom);gr(g,4,17,10,2,win);for(let x=5;x<14;x+=3)gr(g,x,17,1,2,walld);
      gr(g,8,20,2,4,CL.dark);gr(g,8,2,2,4,win);gr(g,9,-0,1,2,k);
      ornament(g,key,6,3,8,12,16,k);
    }
  }else{ /* era 7: white, glass, glow */
    const gl=glassFor(key,7);
    if(type===0){
      g=G(16,16);
      if(key==='saurian'||S.shape==='step'){for(let i=0;i<3;i++)gr(g,1+i*2,12-i*4,14-i*4,4,i%2?JADEL:[190,240,226]);gr(g,2,15,12,1,CYAND)}
      else if(key==='dwarf'||key==='orc'||key==='goblin'){gr(g,1,6,14,10,key==='goblin'?[110,120,120]:[72,76,92]);gr(g,0,5,16,1,[110,116,136]);gr(g,2,2,12,3,[96,100,120]);for(let x=2;x<14;x+=2)gp(g,x,1,key==='orc'?CL.tusk:CL.steelL)}
      else{gell(g,8,12,7.5,6,wallc);gr(g,1,12,14,4,wallc);gell(g,8,7,5,4,gl);gell(g,8,7,4,3,sh(gl,1.25))}
      gr(g,3,11,10,1,key==='dwarf'||key==='orc'||key==='goblin'?gl:CYAN);gr(g,6,13,4,3,[40,60,80]);gp(g,7,14,gl);gp(g,9,14,gl);
      for(let x=2;x<14;x+=3)gp(g,x,9,CYAN);gr(g,0,15,16,1,CYAND);
      ornament(g,key,7,1,3,14,12,k);gr(g,12,1,3,1,k);
    }else if(type===1){
      g=G(22,32);
      const dk=key==='dwarf'||key==='orc'||key==='goblin',bc=dk?(key==='goblin'?[112,122,116]:[66,70,88]):key==='elf'?[226,246,230]:key==='gnome'?[250,232,240]:key==='saurian'?[214,246,232]:WHITE7;
      for(let y=0;y<28;y++){let hw=y<10?1+y*.28:2.8+(y-10)*.55;if(key==='saurian')hw=2+((y/7)|0)*2.2;if(key==='elf')hw+=Math.sin(y*.5)*1.1;if(key==='gnome'&&y>8)hw+=Math.abs(Math.sin(y*.45))*1.6;if(dk&&y>10)hw=5+(y-10)*.3;
        gr(g,Math.round(11-hw),y+2,Math.round(hw*2),1,y%3===2?sh(bc,.85):bc);if(key==='orc'&&y%5===3){gp(g,Math.round(11-hw)-1,y+2,CL.tusk);gp(g,Math.round(11+hw),y+2,CL.tusk)}if(key==='goblin'&&y%6===1)gr(g,Math.round(11-hw)+1,y+2,3,2,[170,110,70])}
      gr(g,10,0,2,3,CYAN);gp(g,10,-1,CL.white);
      for(let y=4;y<28;y+=4){const hw=y<10?1+y*.28:2.8+(y-10)*.55;gr(g,Math.round(11-hw)+1,y+2,Math.round(hw*2)-2,1,CYAN)}
      gell(g,11,24,10,4,bc);gr(g,1,24,20,7,bc);gr(g,0,31,22,1,CYAND);gr(g,3,26,16,2,gl);gr(g,9,28,4,3,[40,60,80]);
      gell(g,11,10,6,1,CYAN);gp(g,3,10,CYAN);gp(g,19,10,CYAN);flagAt(g,19,18,k,5);
      ornament(g,key,7,1,22,20,9,k);
    }else{
      g=G(18,28);
      gr(g,1,24,16,4,WHITE7D);gr(g,0,27,18,1,CYAND);
      gr(g,5,20,8,4,WHITE7);gr(g,3,23,12,1,CYAN);
      for(let y=1;y<17;y++){const hw=y<9?y*.7:(17-y)*.8;const h2=Math.round(hw);gr(g,9-h2,y,h2*2,1,y%2?gl:sh(gl,1.2));gp(g,9-h2,y,CL.white);gp(g,8+h2,y,sh(gl,.7))}
      gr(g,6,6,6,6,[34,50,70,]);gsym(g,6,7,dom);
      for(const[x,y]of[[2,6],[15,10],[3,15],[14,3]])gp(g,x,y,CYAN);gr(g,7,18,4,1,CYAN);gr(g,8,0,2,1,k);
      ornament(g,key,7,2,20,14,8,k);
    }
  }
  return g;
}
function r5roof(key,rc){return rc}

/* ---------- village works for every age (forge, dock, watchtower, windmill) ---------- */
function mixc(a,b,t){return[a[0]+(b[0]-a[0])*t|0,a[1]+(b[1]-a[1])*t|0,a[2]+(b[2]-a[2])*t|0]}
function eraMat(era,S){
  const m=[
    {w:CL.wood,wd:CL.woodD,wl:[168,120,74],tr:CL.hide},
    {w:CL.stone,wd:CL.stoneD,wl:CL.stoneL,tr:BRONZE},
    {w:CL.stone,wd:CL.stoneD,wl:CL.stoneL,tr:[104,112,130]},
    {w:[142,144,152],wd:[100,102,114],wl:[184,186,196],tr:[96,106,128]},
    {w:S.brick,wd:S.brickD,wl:sh(S.brick,1.2),tr:CL.steelD},
    {w:sh(S.brick,.78),wd:sh(S.brickD,.7),wl:sh(S.brick,.95),tr:CL.dark},
    {w:S.conc,wd:sh(S.conc,.78),wl:CONCL,tr:CL.steelD},
    {w:WHITE7,wd:WHITE7D,wl:[252,254,255],tr:CYAND}][era];
  if(era>=1&&era<=3)return{w:mixc(m.w,S.brick,.2),wd:mixc(m.wd,S.brickD,.2),wl:m.wl,tr:m.tr};
  return m;
}
function smoke(g,x,y){gp(g,x,y,[170,170,178]);gp(g,x+1,y-1,[190,190,198]);gp(g,x,y-2,[200,200,208])}
function wForge(era,k,S){
  const kd=sh(k,.7),kl=sh(k,1.2),M=eraMat(era,S);let g;
  const hearth=(x,y,w,h)=>{gr(g,x,y,w,h,CL.dark);gr(g,x+1,y+h-3,w-2,3,CL.fire2);gr(g,x+2,y+h-2,Math.max(1,w-4),2,CL.fire1);gp(g,x+1,y+h-4,CL.fire1)};
  if(era===0){
    g=G(16,13);
    for(let i=0;i<7;i++){const a=i/6*Math.PI;gell(g,5+Math.cos(a)*3.6+3.6*0,9,0,0,CL.stone)}
    for(let x=2;x<10;x+=2){gr(g,x,9,2,2,x%4?CL.stone:CL.stoneL);gr(g,x,11,2,1,CL.stoneD)}
    gr(g,3,7,6,2,CL.fire2);gr(g,4,6,4,1,CL.fire1);gp(g,5,5,CL.fire1);gp(g,6,4,CL.fire2);
    gr(g,11,2,1,10,CL.woodD);gr(g,14,3,1,9,CL.woodD);gr(g,11,3,4,6,CL.hide);gr(g,11,3,4,1,CL.hideD);gr(g,11,8,4,1,k);
    gr(g,11,10,4,2,CL.stoneD);gr(g,11,9,3,1,CL.steelD);gp(g,2,12,CL.tusk);gr(g,0,12,16,1,CL.stoneD);
  }else if(era<=3){
    g=G(16,16);
    gr(g,11,0,3,7,M.w);gr(g,11,0,3,1,M.wd);gr(g,11,0,1,7,M.wl);if(era>=3){gr(g,10,0,5,1,M.tr)}
    gr(g,0,7,16,2,M.wd);gr(g,1,6,14,1,k);gr(g,2,5,12,1,kd);if(era>=2)gr(g,3,4,10,1,kd);
    gr(g,1,9,14,7,M.w);gbricks(g,1,9,14,7,M.w,M.wd);gr(g,0,15,16,1,M.wd);
    hearth(3,10,5,5);gr(g,3,10,5,1,M.wd);
    gr(g,10,11,4,2,era>=3?CL.steelL:CL.steelD);gr(g,9,13,6,1,era>=2?CL.steel:BRONZE_D);gr(g,11,14,2,2,CL.woodD);
    if(era>=1)gr(g,1,9,14,1,M.tr);gp(g,9,10,k);
  }else if(era===4){
    g=G(20,17);
    gr(g,14,0,3,6,M.w);gr(g,14,0,3,1,CL.dark);gr(g,14,0,1,6,M.wl);
    roof(g,'slab',0,20,5,5,mixc(CL.steelD,S.roof||k,.4),CL.dark,CL.steel);gr(g,3,5,3,1,k);
    brickWall(g,1,10,18,7,M.w,M.wd,'human');gr(g,0,16,20,1,CL.stoneD);
    hearth(3,11,5,5);gr(g,11,12,6,4,CL.dark);gr(g,12,13,4,1,CL.steelL);gr(g,12,15,4,1,CL.steelD);
    gr(g,17,6,1,5,CL.woodD);gr(g,14,6,4,1,CL.woodD);gp(g,14,7,CL.steelL);smoke(g,15,-0>0?0:0);
    gr(g,9,11,2,5,CL.wood);ornament(g,rkey2(S),4,1,10,18,6,k);
  }else if(era===5){
    g=G(24,22);
    brickWall(g,1,10,22,12,M.w,M.wd,'human');gr(g,0,21,24,1,CL.stoneD);
    for(let i=0;i<3;i++){const x=1+i*7;for(let r=0;r<5;r++)gr(g,x,5+r,r+1,1,CL.steel);gr(g,x+5,5,2,5,M.wd);gr(g,x,5,1,5,CL.steelL)}
    gr(g,1,9,22,1,M.tr);
    for(const x of[16,20]){gr(g,x,0,3,10,M.wd);gr(g,x,0,3,1,CL.dark);gr(g,x,1,3,1,M.wl);gp(g,x+1,-1,[120,120,130])}
    gr(g,3,12,4,5,hasWin(S,5));gr(g,9,12,4,5,hasWin(S,5));gr(g,15,13,6,8,CL.dark);gr(g,16,16,4,5,CL.fire2);gr(g,17,18,2,3,CL.fire1);gr(g,2,17,3,0,k);gr(g,1,10,22,1,k);
    ornament(g,rkey2(S),5,1,10,22,11,k);
  }else if(era===6){
    g=G(26,24);
    gr(g,1,12,14,12,M.w);gr(g,0,11,16,1,M.wd);gr(g,0,23,26,1,CL.stoneD);
    for(let y=14;y<22;y+=3)for(let x=2;x<14;x+=3)gr(g,x,y,2,2,[120,176,214]);
    gr(g,6,18,4,6,CL.dark);
    /* cooling tower */
    for(let y=0;y<22;y++){const t=y/21,hw=6-Math.sin(t*Math.PI)*1.8+ (t>.5?(t-.5)*3:0)*0.4;gr(g,Math.round(20-hw),y+2,Math.round(hw*2),1,y%4===0?M.wd:M.w);gp(g,Math.round(20-hw),y+2,M.wl)}
    gr(g,12,0,3,12,M.wd);for(let y=1;y<10;y+=3)gr(g,12,y,3,1,CL.red);gr(g,12,0,3,1,CL.white);
    gp(g,20,1,[230,230,240]);gp(g,19,0,[210,214,224]);gp(g,22,0,[236,238,246]);gr(g,1,12,14,1,k);
    ornament(g,rkey2(S),6,1,12,14,12,k);
  }else{
    g=G(22,22);
    gell(g,11,19,10,16,WHITE7);gr(g,1,19,20,3,WHITE7D);gr(g,0,21,22,1,CYAND);
    gell(g,11,10,6,6,[60,90,120]);gell(g,11,10,4.5,4.5,CYAN);gell(g,11,10,2.6,2.6,[220,255,255]);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;gp(g,11+Math.cos(a)*7.5,10+Math.sin(a)*7.5,CYAN)}
    gr(g,6,17,10,5,[40,60,84]);gr(g,9,18,4,4,CYAN);gr(g,0,5,22,1,sh(CYAND,1));gr(g,10,0,2,3,k);
    ornament(g,rkey2(S),7,2,14,18,7,k);
  }
  return{g};
}
function rkey2(S){for(const k in RSTYLE)if(RSTYLE[k]===S)return k;return'human'}
function hasWin(S,era){return era>=7?CYAN:era>=5?S.win:CL.glass}
function wDock(era,k,S){
  const kd=sh(k,.7),M=eraMat(era,S);let g;
  if(era===0){
    g=G(18,11);
    for(let i=0;i<4;i++)gr(g,1+i*4,4,3,3,i%2?CL.wood:CL.hide);gr(g,0,5,18,1,CL.woodD);gr(g,0,3,18,1,CL.wood);
    for(const x of[1,16])gr(g,x,7,1,4,CL.woodD);gr(g,6,0,1,4,CL.woodD);gp(g,7,0,k);gp(g,7,1,k);gr(g,12,2,3,2,CL.hide);gp(g,3,2,CL.tusk);gr(g,3,1,1,2,CL.woodD);
  }else if(era<=3){
    g=G(18,11);
    gr(g,0,4,18,3,CL.wood);for(let x=0;x<18;x+=3)gr(g,x,4,1,3,CL.woodD);gr(g,0,4,18,1,[168,120,74]);
    for(const x of[1,6,11,16])gr(g,x,7,1,4,CL.woodD);
    gr(g,2,1,3,3,[146,104,62]);gr(g,2,1,3,1,[186,140,86]);gp(g,3,2,CL.woodD);
    if(era>=2){gr(g,8,1,3,3,[118,80,50]);gr(g,8,1,3,1,M.tr);gr(g,8,3,3,1,M.tr)}else{gr(g,8,2,3,2,CL.hide);gp(g,9,2,CL.woodD)}
    if(era>=1)for(const x of[1,6,11,16])gp(g,x,7,M.tr);
    gr(g,15,0,1,4,CL.woodD);gr(g,16,0,2,2,k);gp(g,17,1,kd);if(era>=3)gr(g,12,2,2,2,CL.steelL);
  }else if(era===4){
    g=G(20,14);
    gr(g,0,7,20,3,CL.wood);for(let x=0;x<20;x+=3)gr(g,x,7,1,3,CL.woodD);gr(g,0,7,20,1,[168,120,74]);
    for(const x of[1,6,11,16,19])gr(g,x,10,1,4,CL.woodD);
    gr(g,2,4,3,3,[118,80,50]);gr(g,2,4,3,1,M.tr);gr(g,6,5,2,2,[146,104,62]);gr(g,12,4,3,3,[118,80,50]);gr(g,12,5,3,1,CL.steelD);
    gr(g,16,0,1,7,CL.woodD);gr(g,16,0,4,1,CL.woodD);gp(g,19,1,CL.steelL);gr(g,19,2,1,2,CL.steelD);gr(g,9,0,1,6,CL.woodD);gr(g,10,0,2,2,k);gp(g,9,1,CL.glow);
  }else if(era===5){
    g=G(24,20);
    gr(g,0,12,24,3,CL.steelD);gr(g,0,12,24,1,CL.steel);for(let x=0;x<24;x+=4)gr(g,x,12,1,3,CL.dark);
    for(const x of[2,9,16,22])gr(g,x,15,2,5,CL.steelD);
    gr(g,3,0,2,12,k);gr(g,3,0,13,2,sh(k,.8));gr(g,14,0,2,12,sh(k,.8));gr(g,15,2,1,9,CL.dark);gr(g,6,2,1,5,CL.dark);gp(g,6,8,CL.steelL);gr(g,5,7,3,3,CL.steelD);
    gr(g,17,8,5,4,M.w);gr(g,17,8,5,1,M.wl);gr(g,18,5,3,3,sh(k,1.1));
  }else if(era===6){
    g=G(28,22);
    gr(g,0,16,28,3,CL.steelD);gr(g,0,16,28,1,CONC);for(const x of[2,10,18,25])gr(g,x,19,2,3,CL.steelD);
    gr(g,2,0,2,16,CL.red);gr(g,22,0,2,16,CL.red);gr(g,2,0,22,3,CL.red);gr(g,2,0,22,1,sh(CL.red,1.2));gr(g,24,1,4,1,CL.red);gr(g,12,3,1,6,CL.steelD);gr(g,11,9,3,2,CL.steelD);
    for(let i=0;i<5;i++){const c=i%3===0?k:i%3===1?[236,200,70]:[60,120,190];gr(g,5+i*4-(i>1?0:0),i<3?12:12,4,4,c);gr(g,5+i*4,12,4,1,sh(c,1.25))}
    gr(g,0,12,3,4,CONCD);gp(g,1,8,CL.white);
  }else{
    g=G(24,16);
    gr(g,0,9,24,3,WHITE7);gr(g,0,12,24,1,CYAND);gr(g,0,9,24,1,CYAN);for(let x=1;x<24;x+=4)gr(g,x,13,1,3,WHITE7D);
    for(const x of[2,20]){gr(g,x,0,2,9,WHITE7);gr(g,x,0,2,1,CYAN);gp(g,x,-0,CYAN)}
    gell(g,12,6,5,1.5,[150,240,255]);gell(g,12,6,3,1,CL.white);gr(g,3,2,16,1,[120,230,250,]);gr(g,11,0,2,2,k);
  }
  return{g};
}
function wTower(era,k,S){
  const kd=sh(k,.7),M=eraMat(era,S);let g;
  if(era===0){
    g=G(12,24);
    gr(g,2,10,1,14,CL.woodD);gr(g,9,10,1,14,CL.woodD);gr(g,3,12,1,12,CL.wood);gr(g,8,12,1,12,CL.wood);
    for(let y=14;y<24;y+=3){gr(g,2,y,8,1,CL.woodD);gp(g,4,y-1,CL.woodD);gp(g,7,y+1,CL.woodD)}
    gr(g,1,9,10,2,CL.wood);gr(g,1,9,10,1,[168,120,74]);for(let y=3;y<9;y++){const hw=Math.min(5,(y-2));gr(g,6-hw,y,hw*2,1,y%2?CL.hide:CL.hideD)}
    gr(g,2,5,1,4,CL.woodD);gr(g,9,5,1,4,CL.woodD);gr(g,5,0,1,4,CL.woodD);gr(g,6,0,3,2,k);gp(g,8,1,kd);gp(g,1,3,CL.tusk);gr(g,0,23,12,1,CL.stoneD);
  }else if(era<=3){
    g=G(10,26);
    if(era===3){gr(g,5,0,1,4,CL.woodD);gr(g,6,0,3,2,k);gp(g,8,1,kd);gr(g,1,4,8,1,kd);gr(g,2,5,6,1,k);for(const x of[1,3,5,7])gp(g,x,6,M.wl);gr(g,1,7,8,2,M.wl)}
    else{gr(g,5,0,1,5,CL.woodD);gr(g,6,0,3,2,k);gp(g,8,1,kd);for(let r=0;r<4;r++)gr(g,5-r-1,4+r,2*r+3,1,r%2?k:kd);gr(g,1,8,8,1,M.wl)}
    gr(g,2,9,6,13,M.w);gbricks(g,2,9,6,13,M.w,M.wd);gr(g,2,9,1,13,M.wl);gr(g,7,9,1,13,M.wd);
    gr(g,4,11,2,3,CL.dark);gp(g,4,11,CL.glass);gr(g,4,17,2,2,CL.dark);
    if(era>=1){gr(g,2,15,6,1,M.tr);gr(g,2,20,6,1,M.tr)}
    gr(g,1,22,8,1,M.wl);gr(g,0,23,10,3,M.w);gbricks(g,0,23,10,3,M.w,M.wd);gr(g,4,23,2,3,CL.wood);gr(g,0,25,10,1,M.wd);
  }else if(era===4){
    g=G(16,22);
    gell(g,8,17,7.5,6,M.w);gr(g,1,12,14,10,M.w);gbricks(g,1,12,14,10,M.w,M.wd);gr(g,0,21,16,1,M.wd);
    for(let x=1;x<15;x+=3){gr(g,x,10,2,2,M.wl);gr(g,x,12,2,1,M.wd)}gr(g,1,12,14,1,M.wl);
    gr(g,3,14,3,2,CL.dark);gr(g,10,14,3,2,CL.dark);gr(g,6,16,4,6,CL.dark);gr(g,6,15,4,1,M.wl);
    gr(g,11,7,3,3,CL.steelD);gr(g,13,8,3,1,CL.steelL);gr(g,12,9,2,1,CL.steelD);gp(g,10,8,CL.fire2);
    gr(g,3,0,1,10,CL.woodD);gr(g,4,0,4,3,k);gp(g,7,1,kd);ornament(g,rkey2(S),4,1,12,14,9,k);
  }else if(era===5){
    g=G(12,30);
    gr(g,2,10,8,19,M.w);brickWall(g,2,10,8,19,M.w,M.wd,'human');gr(g,1,8,10,3,M.wl);gr(g,1,8,10,1,k);
    gr(g,3,3,6,5,[200,214,226]);gr(g,3,3,6,1,CL.steelD);gr(g,3,7,6,1,CL.steelD);gr(g,5,3,2,5,CL.glow);
    gr(g,4,0,4,3,CL.steelD);gr(g,5,0,2,1,CL.glow);gr(g,5,-0,1,1,k);
    for(let y=13;y<27;y+=5)gr(g,5,y,2,3,S.win);gr(g,4,25,4,4,CL.dark);gr(g,0,29,12,1,M.wd);
    ornament(g,rkey2(S),5,2,10,8,19,k);
  }else if(era===6){
    g=G(12,32);
    gr(g,4,10,4,21,M.w);gr(g,4,10,1,21,M.wl);gr(g,7,10,1,21,M.wd);for(let y=12;y<30;y+=4)gr(g,4,y,4,1,M.wd);
    gr(g,1,28,10,3,M.wd);gr(g,0,31,12,1,CL.stoneD);gr(g,2,7,8,3,M.w);gr(g,2,7,8,1,CL.steelL);gr(g,3,8,6,1,S.win);
    /* radar dish */
    gell(g,6,4,4.5,3,CL.steelL);gell(g,6,4,3.5,2,CL.steel);gclr(g,0,5,12,3);gr(g,6,4,1,4,CL.steelD);gp(g,6,1,CL.red);gp(g,6,0,CL.red);gr(g,9,0,3,2,k);
  }else{
    g=G(12,32);
    gr(g,4,9,4,22,WHITE7);gr(g,4,9,1,22,[252,254,255]);gr(g,7,9,1,22,WHITE7D);for(let y=11;y<30;y+=3)gr(g,4,y,4,1,CYAN);
    gr(g,2,28,8,3,WHITE7D);gr(g,0,31,12,1,CYAND);
    gell(g,6,5,4.5,4.5,[40,70,100]);gell(g,6,5,3.4,3.4,CYAN);gell(g,6,5,1.6,1.6,[230,255,255]);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;gp(g,6+Math.cos(a)*5.5,5+Math.sin(a)*5.5,CYAND)}gr(g,0,0,3,2,k);
  }
  return{g};
}
function wMill(era,k,S){
  const kd=sh(k,.7),kl=sh(k,1.2),M=eraMat(era,S);let g,hub=null;
  const CREAM='#f2ecd6';
  if(era<=4){
    g=G(14,20);
    const cap=era===0?CL.hideD:k;
    for(let r=0;r<5;r++){const hw=Math.min(r,2)+2;gr(g,7-hw,2+r,hw*2,1,r%2?cap:sh(cap,.7))}
    gr(g,6,0,2,2,kd);gp(g,6,0,kl);
    const wall=era===0?CL.wood:era===4?M.w:CL.plaster;
    for(let y=7;y<16;y++){const hw=3+(((y-7)/2)|0);gr(g,7-hw,y,hw*2,1,wall);gp(g,7-hw,y,era===4?M.wd:CL.woodD);gp(g,6+hw,y,era===4?M.wd:CL.woodD);if(era===0&&y%3===0)gr(g,7-hw,y,hw*2,1,CL.woodD)}
    if(era===4)for(let y=8;y<16;y+=3)gr(g,4,y,6,1,M.wd);
    gr(g,6,6,2,2,CL.woodD);gp(g,6,6,CL.steelL);
    gr(g,6,11,3,5,CL.wood);gr(g,6,11,1,5,CL.woodD);gp(g,8,13,CL.gold);gr(g,3,9,2,2,CL.glass);
    gr(g,2,16,10,1,M.wl);gr(g,1,17,12,3,era===0?CL.stoneD:M.w);gbricks(g,1,17,12,3,era===0?CL.stoneD:M.w,era===0?CL.dark:M.wd);gr(g,1,19,12,1,M.wd);
    if(era>=2)gr(g,3,14,8,1,M.tr);if(era>=3)gp(g,10,9,CL.glow);
    ornament(g,rkey2(S),Math.min(era,3),3,8,8,8,k);
    hub={x:8,y:8,len:era===0?6:7,n:4,col:CREAM};
  }else if(era===5){
    g=G(16,26); /* grain silo and steam mill */
    gr(g,2,6,8,20,[196,198,206]);gr(g,2,6,1,20,CL.white);gr(g,9,6,1,20,[150,152,164]);for(let y=8;y<26;y+=4)gr(g,2,y,8,1,[160,162,174]);
    gell(g,6,6,4,2.5,[170,172,184]);gr(g,5,0,2,5,CL.dark);gr(g,5,0,2,1,CL.steelD);gp(g,6,-0,[230,230,240]);
    gr(g,10,12,5,14,M.w);brickWall(g,10,12,5,14,M.w,M.wd,'human');gr(g,10,10,5,2,k);gr(g,11,14,3,3,S.win);gr(g,12,22,2,4,CL.dark);gr(g,3,22,4,4,CL.dark);gr(g,0,25,16,1,CL.stoneD);
    ornament(g,rkey2(S),5,10,12,5,14,k);
  }else if(era===6){
    g=G(14,34);
    gr(g,5,6,3,27,CL.white);gr(g,5,6,1,27,CONCL);gr(g,7,6,1,27,[190,196,206]);gr(g,3,31,8,2,CONCD);gr(g,0,33,14,1,CL.stoneD);
    gr(g,4,4,5,4,[220,226,234]);gr(g,4,4,5,1,CL.white);gr(g,9,5,2,2,CL.steelD);gp(g,6,4,k);gr(g,6,27,2,4,CL.dark);gp(g,6,3,CL.red);
    hub={x:7,y:6,len:9,n:3,col:'#f8fafc'};
  }else{
    g=G(24,18); /* solar and fusion farm */
    for(let i=0;i<3;i++){const x=1+i*7;for(let r=0;r<6;r++){const ins=(r>>1);gr(g,x+ins,2+r*2,6-ins*2+ (r>>1)*0,2,(i+r)&1?[40,80,150]:[56,100,176]);}gr(g,x,13,6,1,WHITE7D)}
    for(let i=0;i<3;i++){const x=1+i*7;gr(g,x,2,6,1,CYAN);gr(g,x+2,14,2,3,WHITE7D)}
    gell(g,12,14,3,2,CYAN);gr(g,0,17,24,1,CYAND);gr(g,11,0,2,2,k);
    for(let i=0;i<3;i++){gp(g,3+i*7,4,CYAN);gp(g,5+i*7,8,CYAN)}
    ornament(g,rkey2(S),7,1,10,22,6,k);
  }
  return{g,hub};
}
function buildingSprite(race,type,ci,dom,tier,v){
  if(type===3)return spr('ruin',()=>shade3d(ruinSprite()));
  tier=Math.max(0,Math.min(7,tier|0));v=type===0?(v||0):0;
  /* every building gets the shared 3D edge pass (shade3d, props.js) once, when it is first baked */
  return spr(`b|${race}|${type}|${ci}|${dom}|${tier}|${v}`,()=>shade3d((()=>{
    const k=KCOL[ci%KCOL.length],S=rst(race),key=rkey(race);
    if(type===4)return bake(monumentGrid(RB(race),k,dom));
    if(type>=5){
      const o=type===5?wForge(tier,k,S):type===6?wDock(tier,k,S):type===7?wTower(tier,k,S):wMill(tier,k,S);
      const s=bake(o.g);if(type===8)s.hub=o.hub?{x:o.hub.x+1,y:o.hub.y+1,len:o.hub.len,n:o.hub.n,col:o.hub.col}:null;return s;
    }
    let g;
    if(tier===0)g=bPrim(race,type,k,dom);
    else if(tier<=3){
      const t=tier===1?2:tier===2?3:4,f=({human:bHuman,elf:bElf,orc:bOrc,dwarf:bDwarf,gnome:bGnome,goblin:bGoblin,saurian:bSaurian})[key];
      g=tierGrid(f(type,k,dom),t);
    }else g=bMod(race,type,tier,k,dom);
    return bake(withProp(g,v,key));
  })()));
}

/* ---------- boats: a hull and rig for every age, dressed by each people ---------- */
const BOAT_LOOK={
  human:{hc:[150,100,60],hd:[104,68,40],hl:[186,138,84]},
  elf:{hc:[238,238,228],hd:[190,196,190],hl:[255,255,250]},
  dwarf:{hc:[128,132,146],hd:[84,88,102],hl:[176,180,194]},
  orc:{hc:[104,76,54],hd:[66,46,34],hl:[140,104,74]},
  gnome:{hc:[176,112,66],hd:[120,72,42],hl:[214,152,96]},
  goblin:{hc:[118,104,70],hd:[78,66,44],hl:[150,136,92]},
  saurian:{hc:[196,176,100],hd:[134,118,64],hl:[226,208,136]},
};
function hullShape(g,x,y,w,hh,c,cd,cl,taper){
  for(let i=0;i<hh;i++){const ins=Math.round(i*(taper===undefined?1:taper));gr(g,x+ins,y+i,w-2*ins,1,i===hh-1?cd:c);gp(g,x+ins,y+i,cl)}
}
function boatSail(g,key,x,y,w,h,col,k){
  const kd=sh(k,.7);
  if(key==='saurian'){ /* fin-shaped crest sail in jade and gold */
    for(let r=0;r<h;r++){const ww=Math.max(1,Math.round(1+(w-1)*Math.pow(r/(h-1||1),.8)));gr(g,x,y+r,ww,1,r%3===2?CL.gold:(r%2?JADE:JADEL));gp(g,x+ww-1,y+r,JADED)}
    gr(g,x,y,1,h,CL.gold);gp(g,x+1,y+1,k);
  }else if(key==='elf'){ /* leaf sail */
    gell(g,x+w/2,y+h/2,w/2,h/2,[214,240,200]);gell(g,x+w/2,y+h/2,w/2-1,h/2-1,[180,226,170]);gr(g,x+w/2,y+1,1,h-2,CL.leafD);gp(g,x+1,y+h-2,k);gp(g,x+w-2,y+h-2,k);
  }else if(key==='goblin'){
    for(let r=0;r<h;r++){const cut=ah(r,x,6)<.3?1:0;gr(g,x+cut,y+r,w-cut,1,r%2?col:sh(col,.85))}
    for(let i=0;i<3;i++){const n=ah(i,y,2);gr(g,x+1+((n*(w-3))|0),y+1+((ah(i,x,2)*(h-3))|0),2,2,ah(i,i,5)<.5?k:CL.steelD)}
    gr(g,x,y+h-1,w,1,kd);
  }else{
    gr(g,x,y,w,h,col);gr(g,x,y+((h/2)|0),w,1,k);gr(g,x,y+h-1,w,1,sh(col,.75));gr(g,x,y,1,h,sh(col,1.15));
    if(key==='orc'){gp(g,x+w-2,y+1,CL.tusk);gp(g,x+1,y+h-3,CL.hideD)}
    if(key==='dwarf'){gp(g,x+w-3,y+1,CL.dark);gp(g,x+w-3,y+2,CL.dark);gp(g,x+w-4,y+1,CL.dark)}
  }
}
function boatGrid(kind,race,ci,era){
  const k=KCOL[ci%KCOL.length],kd=sh(k,.7),kl=sh(k,1.2),key=rkey(race),L=RACES[race]||RACES[RB(race)]||RACES.human;
  const big=kind==='settler',W=big?23:14,H=big?17:11,B=BOAT_LOOK[key],g=G(W,H);
  let hc=B.hc,hd=B.hd,hl=B.hl;
  if(era>=5){hc=mixc(hc,CL.steelD,.45);hd=mixc(hd,CL.dark,.4);hl=mixc(hl,CL.steelL,.4)}
  const sailc=key==='elf'?[236,240,226]:key==='orc'?[158,116,80]:key==='dwarf'?[190,170,130]:key==='goblin'?[170,150,100]:key==='saurian'?JADE:k;
  const hh=big?4:3,hy=H-hh;let deck=hy,mastX=big?10:6,mastTop=1;
  const crew=(xs)=>{for(const x of xs){gp(g,x,deck-1,L.skins[0]);gp(g,x,deck-2,L.hairs[0])}};
  const pennant=(x,y)=>{gr(g,x,y,3,2,k);gp(g,x+2,y+1,kd);gp(g,x,y+2,CL.woodD)};
  const rig=(mx,top,sw,shh)=>{gr(g,mx,top,1,deck-top,CL.woodD);boatSail(g,key,mx+1,top+1,sw,shh,sailc,k);gr(g,mx-sw,top+1,sw,shh,sailc);};
  if(era===0){
    if(big){ /* raft of lashed logs with an awning */
      for(let i=0;i<3;i++)gr(g,1,H-4+i*1+ (i?0:0),W-2,1,i%2?hc:hl);gr(g,0,H-1,W,1,hd);gr(g,1,H-4,W-2,3,hc);for(let x=3;x<W-2;x+=4)gr(g,x,H-4,1,3,hd);for(let i=0;i<3;i++)gr(g,1,H-4+i,W-2,1,i%2?hc:hl);gr(g,1,H-1,W-2,1,hd);
      deck=H-4;gr(g,13,5,1,7,CL.woodD);gr(g,19,5,1,7,CL.woodD);for(let r=0;r<4;r++)gr(g,12-r*0,5+r,9,1,r%2?CL.hide:CL.hideD);gr(g,12,5,9,1,k);
      crew([4,7,10,15,17]);
    }else{
      hullShape(g,1,hy,W-2,2,hc,hd,hl,2);gp(g,0,hy-1,hc);gp(g,W-1,hy-1,hc);gp(g,W-1,hy-2,hl);deck=hy;
      gp(g,6,hy-1,L.skins[0]);gp(g,6,hy-2,L.hairs[0]);gp(g,5,hy-1,CL.woodD);gr(g,9,hy-1,3,1,CL.wood);gp(g,11,hy,CL.woodD);gr(g,10,H-1,2,1,[150,190,220]);
    }
  }else if(era===1){
    hullShape(g,1,hy,W-2,hh-1,hc,hd,hl,1);gr(g,W-3,hy-1,2,1,hl);gp(g,0,hy-1,hl);deck=hy;
    if(key==='saurian'||key==='elf')for(let x=3;x<W-3;x+=3)gp(g,x,hy+1,CL.leafD);
    rig(mastX,mastTop+(big?1:1),big?8:5,big?7:5);
    for(let x=2;x<W-2;x+=3){gp(g,x,H-1,CL.woodD);gp(g,x-1,H,CL.woodD)}
    if(big)crew([3,5,8,13,16,18]);else crew([3]);pennant(mastX,0);
  }else if(era===2){
    hullShape(g,1,hy,W-2,hh-1,hc,hd,hl,1);gr(g,0,hy-1,2,1,hl);gr(g,W-2,hy-1,2,1,hl);gp(g,0,hy-2,hl);gp(g,W-1,hy-2,hl);gp(g,W-1,hy-3,B.hl);deck=hy;
    for(let x=3;x<W-3;x+=3)gp(g,x,hy,x%2?k:CL.steelL);
    rig(mastX,mastTop,big?9:6,big?8:6);gr(g,1,H-1,W-2,1,hd);
    if(big)crew([3,5,14,17,19]);else crew([3,9]);pennant(mastX,0);
  }else if(era===3){
    hullShape(g,0,hy,W,hh,hc,hd,hl,.5);gr(g,0,hy-2,4,2,hd);gr(g,0,hy-2,4,1,hc);gr(g,W-4,hy-1,4,1,hc);deck=hy;
    rig(mastX,mastTop,big?9:6,big?8:6);gr(g,mastX-1,mastTop,3,1,hd);
    for(let x=5;x<W-4;x+=4)gp(g,x,hy+1,CL.dark);gr(g,2,hy-3,1,1,k);
    if(big)crew([6,8,16,18]);else crew([4,10]);pennant(mastX,0);
  }else if(era===4){
    hullShape(g,0,hy-1,W,hh,hc,hd,hl,.5);gr(g,0,hy-3,5,2,hd);gr(g,0,hy-3,5,1,hc);gr(g,W-3,hy-2,3,1,hc);deck=hy-1;
    for(let x=4;x<W-3;x+=3){gp(g,x,hy,CL.dark);gp(g,x,hy+1,hl)}
    if(big){rig(7,2,7,6);gr(g,7,9,1,0,CL.woodD);rig(16,3,6,6);gr(g,7,8,1,deck-8,CL.woodD);gr(g,6,0,1,2,CL.woodD);pennant(7,0);pennant(16,1);crew([3,10,12,20])}
    else{rig(6,2,5,5);gr(g,4,3,1,0,sailc);gr(g,6,1,1,1,CL.woodD);pennant(6,0);crew([3,10])}
  }else if(era===5){ /* paddle steamer */
    hullShape(g,0,hy,W,hh,hc,hd,hl,.34);deck=hy;
    gr(g,big?7:4,hy-(big?4:3),big?9:6,big?4:3,mixc(WHITE7,hc,.2));gr(g,big?7:4,hy-(big?4:3),big?9:6,1,k);
    for(let x=(big?8:5);x<(big?15:9);x+=3)gr(g,x,hy-(big?3:2),2,1,[120,180,220]);
    const fx=big?10:6;gr(g,fx,hy-(big?9:7),3,big?5:4,CL.dark);gr(g,fx,hy-(big?8:6),3,1,CL.red);gp(g,fx+1,hy-(big?10:8),[200,200,210]);gp(g,fx+2,hy-(big?11:9),[216,216,226]);
    gell(g,2.5,hy+1,2.2,2.2,CL.steelD);gell(g,2.5,hy+1,1,1,CL.steelL);gr(g,0,hy-1,3,1,hd);
    if(big)crew([14,16,19,21]);else crew([12]);
  }else if(era===6){ /* steel motor ship */
    hullShape(g,0,hy,W,hh,hc,hd,hl,.34);gr(g,1,hy+1,W-2,1,CL.red);deck=hy;
    gr(g,2,hy-(big?4:3),big?7:5,big?4:3,WHITE7);gr(g,2,hy-(big?4:3),big?7:5,1,k);for(let x=3;x<(big?8:6);x+=2)gp(g,x,hy-(big?3:2),[90,140,200]);
    gr(g,big?5:4,hy-(big?7:5),1,big?3:2,CL.steelL);gp(g,big?5:4,hy-(big?8:6),CL.red);
    if(big){for(let i=0;i<3;i++){const c=i===0?k:i===1?[236,200,70]:[60,120,190];gr(g,10+i*4,hy-3,3,3,c);gr(g,10+i*4,hy-3,3,1,sh(c,1.25))}crew([20])}
    else{gr(g,W-5,hy-4,1,4,CL.steelD);gr(g,W-8,hy-4,4,1,CL.steelD);gp(g,W-4,hy-3,CL.steelL);gr(g,W-7,hy-1,2,1,CL.hide)}
  }else{ /* hovercraft / hydrofoil */
    gr(g,0,hy+1,W,hh-2,WHITE7);for(let i=0;i<hh-1;i++){gr(g,0,hy+i,W-i*2+ (i?0:0),1,i?WHITE7D:WHITE7);}
    gr(g,0,hy,W-1,1,WHITE7);gr(g,W-3,hy,3,1,WHITE7);gp(g,W-1,hy-0,WHITE7);gr(g,1,hy+hh-2,W-3,1,CYAN);gr(g,0,hy+hh-1,W-2,1,CYAND);
    deck=hy;const cw=big?11:6;gell(g,5+cw/2,hy-1,cw/2,big?3.5:2.4,[56,100,140]);gell(g,5+cw/2,hy-1,cw/2-1,big?2.6:1.6,[140,240,255]);gclr(g,0,hy,W,hh);
    gr(g,0,hy,W,hh-1,WHITE7);gr(g,0,hy+hh-2,W,1,CYAN);gr(g,0,hy+hh-1,W,1,CYAND);gr(g,0,hy,W,1,WHITE7);gp(g,0,hy,null);gr(g,W-4,hy-1,3,1,WHITE7);gr(g,W-2,hy,2,1,WHITE7);
    gr(g,1,hy+hh-1,W-3,1,CYAND);gr(g,3,hy+1,W-6,1,k);
    if(big){for(let i=0;i<3;i++)gp(g,4+i*3,hy-3+ (i&1),CL.white);crew([14,16,18])}
    gp(g,3,H-1,CYAN);gp(g,W-5,H-1,CYAN);gr(g,1,hy-1,3,1,k);
  }
  /* each people's mark on the vessel */
  if(key==='elf'){gp(g,W-1,hy-1,hl);gp(g,W-1,hy-2,hl);gp(g,W-2,hy-3,hl);gp(g,W-1,hy-3,CL.gold);gp(g,W-3,hy-3,hl);gr(g,2,deck,W-4,1,CL.gold)}
  else if(key==='dwarf'){for(let x=2;x<W-2;x+=3)gp(g,x,deck+1,hl);gp(g,W>>1,deck+1,CL.fire2)}
  else if(key==='orc'){for(let x=3;x<W-3;x+=3)gp(g,x,deck-1,CL.tusk);skullAt(g,W-3,Math.max(0,deck-3))}
  else if(key==='gnome'){for(let x=3;x<W-3;x+=4)gp(g,x,deck+1,CL.glow);gear(g,2,deck-1,BRONZE)}
  else if(key==='goblin'){for(let i=0;i<4;i++){const px=2+((ah(i,1,4)*(W-6))|0);gr(g,px,deck+(hh>2?1:0),2,1,ah(i,2,4)<.5?CL.steelD:CL.hide)}gp(g,W-1,deck-1,CL.tusk)}
  else if(key==='saurian'){for(let x=2;x<W-2;x+=2)gp(g,x,deck+1,JADED);gp(g,W-1,deck-1,CL.gold);gp(g,W-1,deck-2,JADE)}
  return g;
}
function boatSprite(kind,race,ci,era){
  era=Math.max(0,Math.min(7,era|0));
  return spr(`boat|${kind}|${race}|${ci}|${era}`,()=>bake(boatGrid(kind,race,ci,era)));
}
/* monuments: the physical works of art each people leaves behind */
function monumentGrid(race,k,dom){
  const kd=sh(k,.7),kl=sh(k,1.2),dc=DOMAINS[dom].c;let g;
  if(race==='human'){
    g=G(12,20);
    gbricks(g,1,15,10,5,CL.stone,CL.stoneD);gr(g,0,14,12,1,CL.stoneL);gr(g,1,13,10,1,CL.stoneD);
    gr(g,4,11,1,3,CL.stone);gr(g,7,11,1,3,CL.stone);
    gr(g,4,5,4,6,CL.stoneL);gr(g,4,5,1,6,CL.stone);
    gr(g,3,5,1,8,k);gp(g,3,13,kd);
    gr(g,5,2,2,3,CL.stoneL);gp(g,5,2,CL.stone);
    gr(g,8,5,1,3,CL.stoneL);gr(g,9,0,1,8,CL.steelL);gr(g,8,7,3,1,CL.gold);
    gr(g,1,7,2,4,k);gp(g,1,7,kl);gp(g,2,8,CL.gold);
  }else if(race==='elf'){
    g=G(12,22);
    for(let y=0;y<14;y++){const hw=y<=7?((y*.65)|0)+1:Math.max(0,((14-y)*.7)|0);
      for(let x=6-hw;x<6+hw;x++)gp(g,x,y,x<6?[190,246,238]:[110,196,196])}
    gp(g,5,3,[240,255,252]);gp(g,5,4,[240,255,252]);gp(g,6,6,dc);gp(g,5,7,dc);
    gr(g,5,14,2,3,CL.wood);gr(g,3,17,6,1,CL.woodD);gr(g,2,18,8,1,CL.woodD);
    gell(g,3,19,2.5,1.8,CL.leaf);gell(g,9,19,2.5,1.8,CL.leafL);gp(g,6,18,CL.leafD);
    gp(g,1,5,CL.glow);gp(g,10,8,CL.glow);gp(g,2,11,CL.glow);gp(g,9,3,CL.glow);
  }else if(race==='dwarf'){
    g=G(10,20);
    gbricks(g,1,16,8,4,CL.stone,CL.stoneD);gr(g,0,15,10,1,CL.stoneL);
    gr(g,2,3,6,12,CL.stoneL);gr(g,2,3,1,12,CL.stone);gr(g,7,3,1,12,CL.stoneD);
    gr(g,3,1,4,2,CL.stoneL);gr(g,4,0,2,1,CL.stoneL);gp(g,4,0,[120,230,240]);gp(g,5,0,[190,250,255]);
    for(const [x,y] of [[4,5],[5,5],[4,6],[5,8],[4,9],[5,9],[4,12],[5,11],[5,12]])gp(g,x,y,dc);
    gp(g,3,7,CL.fire2);gp(g,6,7,CL.fire2);
  }else{
    g=G(10,22);
    gr(g,4,3,2,17,CL.wood);gr(g,4,3,1,17,CL.woodD);
    for(const y of [4,9,14]){gr(g,3,y,4,3,CL.tusk);gp(g,3,y+1,CL.dark);gp(g,6,y+1,CL.dark);gp(g,4,y+3,CL.tusk);gp(g,5,y+3,CL.tusk)}
    gp(g,2,4,CL.tusk);gp(g,1,3,CL.tusk);gp(g,7,4,CL.tusk);gp(g,8,3,CL.tusk);
    gr(g,6,0,4,3,k);gp(g,7,1,CL.tusk);gp(g,8,1,CL.tusk);gr(g,5,0,1,4,CL.woodD);
    gr(g,2,19,6,2,CL.stoneD);gp(g,1,20,CL.tusk);gp(g,8,20,CL.tusk);gp(g,3,18,CL.fire2);gp(g,6,18,CL.fire2);gp(g,5,2,CL.fire1);
  }
  return g;
}
