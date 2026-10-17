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

/* ---------- animals ---------- */
function legs2(g,fr,xs,y,h,c){xs.forEach((x,k)=>{const off=fr&&(k%2)?1:0;gr(g,x+(fr?(k%2?1:-0):0),y,1,h,c)})}
function animalSprite(sp,fr,v,male,saddle){
  let g;
  if(sp==='spiderling')sp='spider';else if(sp==='imp')sp='demon';
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
