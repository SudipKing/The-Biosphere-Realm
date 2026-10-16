"use strict";
/* ============ Pixel-art sprites, generated in code (all original designs) ============ */
const CL={steel:[178,184,196],steelL:[226,230,238],steelD:[104,110,124],wood:[134,90,54],woodD:[92,60,36],gold:[234,190,60],
  tusk:[242,236,214],eye:[30,24,24],red:[226,44,30],plaster:[238,228,204],glass:[150,200,226],
  glow:[255,222,120],stone:[150,146,140],stoneD:[112,108,104],stoneL:[190,186,178],leaf:[66,146,62],leafD:[40,104,48],
  leafL:[118,188,84],hide:[168,126,84],hideD:[124,88,56],dark:[46,34,34],belt:[92,62,40],boot:[56,42,34],
  wool:[246,244,236],woolD:[208,206,198],sheepH:[70,62,62],fur:[134,130,138],furD:[90,86,96],furL:[186,182,188],
  marble:[234,234,242],marbleD:[196,198,214],fire1:[255,232,112],fire2:[255,150,40],fire3:[222,70,30],moss:[98,152,70],
  pink:[240,168,172],pinkD:[204,124,134],yellow:[246,196,60],white:[248,246,240]};
const OUTC=[34,24,30];
function G(w,h){return{w,h,d:new Array(w*h).fill(null)}}
function gp(g,x,y,c){x|=0;y|=0;if(c&&x>=0&&y>=0&&x<g.w&&y<g.h)g.d[y*g.w+x]=c}
function gr(g,x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)gp(g,x+i,y+j,c)}
function gclr(g,x,y,w,h){for(let j=0;j<h;j++)for(let i=0;i<w;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<g.w&&Y<g.h)g.d[Y*g.w+X]=null}}
function gell(g,cx,cy,rx,ry,c){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)gp(g,x,y,c)}}
function gmap(g,x0,y0,rows,pal){rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=pal[row[x]];if(c)gp(g,x0+x,y0+y,c)}})}
function gbricks(g,x0,y0,w,h,base,mortar,keep){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const X=x0+x,Y=y0+y;if(X<0||Y<0||X>=g.w||Y>=g.h)continue;
    if(keep&&!g.d[Y*g.w+X])continue;
    g.d[Y*g.w+X]=(y%3===2||((x+((y/3|0)%2)*2)%4===3))?mortar:base;
  }
}
function gsym(g,x0,y0,dom){gmap(g,x0,y0,DOMAINS[dom].sym,{'#':DOMAINS[dom].c})}
function bake(g,outline=true){
  const w=g.w+2,h=g.h+2,c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d'),im=x.createImageData(w,h),d=im.data;
  const at=(X,Y)=>X>=0&&Y>=0&&X<g.w&&Y<g.h?g.d[Y*g.w+X]:null;
  for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){
    let col=at(X-1,Y-1);
    if(!col&&outline&&(at(X-2,Y-1)||at(X,Y-1)||at(X-1,Y-2)||at(X-1,Y)))col=OUTC;
    if(col){const o=(Y*w+X)*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=col.length>3?col[3]:255}
  }
  x.putImageData(im,0,0);return{c,w,h,f:null};
}
function flipped(s){
  if(!s.f){const c=document.createElement('canvas');c.width=s.w;c.height=s.h;const x=c.getContext('2d');x.translate(s.w,0);x.scale(-1,1);x.drawImage(s.c,0,0);s.f=c}
  return s.f;
}
const SPR=new Map();
function spr(key,make){let s=SPR.get(key);if(!s){s=make();SPR.set(key,s)}return s}

/* ---------- people ---------- */
function personSprite(race,si,hi,col,fr,job){
  const L=RACES[race],s=L.skins[si],sd=sh(s,.8),h=L.hairs[hi],hd=sh(h,.72),k=col,kd=sh(col,.68),kl=sh(col,1.2),p=L.pants,g=G(11,12);
  const legs=()=>{if(fr===0){gr(g,3,9,1,2,p);gr(g,5,9,1,2,p);gr(g,2,11,2,1,CL.boot);gr(g,5,11,2,1,CL.boot)}else{gr(g,3,9,2,2,p);gr(g,3,11,3,1,CL.boot)}};
  if(race==='human'){
    legs();
    gr(g,3,5,3,4,k);gr(g,3,5,1,4,kd);gr(g,3,8,3,1,CL.belt);gp(g,4,8,CL.gold);
    gp(g,2,5,kd);gp(g,2,6,kd);gp(g,2,7,sd);
    gr(g,3,1,4,4,s);gp(g,3,4,sd);gp(g,6,4,sd);
    gr(g,3,0,3,1,h);gr(g,3,1,4,1,h);gr(g,3,2,1,2,hd);
    gp(g,5,2,CL.eye);
    gp(g,6,5,k);gp(g,6,6,k);gp(g,7,7,s);
  }else if(race==='elf'){
    legs();
    gr(g,3,5,1,5,kd);gr(g,4,5,2,4,k);gp(g,5,5,kl);gr(g,4,8,2,1,CL.gold);
    gr(g,3,1,4,4,s);gp(g,6,4,sd);
    gr(g,3,0,3,1,h);gr(g,3,1,4,1,h);gr(g,3,2,1,4,h);gr(g,2,3,1,3,hd);
    gp(g,2,2,s);gp(g,1,1,s);
    gp(g,5,2,[40,120,86]);
    gp(g,6,5,kl);gp(g,7,4,s);
  }else if(race==='orc'){
    if(fr===0){gr(g,2,9,2,2,p);gr(g,5,9,2,2,p);gr(g,1,11,3,1,CL.boot);gr(g,5,11,3,1,CL.boot)}else{gr(g,3,9,3,2,p);gr(g,2,11,5,1,CL.boot)}
    gr(g,2,5,5,3,s);gr(g,2,5,1,3,sd);
    gp(g,3,5,k);gp(g,4,6,k);gp(g,5,7,k);
    gr(g,2,8,5,1,k);gp(g,4,8,CL.tusk);
    gr(g,1,4,3,2,CL.steelD);gp(g,1,3,CL.steelL);gp(g,3,3,CL.steelL);
    gr(g,1,6,1,2,sd);
    gr(g,3,1,4,3,s);gr(g,4,4,4,1,s);gr(g,4,1,3,1,sd);
    gp(g,3,0,h);gp(g,4,0,h);gp(g,3,1,h);
    gp(g,6,2,CL.red);gp(g,7,3,CL.tusk);
    gr(g,7,5,1,2,s);gp(g,7,7,s);
  }else if(race==='gnome'){
    if(fr===0){gp(g,3,10,p);gp(g,5,10,p);gr(g,2,11,2,1,CL.boot);gr(g,5,11,2,1,CL.boot)}else{gr(g,3,10,3,1,p);gr(g,3,11,3,1,CL.boot)}
    gr(g,3,7,4,3,k);gr(g,3,7,1,3,kd);gr(g,3,9,4,1,CL.belt);
    gr(g,3,4,4,3,s);gp(g,6,5,CL.pink);gp(g,5,4,CL.eye);
    const hat=[198,48,44];gr(g,2,3,6,1,sh(hat,.8));gr(g,3,2,4,1,hat);gr(g,4,1,3,1,hat);gp(g,5,0,hat);gp(g,6,0,sh(hat,1.2));gr(g,3,3,4,1,kl);
    gr(g,3,6,4,2,h);gr(g,4,8,2,1,h);gp(g,6,6,hd);
    gp(g,7,7,s);gp(g,2,7,kd);
  }else if(race==='goblin'){
    if(fr===0){gp(g,3,10,p);gp(g,5,10,p);gr(g,2,11,2,1,CL.boot);gr(g,5,11,2,1,CL.boot)}else{gr(g,3,10,3,1,p);gr(g,3,11,3,1,CL.boot)}
    gr(g,3,6,4,4,kd);gp(g,4,7,k);gp(g,5,8,k);gp(g,6,6,k);gr(g,3,9,4,1,CL.belt);
    gr(g,3,2,4,4,s);gp(g,3,5,sd);gp(g,6,5,sd);
    gp(g,1,2,s);gp(g,2,3,s);gp(g,2,2,sd);gp(g,8,2,s);gp(g,7,3,s);gp(g,7,2,sd);
    gp(g,4,3,[250,220,60]);gp(g,6,3,[250,220,60]);gr(g,4,5,2,1,CL.dark);gp(g,5,5,CL.tusk);
    gp(g,4,1,h);gp(g,5,1,h);gp(g,5,0,h);
    gp(g,7,6,s);gp(g,7,7,s);gp(g,2,7,s);
  }else if(race==='saurian'){
    legs();
    gr(g,3,5,3,4,k);gr(g,3,5,1,4,kd);gr(g,3,8,3,1,CL.gold);gp(g,5,6,sd);
    gr(g,3,1,4,3,s);gr(g,7,2,2,2,s);gp(g,8,3,sd);gp(g,8,2,CL.dark);gp(g,5,2,[250,200,40]);gr(g,3,3,4,1,sd);
    gp(g,3,0,h);gp(g,4,0,h);gp(g,2,1,h);gp(g,5,0,hd);
    gp(g,2,8,s);gp(g,1,9,s);gp(g,0,10,sd);gp(g,2,9,sd);
    gp(g,6,5,s);gp(g,6,6,s);gp(g,7,7,s);
  }else if(L.beast){
    /* an uplifted species: a person's body with the head of the creature it once was */
    const ear=L.beast.ear,mz=sh(s,1.18);
    legs();
    gr(g,3,5,4,4,k);gr(g,3,5,1,4,kd);gr(g,3,8,4,1,CL.belt);gp(g,5,8,CL.gold);
    gr(g,3,1,4,4,s);gr(g,3,4,4,1,sd);
    if(ear==='beak'){gr(g,7,2,2,1,[244,196,60]);gp(g,7,3,[214,160,40]);gp(g,4,0,h);gp(g,5,0,h);gp(g,3,0,hd)}
    else if(ear!=='none'){gr(g,6,3,2,2,mz);gp(g,8,3,mz);gp(g,8,3,CL.dark)}
    gp(g,5,2,CL.eye);
    if(ear==='pt'){gp(g,3,0,sd);gp(g,6,0,sd)}
    else if(ear==='rd'){gr(g,2,1,1,2,sd);gr(g,7,1,1,1,sd)}
    else if(ear==='long'){gp(g,4,0,s);gp(g,5,0,sd);gr(g,4,0,1,1,CL.pink)}
    else if(ear==='horn'){gp(g,3,0,CL.tusk);gp(g,6,0,CL.tusk);gp(g,2,0,CL.tusk)}
    else{gp(g,6,2,CL.eye);gr(g,4,3,2,1,sd)}
    gr(g,2,2,1,3,h);
    if(ear!=='beak'&&ear!=='none'){gp(g,2,8,s);gp(g,1,8,sd);gp(g,1,9,sd)}
    gp(g,7,6,s);gp(g,7,7,s);gp(g,2,6,kd);
  }else{
    if(fr===0){gp(g,3,10,p);gp(g,5,10,p);gr(g,2,11,2,1,CL.boot);gr(g,5,11,2,1,CL.boot)}else{gr(g,3,10,3,1,p);gr(g,3,11,3,1,CL.boot)}
    gr(g,2,6,5,4,k);gr(g,2,6,1,4,kd);gr(g,2,9,5,1,CL.belt);gp(g,4,9,CL.gold);
    gp(g,1,7,kd);gp(g,1,8,sd);
    gr(g,3,2,4,4,s);gp(g,7,4,sd);
    gr(g,3,1,4,2,CL.steel);gp(g,3,1,CL.steelL);gp(g,6,2,CL.steelD);
    gp(g,2,1,CL.tusk);gp(g,2,0,CL.tusk);
    gp(g,5,3,CL.eye);
    gr(g,4,4,3,1,h);gr(g,3,5,4,3,h);gr(g,4,8,2,1,hd);gp(g,3,6,hd);
    gp(g,7,7,k);gp(g,7,8,s);
  }
  if(job){jobHat(g,race,job);jobTool(g,race,job)}
  return bake(g);
}
/* what each job class carries and wears */
function jobTool(g,race,job){
  const W=CL.wood,WD=CL.woodD;
  switch(job){
    case'soldier':
      if(race==='human'){gr(g,8,1,1,5,CL.steel);gp(g,8,0,CL.steelL);gr(g,7,6,3,1,CL.gold);gp(g,8,7,WD);gr(g,2,6,1,3,[150,60,50]);gp(g,2,5,CL.steelL)}
      else if(race==='elf'){gp(g,8,0,W);gp(g,9,1,W);gr(g,9,2,1,4,W);gp(g,9,6,W);gp(g,8,7,W);gr(g,8,1,1,6,[226,222,210])}
      else if(race==='orc'){gr(g,8,2,1,8,W);gr(g,9,1,1,4,CL.steel);gp(g,10,2,CL.steelL);gp(g,10,3,CL.steelL)}
      else{gr(g,8,4,1,6,W);gr(g,7,2,3,2,CL.steel);gp(g,9,2,CL.steelL)}break;
    case'hunter':gp(g,8,0,W);gp(g,9,1,W);gr(g,9,2,1,4,W);gp(g,9,6,W);gp(g,8,7,W);gr(g,8,1,1,6,[226,222,210]);gr(g,1,6,2,3,[110,76,50]);break;
    case'farmer':gr(g,8,3,1,7,W);gp(g,7,2,CL.steel);gp(g,8,2,CL.steel);gp(g,9,2,CL.steel);gp(g,7,3,CL.steel);gp(g,9,3,CL.steel);break;
    case'miner':gr(g,8,3,1,7,W);gr(g,6,2,5,1,CL.steel);gp(g,6,3,CL.steel);gp(g,10,3,CL.steel);gp(g,10,2,CL.steelL);gr(g,1,8,2,2,[60,56,64]);break;
    case'woodcutter':gr(g,8,3,1,7,W);gr(g,9,2,2,3,CL.steel);gp(g,10,3,CL.steelL);gp(g,9,2,CL.steelL);break;
    case'builder':gr(g,8,4,1,6,W);gr(g,7,2,3,2,CL.stoneD);gp(g,7,2,CL.stoneL);gr(g,1,8,2,1,CL.wood);break;
    case'teacher':gr(g,7,5,3,3,[188,70,62]);gr(g,7,5,3,1,CL.white);gp(g,8,6,CL.gold);gr(g,8,0,1,0,W);break;
    case'priest':gr(g,8,0,1,10,WD);gp(g,8,0,[130,224,236]);gp(g,7,1,CL.gold);gp(g,9,1,CL.gold);gp(g,8,1,CL.gold);break;
  }
}
function jobHat(g,race,job){
  const hat={farmer:[232,200,100],miner:[222,172,44],soldier:CL.steel,builder:[238,140,44],priest:[240,236,226],woodcutter:[196,58,48],hunter:[66,118,70]}[job];
  if(!hat)return;
  const x0=race==='orc'?3:3,top=race==='dwarf'?0:0;
  if((job==='soldier'&&race==='dwarf')||race==='gnome')return;
  gr(g,x0,top,4,1,hat);
  if(job==='farmer'){gp(g,x0-1,top+1,hat);gp(g,x0+4,top+1,hat);gp(g,x0-1,top,sh(hat,.85))}
  if(job==='miner')gp(g,x0+1,top,[255,246,170]);
  if(job==='soldier'){gp(g,x0,top+1,CL.steelD);gp(g,x0+3,top+1,CL.steelD);gp(g,x0+1,top,CL.steelL)}
  if(job==='builder'){gp(g,x0-1,top+1,sh(hat,.8));gp(g,x0+4,top+1,sh(hat,.8))}
  if(job==='priest'){gp(g,x0,top+1,hat);gp(g,x0+3,top+1,hat)}
  if(job==='woodcutter')gr(g,x0,top+1,4,1,sh(hat,.8));
}


/* ---------- animals ---------- */
function legs2(g,fr,xs,y,h,c){xs.forEach((x,k)=>{const off=fr&&(k%2)?1:0;gr(g,x+(fr?(k%2?1:-0):0),y,1,h,c)})}
function animalSprite(sp,fr,v,male,saddle){
  let g;
  switch(sp){
    case'sheep':{g=G(10,7);const L=CL.sheepH;
      if(fr===0){gr(g,2,5,1,2,L);gr(g,6,5,1,2,L)}else{gr(g,3,5,1,2,L);gr(g,5,5,1,2,L)}
      gr(g,1,1,7,4,CL.wool);gr(g,2,0,5,1,CL.wool);gr(g,1,4,7,1,CL.woolD);gp(g,3,1,[255,255,255]);gp(g,5,2,CL.woolD);
      gr(g,7,1,2,3,L);gp(g,9,2,L);gp(g,7,0,L);gp(g,8,1,[200,190,190]);break}
    case'cow':{g=G(13,9);const wht=CL.white,blk=[40,36,38],tan=[150,96,60],spot=v%2?tan:blk;
      if(fr===0){gr(g,2,6,1,3,blk);gr(g,4,6,1,3,blk);gr(g,8,6,1,3,blk);gr(g,10,6,1,3,blk)}else{gr(g,3,6,1,3,blk);gr(g,4,6,1,2,blk);gr(g,8,6,1,2,blk);gr(g,9,6,1,3,blk)}
      gr(g,1,2,9,4,wht);gr(g,3,2,2,2,spot);gr(g,7,3,2,2,spot);gp(g,5,5,spot);gr(g,1,5,9,1,[220,216,208]);
      gp(g,6,6,CL.pink);gp(g,0,2,blk);gp(g,0,3,blk);gp(g,0,4,blk);
      gr(g,10,1,3,3,wht);gp(g,10,1,spot);gr(g,11,3,2,2,CL.pink);gp(g,12,4,CL.pinkD);gp(g,10,0,CL.tusk);gp(g,12,0,CL.tusk);gp(g,11,2,CL.eye);break}
    case'pig':{g=G(11,7);const p=CL.pink,pd=CL.pinkD;
      if(fr===0){gr(g,2,5,1,2,pd);gr(g,6,5,1,2,pd)}else{gr(g,3,5,1,2,pd);gr(g,5,5,1,2,pd)}
      gr(g,1,1,7,4,p);gr(g,1,4,7,1,pd);gp(g,3,1,[252,196,198]);
      gr(g,8,1,2,3,p);gr(g,10,2,1,2,pd);gp(g,8,0,pd);gp(g,9,1,CL.eye);gp(g,0,1,pd);gp(g,0,0,pd);break}
    case'chicken':{g=G(7,7);const b=v%2?[176,104,52]:CL.white,bd=v%2?[140,78,40]:[214,210,200];
      if(fr===0){gp(g,2,5,CL.yellow);gp(g,4,5,CL.yellow);gp(g,2,6,CL.yellow);gp(g,4,6,CL.yellow)}else{gp(g,3,5,CL.yellow);gr(g,2,6,3,1,CL.yellow)}
      gr(g,1,2,4,3,b);gp(g,0,1,b);gp(g,0,2,b);gr(g,1,4,4,1,bd);gp(g,2,3,bd);
      gr(g,4,0,2,2,b);gp(g,4,0,CL.red);gp(g,5,0,CL.red);gp(g,6,1,CL.yellow);gp(g,5,2,CL.red);gp(g,5,1,CL.eye);break}
    case'horse':{g=G(14,11);const cols=[[150,94,52],[60,48,44],[226,222,214],[128,124,124]],b=cols[v],bd=sh(b,.72),mn=v===2?[200,190,170]:[48,36,30];
      if(fr===0){gr(g,2,7,1,4,bd);gr(g,4,7,1,4,b);gr(g,8,7,1,4,bd);gr(g,10,7,1,4,b)}else{gr(g,3,7,1,4,bd);gr(g,4,7,1,3,b);gr(g,9,7,1,3,bd);gr(g,10,7,1,4,b)}
      gr(g,2,10,1,1,CL.dark);gr(g,10,10,1,1,CL.dark);
      gr(g,2,3,9,4,b);gr(g,2,6,9,1,bd);gr(g,9,1,2,4,b);gr(g,10,0,3,2,b);gr(g,12,2,2,1,b);gp(g,13,2,bd);gp(g,11,1,CL.eye);
      gp(g,9,0,mn);gr(g,8,1,1,3,mn);gp(g,1,3,mn);gp(g,0,4,mn);gp(g,0,5,mn);gp(g,1,4,mn);
      if(saddle){gr(g,5,2,3,2,saddle);gp(g,6,4,CL.gold)}break}
    case'deer':{g=G(12,12);const b=[178,126,74],bl=[230,200,156],bd=[130,88,50],ant=[214,196,160];
      if(fr===0){gr(g,3,9,1,3,bd);gr(g,8,9,1,3,bd)}else{gr(g,4,9,1,3,bd);gr(g,7,9,1,3,bd)}
      gr(g,2,6,7,3,b);gr(g,3,8,5,1,bl);gp(g,1,6,CL.white);gp(g,4,6,bl);gp(g,6,7,bl);
      gr(g,8,4,2,3,b);gr(g,9,3,2,2,b);gp(g,11,4,CL.dark);gp(g,9,2,bd);gp(g,10,3,CL.eye);
      if(male){gp(g,9,1,ant);gp(g,8,0,ant);gp(g,10,0,ant);gp(g,10,1,ant);gp(g,11,0,ant)}break}
    case'rabbit':{g=G(7,6);const b=v%2?[160,136,112]:[200,196,190],bd=sh(b,.75);
      if(fr===0){gp(g,1,5,bd);gp(g,4,5,bd)}else{gr(g,1,5,4,1,bd)}
      gr(g,1,3,4,2,b);gr(g,4,2,2,2,b);gp(g,4,0,b);gp(g,4,1,b);gp(g,5,1,bd);gp(g,5,2,CL.eye);gp(g,0,3,CL.white);gp(g,6,3,CL.pinkD);break}
    case'wolf':{g=G(12,7);const f=CL.fur,fd=CL.furD;
      if(fr===0){gr(g,2,5,1,2,fd);gr(g,7,5,1,2,fd)}else{gr(g,3,5,1,2,fd);gr(g,6,5,1,2,fd)}
      gr(g,1,2,8,3,f);gr(g,1,2,8,1,fd);gr(g,2,4,6,1,CL.furL);
      gp(g,0,1,fd);gp(g,0,2,f);
      gr(g,8,1,3,3,f);gp(g,11,3,f);gp(g,8,0,fd);gp(g,10,0,fd);gp(g,9,2,[244,204,60]);gp(g,11,2,CL.dark);break}
    case'bear':{g=G(15,10);const b=[100,68,44],bd=[70,46,30],bl=[156,116,82];
      if(fr===0){gr(g,2,7,2,3,bd);gr(g,9,7,2,3,bd)}else{gr(g,3,7,2,3,bd);gr(g,8,7,2,3,bd)}
      gr(g,1,2,10,5,b);gr(g,3,1,5,1,b);gr(g,1,6,10,1,bd);gp(g,4,2,bl);gp(g,5,2,bl);
      gr(g,10,2,4,4,b);gp(g,10,1,bd);gp(g,12,1,bd);gr(g,13,4,2,2,bl);gp(g,14,4,CL.dark);gp(g,12,3,CL.eye);break}
    case'fox':{g=G(11,6);const o=[222,120,42],od=[170,84,30],w=CL.white;
      if(fr===0){gp(g,3,5,CL.dark);gp(g,7,5,CL.dark)}else{gp(g,4,5,CL.dark);gp(g,6,5,CL.dark)}
      gr(g,2,2,6,3,o);gr(g,2,4,6,1,od);gr(g,0,1,3,2,o);gp(g,0,1,w);gp(g,0,2,w);
      gr(g,8,1,2,2,o);gp(g,10,2,o);gp(g,10,3,w);gp(g,8,0,CL.dark);gp(g,9,0,od);gp(g,9,1,CL.eye);gp(g,8,3,w);break}
    case'buffalo':{g=G(16,11);const b=[88,58,40],bd=[56,38,28],bl=[128,92,62];
      if(fr===0){gr(g,3,8,2,3,bd);gr(g,6,8,2,3,bd);gr(g,10,8,1,3,bd)}else{gr(g,4,8,2,3,bd);gr(g,7,8,2,3,bd);gr(g,11,8,1,3,bd)}
      gr(g,2,3,10,5,b);gr(g,3,1,6,2,bd);gr(g,4,0,3,1,bd);gr(g,2,7,10,1,bd);gr(g,5,3,3,1,bl);
      gr(g,11,3,4,5,bd);gr(g,12,2,3,1,b);gp(g,11,2,CL.tusk);gp(g,14,2,CL.tusk);gp(g,10,1,CL.tusk);gp(g,13,4,CL.eye);gr(g,14,6,2,2,[60,44,40]);gp(g,0,4,bd);gp(g,1,3,bd);gp(g,1,4,bd);break}
    case'dog':{g=G(11,8);const b=v%2?[200,152,92]:[126,88,54],bd=sh(b,.7);
      if(fr===0){gr(g,2,6,1,2,bd);gr(g,7,6,1,2,bd)}else{gr(g,3,6,1,2,bd);gr(g,6,6,1,2,bd)}
      gr(g,1,3,7,3,b);gr(g,1,5,7,1,bd);gp(g,0,2,b);gp(g,0,1,b);gp(g,8,5,CL.white);
      gr(g,7,1,3,3,b);gp(g,10,3,CL.dark);gp(g,9,2,CL.eye);gp(g,7,2,bd);gp(g,7,3,bd);gp(g,8,1,bd);break}
    case'cat':{g=G(10,8);const b=v%2?[228,142,62]:[72,68,80],bd=sh(b,.68);
      if(fr===0){gr(g,2,6,1,2,bd);gr(g,6,6,1,2,bd)}else{gr(g,3,6,1,2,bd);gr(g,5,6,1,2,bd)}
      gr(g,2,4,5,2,b);gr(g,2,5,5,1,bd);gp(g,1,4,b);gp(g,0,3,b);gp(g,0,2,b);gp(g,0,1,bd);
      gr(g,7,2,3,3,b);gp(g,7,1,b);gp(g,9,1,b);gp(g,9,3,[120,220,100]);gp(g,10-1,4,CL.pinkD);break}
    case'rat':{g=G(8,4);const b=[120,114,120],bd=[84,80,88];
      if(fr===0){gp(g,2,3,bd);gp(g,5,3,bd)}else{gp(g,3,3,bd);gp(g,4,3,bd)}
      gr(g,2,1,4,2,b);gr(g,5,0,2,2,b);gp(g,7,1,CL.pinkD);gp(g,6,0,CL.eye);gp(g,5,0,bd);gr(g,0,2,2,1,CL.pinkD);gp(g,0,1,CL.pinkD);break}
    case'crab':{g=G(9,6);const c=[220,70,52],cd=[156,44,38];
      if(fr===0){gp(g,1,4,cd);gp(g,3,5,cd);gp(g,5,5,cd);gp(g,7,4,cd)}else{gp(g,1,5,cd);gp(g,3,4,cd);gp(g,5,4,cd);gp(g,7,5,cd)}
      gr(g,2,3,5,2,c);gr(g,3,2,3,1,c);gp(g,0,1,c);gp(g,0,2,c);gp(g,1,2,c);gp(g,8,1,c);gp(g,8,2,c);gp(g,7,2,c);gp(g,0,0,cd);gp(g,8,0,cd);gp(g,3,1,CL.eye);gp(g,5,1,CL.eye);break}
    case'turtle':{g=G(11,7);const sg=[64,128,70],sd=[38,88,52],sk=[150,176,100];
      if(fr===0){gr(g,2,5,2,2,sk);gr(g,7,5,2,2,sk)}else{gr(g,3,5,2,2,sk);gr(g,6,5,2,2,sk)}
      gell(g,5,3.5,4.2,2.6,sg);gr(g,2,5,7,1,sd);gp(g,4,2,sd);gp(g,6,2,sd);gp(g,5,3,sd);gp(g,3,3,sd);gp(g,7,3,sd);
      gr(g,8,2,3,3,sk);gp(g,10,3,CL.eye);gp(g,0,4,sk);break}
    case'crow':{g=G(9,6);const b=[34,32,42],bl=[84,82,104];
      if(fr===0){gp(g,2,0,b);gp(g,3,1,b);gp(g,4,1,b);gp(g,5,0,b)}else{gp(g,2,4,b);gp(g,3,4,b);gp(g,4,4,b);gp(g,5,4,b)}
      gr(g,1,2,5,2,b);gr(g,2,2,3,1,bl);gr(g,0,2,2,1,b);gr(g,6,1,2,2,b);gp(g,8,2,[220,180,60]);gp(g,7,1,CL.white);break}
    case'eagle':{g=G(14,10);const b=[116,78,44],bd=[78,52,32],w=CL.white,bk=[244,200,56];
      if(fr===0){gr(g,3,0,7,2,bd);gr(g,2,2,2,1,bd);gr(g,9,2,2,1,bd);gp(g,1,1,bd);gp(g,11,1,bd)}else{gr(g,3,6,7,2,bd);gr(g,2,5,2,1,bd);gr(g,9,5,2,1,bd);gp(g,1,6,bd);gp(g,11,6,bd)}
      gr(g,3,3,7,3,b);gr(g,4,3,5,1,bd);gr(g,0,4,3,2,b);gp(g,0,5,bd);
      gr(g,10,2,3,3,w);gp(g,13,3,bk);gp(g,12,3,bk);gp(g,11,3,CL.eye);gp(g,10,6,bk);gp(g,8,6,bk);break}
    case'skeleton':{g=G(11,12);const bn=[234,230,212],bd=[170,166,150];
      if(fr===0){gr(g,3,9,1,3,bn);gr(g,5,9,1,3,bn);gr(g,2,11,2,1,bd);gr(g,5,11,2,1,bd)}else{gr(g,3,9,2,3,bn);gr(g,3,11,3,1,bd)}
      gr(g,3,8,3,1,bd);gr(g,4,5,1,3,bn);gr(g,3,5,3,1,bn);gr(g,3,7,3,1,bn);gp(g,3,6,bd);gp(g,5,6,bd);
      gp(g,2,5,bn);gp(g,2,6,bn);gp(g,6,5,bn);gp(g,6,6,bn);gp(g,7,7,bn);
      gr(g,3,1,4,3,bn);gr(g,3,0,3,1,bn);gp(g,4,2,CL.dark);gp(g,6,2,CL.dark);gr(g,4,4,2,1,bd);gp(g,5,3,bd);
      gr(g,8,2,1,6,CL.steel);gp(g,8,1,CL.steelL);gr(g,7,8,3,1,CL.woodD);gp(g,8,9,CL.woodD);break}
    case'zombie':{g=G(11,12);const sk=[118,156,98],sd=[84,118,72],sh1=[88,92,132],pn=[70,60,50];
      if(fr===0){gr(g,3,9,1,3,pn);gr(g,5,9,1,3,pn);gr(g,2,11,2,1,CL.boot);gr(g,5,11,2,1,CL.boot)}else{gr(g,3,9,2,3,pn);gr(g,3,11,3,1,CL.boot)}
      gr(g,3,5,4,4,sh1);gp(g,3,8,pn);gp(g,5,7,sk);gp(g,4,8,sk);
      gr(g,7,5,3,1,sk);gr(g,9,5,1,1,sd);gr(g,7,6,2,1,sd);gp(g,2,6,sk);
      gr(g,3,1,4,4,sk);gp(g,3,4,sd);gp(g,6,4,sd);gp(g,4,2,CL.red);gp(g,6,2,[240,240,200]);gr(g,4,0,2,1,[60,70,50]);gp(g,5,4,CL.dark);break}
    case'dragon':{g=G(26,19);const b=[170,40,38],bd=[116,26,30],bl=[236,178,92],wg=[130,30,60],wl=[196,66,86];
      if(fr===0){for(let k=0;k<11;k++){const top=Math.max(0,5-((k*.55)|0));gr(g,5+k,top,1,8-top,k%3===0?wl:wg)}}
      else{for(let k=0;k<11;k++){gr(g,5+k,9,1,2+((k*.6)|0),k%3===0?wl:wg)}}
      gell(g,12,11,7.5,3.8,b);gell(g,12,12.4,6.5,1.9,bl);
      gr(g,17,7,3,5,b);gr(g,19,5,5,3,b);gr(g,23,6,3,2,b);gp(g,25,7,bd);gp(g,24,8,CL.white);
      gp(g,20,3,bl);gp(g,21,4,bl);gp(g,22,4,bl);gp(g,21,5,[255,222,60]);gp(g,24,6,[40,20,20]);
      gr(g,2,12,6,2,b);gr(g,0,13,3,1,bd);gp(g,0,12,bl);gp(g,1,11,bl);
      gr(g,10,14,2,3,bd);gr(g,14,14,2,3,bd);gp(g,10,17,bl);gp(g,14,17,bl);
      for(const x of [8,10,12,14])gp(g,x,7+(x%3===0?0:1),bd);break}
    case'wraith':{g=G(10,14);const c=[160,200,230,200],cd=[110,150,196,200],cl=[220,240,255,210];
      gr(g,2,0,5,2,cd);gr(g,1,2,7,3,c);gr(g,0,5,9,4,c);gr(g,1,9,7,2,cd);
      const w=fr?[0,2,4,6,8]:[1,3,5,7];for(const x of w)gr(g,x,11,1,2+(x%2),cd);
      gr(g,3,2,3,2,[20,20,40,230]);gp(g,3,3,[255,70,70]);gp(g,5,3,[255,70,70]);gp(g,1,5,cl);gp(g,7,6,cl);gr(g,8,6,2,1,cl);gr(g,0,6,2,1,cl);break}
    case'spider':{g=G(13,8);const b=[40,34,48],bl=[96,60,120],red=[240,40,50];
      const L=(x,y,d)=>{gp(g,x,y,b);gp(g,x+d,y-1,b);gp(g,x+2*d,y,b);gp(g,x+2*d,y+1,b)};
      if(fr===0){L(4,3,-1);L(4,4,-1);L(7,3,1);L(7,4,1);gp(g,5,6,b);gp(g,7,6,b);gp(g,3,6,b);gp(g,9,6,b)}
      else{L(4,2,-1);L(4,5,-1);L(7,2,1);L(7,5,1);gp(g,4,7,b);gp(g,8,7,b);gp(g,2,5,b);gp(g,10,5,b)}
      gell(g,6.5,4,3,2.2,b);gp(g,6,3,bl);gp(g,7,3,bl);gr(g,8,3,2,2,b);gp(g,9,3,red);gp(g,9,4,red);gp(g,3,4,red);break}
    case'ogre':{g=G(16,17);const sk=[122,134,78],sd=[88,98,56],ls=[110,76,50];
      if(fr===0){gr(g,4,12,3,5,sd);gr(g,8,12,3,5,sd);gr(g,3,16,4,1,CL.boot);gr(g,8,16,4,1,CL.boot)}else{gr(g,5,12,5,5,sd);gr(g,4,16,7,1,CL.boot)}
      gr(g,3,5,9,7,sk);gr(g,3,5,2,7,sd);gr(g,3,11,9,2,ls);gp(g,7,11,CL.gold);gr(g,4,4,7,2,sk);
      gr(g,1,6,2,5,sk);gr(g,12,6,2,4,sk);gr(g,1,10,2,2,sd);
      gr(g,5,0,6,5,sk);gr(g,5,0,6,1,sd);gp(g,6,2,CL.red);gp(g,9,2,CL.red);gr(g,6,4,4,1,CL.tusk);gp(g,6,3,CL.tusk);gp(g,9,3,CL.tusk);gp(g,4,1,sd);gp(g,11,1,sd);
      gr(g,13,1,2,10,ls);gr(g,12,0,4,3,CL.woodD);gp(g,12,1,CL.stoneD);gp(g,15,2,CL.stoneD);break}
    default:g=faunaSprite(sp,fr,v,male);
  }
  return bake(g);
}
function animalKey(u,fr){const sad=u.sp==='horse'&&u.owner>=0?tribes[u.owner].ci:-1;return `a|${u.sp}|${fr}|${u.v}|${u.male?1:0}|${sad}`}
function animalSpr(u,fr){const sad=u.sp==='horse'&&u.owner>=0?sh(tribes[u.owner].color,.9):null;return spr(animalKey(u,fr),()=>animalSprite(u.sp,fr,u.v,u.male,sad))}

/* ---------- effects sprites ---------- */
function flameSprite(fr){
  const rows=fr?["....a...",".a..aa..",".a.aba..",".baabba.",".abbcba.","abbcccba",".abccbba","..bbcbb."]
               :["...a....","..aa..a.","..aba.a.",".abbaab.",".abcbba.","abcccbba","abcccba.",".bbcbb.."];
  const g=G(8,8);gmap(g,0,0,rows,{a:CL.fire3,b:CL.fire2,c:CL.fire1});return bake(g,false);
}
function birdSprite(fr,bat){const g=G(5,3),c=bat?[40,30,46]:[60,56,64];gmap(g,0,0,fr?["#...#",".#.#.","..#.."]:[".....","#####","..#.."],{'#':c});return bake(g,false)}
function ruinSprite(){
  const g=G(16,9);
  gr(g,2,4,3,5,CL.stone);gr(g,2,2,2,2,CL.stoneL);gr(g,9,6,5,3,CL.stoneD);gr(g,11,4,2,2,CL.stone);
  gr(g,6,7,3,2,CL.dark);gp(g,5,8,CL.stoneD);gp(g,14,8,CL.stone);gp(g,7,6,CL.woodD);
  return bake(g);
}
function glowSprite(r,g,b){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const gr2=x.createRadialGradient(32,32,0,32,32,32);
  gr2.addColorStop(0,`rgba(${r},${g},${b},.9)`);gr2.addColorStop(.35,`rgba(${r},${g},${b},.35)`);gr2.addColorStop(1,`rgba(${r},${g},${b},0)`);
  x.fillStyle=gr2;x.fillRect(0,0,64,64);return c;
}
function cloudTexture(dark){
  const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');
  for(let k=0;k<26;k++){
    const cx=R()*S,cy=R()*S,r=18+R()*46;
    for(const ox of [-S,0,S])for(const oy of [-S,0,S]){
      const g=x.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,r);
      g.addColorStop(0,dark?'rgba(10,14,30,.55)':'rgba(255,255,255,.7)');g.addColorStop(1,dark?'rgba(10,14,30,0)':'rgba(255,255,255,0)');
      x.fillStyle=g;x.fillRect(cx+ox-r,cy+oy-r,r*2,r*2);
    }
  }
  return c;
}

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
function buildingSprite(race,type,ci,dom,tier,v){
  if(type===3)return spr('ruin',ruinSprite);
  tier=type===4?0:(tier||0);v=type===0?(v||0):0;
  return spr(`b|${race}|${type}|${ci}|${dom}|${tier}|${v}`,()=>bake(type===4?monumentGrid(RB(race),KCOL[ci],dom):withProp(tierGrid({human:bHuman,elf:bElf,orc:bOrc,dwarf:bDwarf}[RB(race)](type,KCOL[ci],dom),tier),v,RB(race))));
}
const GLOWS=new Map();
function glowCol(c){const k=c.join();let g=GLOWS.get(k);if(!g){g=glowSprite(c[0],c[1],c[2]);GLOWS.set(k,g)}return g}
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
function boatSprite(kind,race,ci){
  return spr(`boat|${kind}|${race}|${ci}`,()=>{
    const k=KCOL[ci],kd=sh(k,.7),L=RACES[race];
    const sail=race==='elf'?[242,240,228]:race==='orc'?CL.hideD:race==='dwarf'?[196,170,130]:k;
    const stripe=sail===k?kd:k;
    if(kind==='fish'){
      const g=G(14,11);
      for(let y=0;y<6;y++)gr(g,7,y+1,Math.min(5,1+y),1,y===3?stripe:sail);
      gr(g,6,0,1,7,CL.woodD);
      gr(g,1,7,12,1,CL.wood);gr(g,2,8,10,1,CL.wood);gr(g,3,9,8,1,CL.woodD);gp(g,0,6,CL.wood);gp(g,13,6,CL.wood);
      gp(g,3,6,L.skins[0]);gp(g,3,5,L.hairs[0]);gr(g,10,6,2,1,[120,170,200]);
      return bake(g);
    }
    const g=G(20,14);
    gr(g,3,1,7,6,sail);gr(g,3,3,7,1,stripe);gr(g,11,2,6,5,sail);gr(g,11,4,6,1,stripe);
    gr(g,6,0,1,9,CL.woodD);gr(g,14,1,1,8,CL.woodD);gp(g,6,0,k);gp(g,14,0,k);
    for(const x of [3,8,11,16]){gp(g,x,8,L.skins[0]);gp(g,x,7,L.hairs[0])}
    gr(g,1,9,18,1,CL.wood);gr(g,2,10,16,1,CL.wood);gr(g,3,11,14,1,CL.woodD);gp(g,0,8,CL.wood);gp(g,19,8,CL.wood);gp(g,0,7,CL.woodD);gp(g,19,7,CL.woodD);
    gr(g,4,10,12,1,kd);
    return bake(g);
  });
}

/* the monolith: a black slab with runes that glow */
function monolithSprite(){
  const g=G(9,24),rn=[120,220,255],rl=[200,245,255];
  gr(g,1,2,7,20,[24,22,32]);gr(g,1,2,1,20,[52,50,68]);gr(g,7,2,1,20,[10,8,16]);gr(g,2,1,5,1,[34,32,46]);gr(g,3,0,3,1,[40,38,52]);
  gr(g,0,22,9,2,[70,66,74]);gr(g,0,22,9,1,[96,92,100]);
  for(const [x,y] of [[3,5],[5,6],[4,8],[3,10],[5,11],[4,13],[3,15],[5,16],[4,18]])gp(g,x,y,rn);
  gp(g,4,4,rl);gp(g,4,12,rl);gp(g,4,19,rl);
  return bake(g);
}

/* a village's bonfire: ring of stones, crossed logs and a flame that flickers over three frames */
function bonfireSprite(fr){
  return spr('fire|'+fr,()=>{
    const g=G(9,11);
    gr(g,0,8,9,2,CL.stoneD);for(const x of [0,2,4,6,8])gp(g,x,8,CL.stoneL);
    gr(g,1,7,7,1,CL.woodD);gr(g,2,6,5,1,CL.wood);
    const f=[[2,3,5],[3,2,4],[2,4,4]][fr];
    gr(g,3,f[0]+2,3,4,CL.fire3);gr(g,3,f[0]+3,3,3,CL.fire2);gr(g,4,f[0],1,3,CL.fire2);gr(g,4,f[0]+4,1,2,CL.fire1);
    gp(g,2,f[1]+3,CL.fire2);gp(g,6,f[2]+2,CL.fire2);
    return bake(g);
  });
}
