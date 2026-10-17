"use strict";
/* ============ More creatures and more god powers ============
   Everything here is original code-drawn art. Species data lives in SPECIES (data.js); this file holds their sprites
   (faunaSprite, called from animalSprite), voices (added to CALLS), habitats, special behaviours (FAUNA, called from
   updAnimal) and the extra powers (BRUSHFN, TAPS, BOMBS, lasting world effects WFX2 and their drawing FXDRAW).
   Loaded after audio.js and before render.js. Only read tables of other files at runtime. */

/* ---------- sprites: every one faces right and has two walk frames (fr 0 and 1) ---------- */
function faunaSprite(sp,fr,v,male){
  const g0={wool:CL.wool,dark:CL.dark,eye:CL.eye,white:CL.white};
  let g;
  switch(sp){
    case'goat':{g=G(11,10);const b=v%2?[238,234,224]:[176,146,112],bd=sh(b,.7),hn=[214,200,170];
      if(fr===0){gr(g,2,7,1,3,bd);gr(g,7,7,1,3,bd)}else{gr(g,3,7,1,3,bd);gr(g,6,7,1,3,bd)}
      gp(g,2,9,CL.dark);gp(g,7,9,CL.dark);
      gr(g,1,3,8,4,b);gr(g,1,6,8,1,bd);gp(g,0,3,b);gp(g,0,2,bd);gr(g,7,2,2,3,b);gr(g,8,1,3,3,b);
      gp(g,10,3,bd);gp(g,9,2,CL.eye);gp(g,8,0,hn);gp(g,7,0,hn);gp(g,10,1,bd);gp(g,10,4,hn);break}
    case'llama':{g=G(11,14);const c=v%2?[240,228,206]:[156,122,92],cd=sh(c,.75);
      if(fr===0){gr(g,2,10,1,4,cd);gr(g,6,10,1,4,cd)}else{gr(g,3,10,1,4,cd);gr(g,5,10,1,3,cd)}
      gr(g,1,5,7,5,c);gr(g,1,9,7,1,cd);gp(g,0,5,c);gp(g,3,6,sh(c,.9));gp(g,5,7,sh(c,.9));
      gr(g,7,2,2,4,c);gr(g,7,0,3,3,c);gp(g,7,-1,cd);gp(g,8,0,cd);gp(g,9,2,cd);gp(g,10,1,cd);gp(g,9,1,CL.eye);
      gp(g,7,0,cd);gp(g,9,0,cd);gp(g,8,3,c);gp(g,9,4,[190,70,70]);break}
    case'penguin':{g=G(7,10);const k=[34,38,56];
      gell(g,3.5,6,2.9,3.6,k);gell(g,4.1,6.5,1.7,2.7,CL.white);gell(g,3.5,2.4,2,2.1,k);
      gp(g,5,2,[246,160,40]);gp(g,6,2,[246,160,40]);gp(g,4,1,CL.white);gp(g,4,1,CL.white);gp(g,5,1,CL.eye);
      gp(g,1,5,k);gp(g,1,6,k);gp(g,0,6,k);
      if(fr===0)gr(g,2,9,2,1,[246,160,40]);else gr(g,3,9,3,1,[246,160,40]);break}
    case'frog':{g=G(8,5);const c=v%2?[96,178,72]:[70,140,60],cd=sh(c,.7),bl=[200,226,150];
      if(fr===0){gr(g,1,4,2,1,cd);gr(g,5,4,2,1,cd);gell(g,4,3,3,1.8,c);gr(g,2,4,4,1,bl)}
      else{gr(g,0,3,2,1,cd);gr(g,6,3,2,1,cd);gell(g,4,2.6,3,1.8,c);gr(g,2,3,4,1,bl);gr(g,1,4,1,1,cd);gr(g,6,4,1,1,cd)}
      gp(g,3,0,CL.white);gp(g,5,0,CL.white);gp(g,3,1,c);gp(g,5,1,c);gp(g,5,0,CL.eye);gp(g,7,3,cd);break}
    case'snake':{g=G(12,5);const c=v%2?[200,170,60]:[86,140,66],cd=sh(c,.62),bl=sh(c,1.25);
      const ox=fr?1:0;
      for(let k=0;k<9;k++){const y=2+Math.round(Math.sin((k+ox*2.2)*.9)*1.3);gp(g,k,y,k%2?c:cd);gp(g,k,y+1,cd)}
      gr(g,9,1+ox,2,2,bl);gp(g,11,2+ox,c);gp(g,10,1+ox,CL.eye);gp(g,11,3+ox,CL.red);break}
    case'monkey':{g=G(10,11);const b=[134,92,56],bd=[92,60,36],f=[226,190,146];
      if(fr===0){gr(g,2,8,1,3,bd);gr(g,5,8,1,3,bd)}else{gr(g,3,8,1,3,bd);gr(g,4,8,1,2,bd)}
      gr(g,2,4,4,5,b);gr(g,3,5,2,3,f);gr(g,6,5,1,1,bd);gp(g,7,6,bd);
      gr(g,0,2,1,6,bd);gp(g,1,1,bd);gp(g,1,2,bd);gp(g,0,8,bd);
      gr(g,4,1,4,3,b);gr(g,5,2,3,2,f);gp(g,3,2,b);gp(g,3,3,f);gp(g,7,2,CL.eye);gp(g,8,3,bd);gp(g,5,0,bd);break}
    case'raccoon':{g=G(11,7);const c=[128,126,134],cd=[78,76,90],cl=[184,182,190];
      if(fr===0){gr(g,3,5,1,2,cd);gr(g,7,5,1,2,cd)}else{gr(g,4,5,1,2,cd);gr(g,6,5,1,2,cd)}
      gr(g,2,2,6,3,c);gr(g,2,4,6,1,cl);gr(g,0,2,3,2,cd);gp(g,0,2,cl);gp(g,1,3,cl);gp(g,0,3,cd);gp(g,2,2,cd);
      gr(g,7,1,3,3,c);gr(g,7,2,3,1,[40,38,48]);gp(g,10,3,CL.dark);gp(g,7,0,cd);gp(g,9,0,cd);gp(g,9,2,[250,250,250]);break}
    case'hyena':{g=G(13,9);const c=[190,160,102],cd=[118,92,56],sp2=[92,70,44];
      if(fr===0){gr(g,3,6,1,3,cd);gr(g,8,6,1,3,cd)}else{gr(g,4,6,1,3,cd);gr(g,7,6,1,3,cd)}
      gr(g,2,3,8,3,c);gr(g,2,2,3,1,cd);gr(g,3,1,2,1,cd);gr(g,1,3,1,2,c);gp(g,0,4,cd);gr(g,2,5,8,1,sh(c,.8));
      gp(g,4,3,sp2);gp(g,6,4,sp2);gp(g,8,3,sp2);gp(g,5,5,sp2);
      gr(g,9,2,3,3,c);gr(g,11,3,2,2,[60,46,40]);gp(g,9,1,cd);gp(g,10,1,c);gp(g,10,2,[236,200,60]);gp(g,12,5,CL.white);break}
    case'rhino':{g=G(17,11);const c=[130,130,140],cd=[88,88,100],cl=[170,170,180],hn=[232,226,206];
      if(fr===0){gr(g,3,8,2,3,cd);gr(g,6,8,2,3,cd);gr(g,10,8,2,3,cd)}else{gr(g,4,8,2,3,cd);gr(g,7,8,2,3,cd);gr(g,9,8,2,3,cd)}
      gr(g,2,3,11,5,c);gr(g,2,7,11,1,cd);gr(g,4,3,5,1,cl);gr(g,1,4,1,3,cd);gp(g,0,5,cd);
      gr(g,12,3,4,5,c);gr(g,13,2,3,1,c);gr(g,14,8,2,1,cd);gp(g,12,2,cd);gp(g,13,1,cd);gr(g,15,1,1,2,hn);gp(g,16,2,hn);gp(g,14,0,hn);gp(g,14,4,CL.eye);gp(g,6,5,cd);gp(g,9,4,cd);break}
    case'armadillo':{g=G(11,7);const s=[150,132,118],sd=[100,86,78],sl=[196,178,160];
      if(fr===0){gp(g,2,6,sd);gp(g,6,6,sd)}else{gp(g,3,6,sd);gp(g,5,6,sd)}
      gell(g,4.5,3.4,3.6,2.6,s);for(const x of [2,4,6])gr(g,x,1,1,5,sd);gr(g,2,0,5,1,sl);gp(g,3,1,sl);gp(g,5,1,sl);
      gr(g,0,4,2,1,sd);gr(g,8,3,2,2,sl);gp(g,10,4,sl);gp(g,9,3,CL.eye);gp(g,8,2,sd);gp(g,9,2,sd);break}
    case'bee':{g=G(7,6);const y=[250,204,40];
      gr(g,2,3,3,2,y);gp(g,2,3,CL.dark);gp(g,4,4,CL.dark);gp(g,3,4,CL.dark);gp(g,5,3,[40,32,30]);gp(g,5,4,[40,32,30]);gp(g,1,4,CL.dark);gp(g,6,3,CL.eye);
      if(fr===0){gr(g,2,1,2,2,[226,240,252]);gp(g,4,2,[226,240,252])}else{gr(g,1,2,3,1,[226,240,252]);gr(g,3,1,2,1,[226,240,252])}break}
    case'butterfly':{g=G(8,7);const cs=[[236,100,160],[100,170,240],[250,160,50],[160,120,230]],c=cs[v&3],cd=sh(c,.7);
      gp(g,3,3,CL.dark);gp(g,4,3,CL.dark);gp(g,4,2,CL.dark);gp(g,5,2,CL.dark);
      if(fr===0){gr(g,1,0,2,3,c);gr(g,5,0,2,3,c);gp(g,2,1,CL.white);gp(g,6,1,CL.white);gr(g,2,3,1,2,cd);gr(g,6,3,1,1,cd)}
      else{gr(g,0,3,3,2,c);gr(g,5,3,3,2,c);gp(g,1,3,CL.white);gp(g,6,3,CL.white);gp(g,2,5,cd);gp(g,5,5,cd)}break}
    case'flamingo':{g=G(9,14);const c=[246,132,160],cd=[214,90,128],lg=[230,110,140];
      if(fr===0){gr(g,3,9,1,5,lg);gr(g,5,9,1,3,lg);gp(g,5,12,lg);gp(g,6,12,lg)}else{gr(g,4,9,1,5,lg);gr(g,3,9,1,3,lg);gp(g,2,12,lg);gp(g,3,12,lg)}
      gell(g,4,7,3.4,2.4,c);gr(g,1,7,2,1,cd);gp(g,0,8,cd);gr(g,6,2,1,5,c);gr(g,6,1,2,2,c);gr(g,5,0,3,1,c);gp(g,7,0,c);
      gr(g,7,1,2,1,CL.dark);gp(g,8,2,CL.dark);gp(g,6,0,CL.white);gp(g,6,1,CL.eye);break}
    case'crocodile':{g=G(19,7);const c=[70,120,64],cd=[44,84,48],bl=[196,200,130];
      if(fr===0){gr(g,4,5,2,2,cd);gr(g,11,5,2,2,cd)}else{gr(g,5,5,2,2,cd);gr(g,10,5,2,2,cd)}
      gr(g,3,2,10,3,c);gr(g,3,4,10,1,bl);for(let x=3;x<13;x+=2)gp(g,x,1,cd);
      gr(g,0,3,4,2,c);gr(g,0,4,2,1,cd);gp(g,1,3,cd);
      gr(g,12,2,6,3,c);gr(g,13,4,5,1,bl);gr(g,17,2,2,1,cd);gp(g,13,1,c);gp(g,14,1,CL.red);gp(g,14,2,[240,210,60]);
      for(const x of [14,16])gp(g,x,4,CL.white);break}
    case'scorpion':{g=G(11,8);const c=[196,128,56],cd=[130,80,40],cl=[228,170,84];
      if(fr===0){gp(g,3,6,cd);gp(g,5,6,cd);gp(g,6,7,cd)}else{gp(g,3,7,cd);gp(g,4,6,cd);gp(g,6,6,cd)}
      gr(g,2,4,5,2,c);gr(g,2,5,5,1,cd);
      gp(g,1,4,c);gp(g,0,3,c);gp(g,0,2,c);gp(g,1,1,c);gp(g,2,0,cl);gp(g,3,0,[240,60,50]);
      gr(g,7,3,2,2,c);gp(g,9,2,cl);gp(g,10,2,cl);gp(g,10,3,cl);gp(g,9,4,cl);gp(g,10,5,cl);gp(g,8,3,CL.eye);break}
    case'slime':{g=G(9,7);const c=[96,214,110,230],cd=[50,150,84,235],cl=[190,250,200,240];
      const sq=fr?1:0;gell(g,4.5,4.4-sq*.4,4.2+sq*.3,2.7-sq*.3,c);gr(g,1,5,7,1,cd);gp(g,2,2+sq,cl);gp(g,3,2+sq,cl);
      gr(g,3,3,1,2,CL.dark);gr(g,6,3,1,2,CL.dark);gp(g,3,3,CL.white);gp(g,6,3,CL.white);gp(g,4,5,cd);gp(g,5,5,cd);break}
    case'fireelem':{g=G(10,13);const a=CL.fire3,b=CL.fire2,c=CL.fire1;
      const rows=fr?["...a..a...","..aab.ab..",".aabbaabb.","aabbccbba.","abbccccbba","abccddccba","abcddddcba","abccddccba","aabbccbbaa",".abbccbba.",".aabbbbaa.","..aabbaa..","...aaaa..."]
                    :["....a.....","...aa..a..","..aab.aab.",".aabbaabba","aabbccbba.","abbccccbba","abcddddcba","abccddccba","aabbccbbaa",".abbccbba.",".aabbbbaa.","..aabbaa..","...aaaa..."];
      gmap(g,0,0,rows,{a:a,b:b,c:c,d:[255,250,200]});gp(g,3,6,CL.dark);gp(g,6,6,CL.dark);gp(g,3,7,CL.dark);gp(g,6,7,CL.dark);break}
    case'treant':{g=G(17,20);const bk=[104,72,44],bd=[70,48,30],bl=[140,100,62],lf=[66,146,62],ld=[40,104,48],ll=[118,188,84];
      if(fr===0){gr(g,4,15,3,5,bd);gr(g,10,15,3,5,bd);gr(g,3,19,4,1,bk);gr(g,10,19,4,1,bk)}else{gr(g,5,15,3,5,bd);gr(g,9,15,3,5,bd);gr(g,4,19,4,1,bk);gr(g,9,19,4,1,bk)}
      gr(g,4,7,9,9,bk);gr(g,4,7,2,9,bd);gr(g,11,7,2,9,bl);gr(g,3,14,11,2,bd);
      gr(g,1,6,3,7,bk);gr(g,13,6,3,7,bk);gr(g,0,4,3,3,lf);gr(g,14,4,3,3,lf);gp(g,1,5,ll);
      gell(g,8.5,4.2,6.5,4.2,lf);gell(g,6.5,3.2,3.4,2.4,ll);gell(g,11.5,4.8,3.2,2.2,ld);gr(g,3,5,11,1,ld);
      gp(g,2,1,lf);gp(g,14,1,lf);gp(g,8,0,ll);
      gr(g,6,8,2,2,[250,236,150]);gr(g,10,8,2,2,[250,236,150]);gp(g,7,9,CL.eye);gp(g,11,9,CL.eye);gr(g,7,12,4,1,bd);gp(g,8,11,bd);gp(g,9,11,bd);break}
    case'snowman':{g=G(8,13);const w=[246,250,255],wd=[196,212,232],hat=[40,36,52];
      gell(g,4,10,3.5,3,w);gell(g,4,6.3,2.7,2.4,w);gell(g,4,3.2,2.2,2.1,w);gr(g,1,10,6,2,wd);
      gr(g,2,0,4,2,hat);gr(g,1,2,6,1,hat);gp(g,2,1,[200,50,50]);gp(g,3,3,CL.dark);gp(g,5,3,CL.dark);gr(g,5,4,3,1,[240,130,40]);
      gp(g,3,5,[200,50,50]);gp(g,4,5,[200,50,50]);gp(g,4,7,CL.dark);gp(g,4,9,CL.dark);
      if(fr===0){gp(g,0,6,CL.woodD);gp(g,0,5,CL.woodD);gp(g,7,6,CL.woodD);gp(g,7,5,CL.woodD)}else{gp(g,0,7,CL.woodD);gp(g,0,6,CL.woodD);gp(g,7,7,CL.woodD);gp(g,7,6,CL.woodD)}break}
    case'unicorn':{g=G(15,13);const b=[250,248,252],bd=[206,204,226],hn=[250,214,90];
      const rb=[[236,96,140],[250,170,70],[120,210,120],[90,170,240],[170,120,230]];
      if(fr===0){gr(g,3,8,1,4,bd);gr(g,5,8,1,4,b);gr(g,9,8,1,4,bd);gr(g,11,8,1,4,b)}else{gr(g,4,8,1,4,bd);gr(g,5,8,1,3,b);gr(g,10,8,1,3,bd);gr(g,11,8,1,4,b)}
      for(const x of [3,5,9,11])gp(g,x,12,[200,190,130]);
      gr(g,3,4,9,4,b);gr(g,3,7,9,1,bd);gr(g,10,2,2,4,b);gr(g,11,1,3,2,b);gr(g,13,2,2,2,b);gp(g,12,2,CL.eye);gp(g,11,0,bd);
      gr(g,13,0,1,1,hn);gp(g,14,-1,hn);gr(g,12,0,1,1,hn);
      gp(g,2,4,rb[0]);gp(g,1,5,rb[1]);gp(g,1,6,rb[3]);gp(g,2,5,rb[2]);gp(g,2,6,rb[4]);break}
    case'mage':{g=G(11,16);const rb=[104,60,164],rd=[70,36,120],rl=[150,100,210],sk=[226,190,150];
      if(fr===0){gr(g,3,13,2,3,rd);gr(g,6,13,2,3,rd)}else{gr(g,4,13,3,3,rd)}
      gr(g,2,6,7,8,rb);gr(g,2,6,2,8,rd);gr(g,2,12,7,1,rl);gr(g,4,9,3,1,CL.gold);
      gr(g,1,7,1,4,rb);gr(g,9,7,1,3,rb);gp(g,9,10,sk);gp(g,1,11,sk);
      gr(g,3,3,5,3,sk);gr(g,3,5,5,2,[210,210,220]);gp(g,4,4,[240,60,70]);gp(g,6,4,[240,60,70]);
      gr(g,2,2,7,1,rd);gr(g,3,1,5,1,rb);gr(g,4,0,3,1,rb);gp(g,5,0,rl);gp(g,6,-1,rl);
      gr(g,10,2,1,12,CL.woodD);gell(g,10.5,1.4,1.4,1.4,fr?[255,120,255]:[200,90,255]);break}
    case'demon':{g=G(14,17);const c=[184,40,40],cd=[120,22,34],cl=[236,90,60],hn=[240,226,196];
      if(fr===0){gr(g,4,12,2,5,cd);gr(g,8,12,2,5,cd);gr(g,3,16,3,1,CL.dark);gr(g,8,16,3,1,CL.dark)}else{gr(g,5,12,2,5,cd);gr(g,7,12,2,5,cd);gr(g,4,16,5,1,CL.dark)}
      gr(g,3,5,8,8,c);gr(g,3,5,2,8,cd);gr(g,5,6,4,2,cl);gr(g,5,10,4,1,cd);
      gr(g,1,6,2,6,c);gr(g,11,6,2,6,c);gp(g,1,12,hn);gp(g,12,12,hn);
      gr(g,4,1,6,5,c);gr(g,4,1,6,1,cd);gp(g,5,3,[255,230,60]);gp(g,8,3,[255,230,60]);gr(g,5,5,4,1,hn);gp(g,5,4,hn);gp(g,8,4,hn);
      gp(g,3,0,hn);gp(g,3,1,hn);gp(g,2,-1,hn);gp(g,10,0,hn);gp(g,10,1,hn);gp(g,11,-1,hn);
      gr(g,-1,5,1,1,cd);gr(g,0,2,2,5,[140,40,70]);gr(g,12,2,2,5,[140,40,70]);
      gp(g,2,13,cd);gp(g,1,14,cd);gp(g,0,14,cd);gp(g,0,13,[240,90,40]);
      gr(g,13,7,1,9,CL.steelD);gp(g,12,6,CL.steel);gp(g,13,6,CL.steel);gp(g,13,5,CL.steel);break}
    case'golem':{g=G(13,15);const c=[96,206,226],cd=[48,130,170],cl=[190,246,252],st=[86,92,112];
      if(fr===0){gr(g,3,11,3,4,st);gr(g,8,11,3,4,st)}else{gr(g,4,11,3,4,st);gr(g,7,11,3,4,st)}
      gr(g,3,4,8,8,c);gr(g,3,4,2,8,cd);gr(g,9,4,2,8,cl);gp(g,6,6,cl);gp(g,7,7,cl);gp(g,5,9,cd);gp(g,8,10,cd);
      gr(g,1,5,2,6,cd);gr(g,11,5,2,6,cd);gp(g,1,11,cl);gp(g,12,11,cl);gp(g,0,4,cl);gp(g,12,4,cl);
      gr(g,4,0,5,4,c);gr(g,4,0,1,4,cd);gp(g,6,-1,cl);gp(g,5,0,cl);gp(g,5,2,[255,250,120]);gp(g,7,2,[255,250,120]);
      gp(g,2,3,cl);gp(g,10,3,cl);gp(g,1,4,cd);gp(g,11,4,cd);break}
    case'maneater':{g=G(11,13);const s=[70,150,56],sd=[40,100,44],pr=[216,54,84],pd=[150,30,60];
      gr(g,5,6,1,7,s);gr(g,4,9,1,1,s);gp(g,3,10,sd);gr(g,6,9,2,1,sd);gp(g,8,8,s);gp(g,9,8,s);gr(g,4,12,3,1,sd);
      const o=fr?2:0;
      gell(g,5,3,4.4,2.6,pr);gell(g,5,2.4-o*.3,4,2,pd);
      if(fr){gr(g,1,4,9,1,CL.white);gr(g,1,5,9,1,pd);for(let x=1;x<10;x+=2)gp(g,x,5,CL.white)}
      else{gr(g,2,3,7,1,CL.white);for(let x=2;x<9;x+=2)gp(g,x,4,CL.white)}
      gp(g,3,1,[255,230,90]);gp(g,7,1,[255,230,90]);gp(g,2,0,s);gp(g,8,0,s);gp(g,0,1,s);gp(g,10,1,s);break}
    case'sandworm':{g=G(16,14);const c=[196,150,98],cd=[140,98,62],cl=[232,196,140];
      const w=fr?1:0;
      gr(g,0,12,16,2,[214,186,126]);gr(g,2,11,12,1,[190,160,104]);
      gr(g,2,7+w,5,5,c);gr(g,2,7+w,1,5,cd);gr(g,3,5,6,3,c);gr(g,5,3,5,3,c);gr(g,3,8,5,1,cd);gr(g,3,10,5,1,cd);
      gr(g,8,1+w,6,4,c);gr(g,12,0+w,3,1,cd);gr(g,13,2+w,3,3,[110,30,40]);
      gp(g,13,1+w,CL.white);gp(g,15,2+w,CL.white);gp(g,13,4+w,CL.white);gp(g,15,4+w,CL.white);gp(g,10,2+w,CL.eye);gp(g,9,1+w,cl);gr(g,6,4,3,1,cd);
      for(const x of [3,5,7])gp(g,x,12,cd);break}
    case'ghost':{g=G(9,13);const c=[236,240,255,215],cd=[176,196,236,205],ey=[30,30,70,240];
      gr(g,2,0,5,1,c);gr(g,1,1,7,3,c);gr(g,0,4,9,5,c);gr(g,0,9,9,2,cd);
      const w=fr?[0,2,4,6,8]:[1,3,5,7];for(const x of w)gr(g,x,11,1,2,cd);
      gr(g,2,3,2,2,ey);gr(g,5,3,2,2,ey);gp(g,4,6,ey);gp(g,3,6,ey);gp(g,5,6,ey);gr(g,0,6,1,2,cd);gr(g,8,6,1,2,cd);break}
/*SPR-BEGIN*/
    /* ---- the wider bestiary ---- */
    case'yak':{g=G(15,11);const b=v%2?[126,90,60]:[68,52,46],bd=sh(b,.62),bl=sh(b,1.4),hn=[236,226,196];
      if(fr===0){gr(g,3,9,2,2,bd);gr(g,9,9,2,2,bd)}else{gr(g,4,9,2,2,bd);gr(g,8,9,2,2,bd)}
      gr(g,2,2,10,6,b);gr(g,4,1,5,1,b);gr(g,4,2,6,1,bl);gr(g,3,3,2,1,bl);
      gr(g,2,7,10,2,bd);for(const x of [2,4,6,8,10])gp(g,x,9,bd);gp(g,5,8,b);gp(g,9,8,b);
      gp(g,1,3,bd);gp(g,1,4,bd);gp(g,1,5,bd);gp(g,0,5,bd);
      gr(g,11,3,3,4,b);gr(g,13,4,2,3,bd);gp(g,14,6,CL.dark);gp(g,12,4,CL.eye);gp(g,11,3,bl);
      gp(g,12,2,hn);gp(g,13,1,hn);gp(g,14,1,hn);gp(g,14,0,hn);gp(g,11,2,sh(hn,.8));break}
    case'camel':{g=G(15,15);const c=[212,172,112],cd=[164,126,78],cl=[236,206,156];
      const L=fr===0?[2,4,9,11]:[3,5,8,10];
      for(const x of L)gr(g,x,10,1,5,cd);for(const x of L)gp(g,x,14,CL.dark);
      gr(g,2,5,10,5,c);gr(g,2,9,10,1,cd);gell(g,4.5,4,2,1.8,c);gell(g,8.5,4,2,1.8,c);gp(g,4,3,cl);gp(g,8,3,cl);gr(g,3,6,6,1,cl);
      gp(g,1,6,cd);gp(g,1,7,cd);gp(g,1,8,cd);gp(g,0,8,CL.dark);
      gr(g,11,4,2,3,c);gr(g,11,2,2,3,c);gr(g,12,0,3,3,c);gr(g,14,1,1,2,cd);gp(g,14,2,cd);gp(g,13,0,CL.eye);gp(g,12,-1,cd);gp(g,12,0,cd);gp(g,13,3,cl);gp(g,11,4,cd);
      gr(g,11,6,2,1,[176,70,70]);break}
    case'duck':{g=G(8,7);const mal=v%2,b=mal?[150,124,96]:CL.white,bd=sh(b,.78),hd=mal?[36,124,76]:CL.white;
      gell(g,3.5,4.4,3,1.9,b);gr(g,1,5,5,1,bd);gp(g,0,3,bd);gp(g,0,4,b);gp(g,3,3,bd);gp(g,4,3,bd);
      gr(g,5,2,1,3,b);gr(g,5,1,2,2,hd);gp(g,5,3,mal?CL.white:b);gp(g,6,1,CL.eye);gp(g,7,2,[246,170,40]);gp(g,7,1,[246,170,40]);
      if(fr===0){gp(g,3,6,[240,150,40]);gp(g,4,6,[240,150,40])}else{gp(g,2,6,[240,150,40]);gp(g,5,6,[240,150,40])}break}
    case'gazelle':{g=G(12,13);const c=[206,154,94],cd=[150,100,58],st=[100,64,38];
      if(fr===0){gr(g,2,8,1,5,cd);gr(g,4,8,1,5,cd);gr(g,7,8,1,5,cd);gr(g,9,9,1,4,cd)}else{gr(g,3,8,1,5,cd);gr(g,1,9,1,4,cd);gr(g,8,8,1,5,cd);gr(g,6,9,1,4,cd)}
      gr(g,2,5,8,3,c);gr(g,3,6,6,1,st);gr(g,2,7,8,1,CL.white);gp(g,1,5,CL.white);gp(g,1,6,CL.white);gp(g,0,5,cd);
      gr(g,9,3,2,3,c);gr(g,10,2,2,2,c);gp(g,11,3,CL.dark);gp(g,10,2,CL.eye);gp(g,11,4,CL.white);gp(g,9,4,CL.white);
      gp(g,9,1,cd);gp(g,9,0,[60,44,36]);gp(g,10,1,[60,44,36]);gp(g,8,0,[60,44,36]);gp(g,10,0,[60,44,36]);gp(g,11,1,cd);break}
    case'reindeer':{g=G(14,13);const c=[148,126,106],cd=[102,84,70],cl=[238,234,226],an=[214,196,158];
      if(fr===0){gr(g,3,9,1,4,cd);gr(g,5,9,1,4,cd);gr(g,8,9,1,4,cd);gr(g,10,9,1,3,cd)}else{gr(g,4,9,1,4,cd);gr(g,3,9,1,3,cd);gr(g,9,9,1,4,cd);gr(g,7,9,1,3,cd)}
      gr(g,2,5,9,4,c);gr(g,2,8,9,1,cd);gr(g,3,5,6,1,sh(c,1.15));gr(g,2,4,2,1,cl);gp(g,1,5,cl);gp(g,1,6,cl);
      gr(g,9,3,3,4,cl);gr(g,10,2,3,3,c);gr(g,12,3,2,2,c);gp(g,13,4,CL.dark);gp(g,11,3,CL.eye);gp(g,10,1,cd);
      gp(g,10,0,an);gp(g,9,1,an);gp(g,8,0,an);gp(g,11,0,an);gp(g,12,1,an);gp(g,13,0,an);gp(g,11,1,an);gp(g,7,1,an);break}
    case'capybara':{g=G(11,7);const c=[156,110,68],cd=[112,76,46],cl=[190,146,98];
      if(fr===0){gr(g,2,5,1,2,cd);gr(g,6,5,1,2,cd)}else{gr(g,3,5,1,2,cd);gr(g,5,5,1,2,cd)}
      gr(g,1,2,7,3,c);gr(g,1,4,7,1,cd);gr(g,2,2,5,1,cl);gp(g,0,3,cd);
      gr(g,7,2,3,3,c);gr(g,9,3,2,2,cd);gp(g,10,3,CL.dark);gp(g,8,2,CL.eye);gp(g,7,1,cd);gp(g,8,1,cd);gp(g,10,5,cd);break}
    case'otter':{g=G(12,6);const c=[112,82,58],cd=[78,56,40],cl=[226,206,164];
      if(fr===0){gp(g,3,5,cd);gp(g,7,5,cd)}else{gp(g,4,5,cd);gp(g,6,5,cd);gp(g,3,4,cd)}
      gr(g,3,2,6,3,c);gr(g,3,4,6,1,cl);gr(g,3,2,6,1,sh(c,1.2));
      gr(g,0,3,3,2,cd);gp(g,0,4,cd);gp(g,1,2,cd);
      gr(g,8,1,3,3,c);gr(g,10,2,2,2,cl);gp(g,11,2,CL.dark);gp(g,9,1,CL.eye);gp(g,8,0,cd);gp(g,10,3,[240,240,240]);break}
    case'hippo':{g=G(17,10);const c=[132,118,140],cd=[92,80,104],cl=[168,152,176],pk=[226,150,164];
      if(fr===0){gr(g,3,7,3,3,cd);gr(g,10,7,3,3,cd)}else{gr(g,4,7,3,3,cd);gr(g,9,7,3,3,cd)}
      gr(g,2,2,11,6,c);gr(g,2,7,11,1,pk);gr(g,3,2,7,1,cl);gr(g,2,6,11,1,cd);gp(g,1,3,cd);gp(g,1,4,cd);
      gr(g,11,1,5,6,c);gr(g,13,0,2,1,c);gr(g,12,1,1,1,pk);gr(g,15,2,2,5,cl);gr(g,13,6,4,1,pk);gp(g,15,6,CL.tusk);gp(g,13,6,CL.tusk);
      gp(g,13,2,CL.eye);gp(g,11,0,c);gp(g,12,0,pk);gp(g,16,3,cd);gp(g,15,3,cd);break}
    case'lion':{g=G(15,10);const c=[216,170,88],cd=[160,116,56],cl=[240,214,156],mn=[116,68,34],mn2=[84,48,26];
      if(fr===0){gr(g,3,6,1,4,cd);gr(g,5,7,1,3,cd);gr(g,9,6,1,4,cd);gr(g,11,7,1,3,cd)}else{gr(g,4,6,1,4,cd);gr(g,3,7,1,3,cd);gr(g,10,6,1,4,cd);gr(g,9,7,1,3,cd)}
      gr(g,2,3,9,4,c);gr(g,2,6,9,1,cd);gr(g,4,3,5,1,sh(c,1.12));gr(g,3,6,7,1,cl);
      gp(g,1,3,cd);gp(g,0,4,cd);gp(g,0,5,cd);gp(g,0,6,cd);gp(g,0,7,mn2);
      if(male){gell(g,10,4.3,3.2,3.2,mn);gr(g,8,2,2,5,mn2);gr(g,9,6,3,1,mn2);gr(g,11,3,3,3,c);gp(g,13,5,CL.dark);gp(g,12,3,CL.eye);gp(g,10,1,mn);gp(g,11,1,mn);gp(g,12,2,c);gr(g,12,5,2,1,cl)}
      else{gr(g,10,2,3,4,c);gr(g,12,3,3,3,c);gr(g,13,5,2,1,cl);gp(g,14,4,CL.dark);gp(g,12,3,CL.eye);gp(g,10,1,cd);gp(g,12,1,cd);gp(g,11,1,c);gp(g,10,2,cd)}break}
    case'tiger':{g=G(15,9);const c=[228,128,40],cd=[150,76,24],bk=[34,28,30],wh=[246,240,226];
      if(fr===0){gr(g,3,5,1,4,cd);gr(g,5,6,1,3,cd);gr(g,9,5,1,4,cd);gr(g,11,6,1,3,cd)}else{gr(g,4,5,1,4,cd);gr(g,3,6,1,3,cd);gr(g,10,5,1,4,cd);gr(g,9,6,1,3,cd)}
      gr(g,2,2,9,4,c);gr(g,2,5,9,1,wh);gr(g,3,2,6,1,sh(c,1.12));
      for(const x of [3,5,7,9]){gp(g,x,2,bk);gp(g,x,3,bk);gp(g,x-(x%2),4,bk)}
      gp(g,1,3,c);gp(g,0,4,c);gp(g,0,5,c);gp(g,1,6,c);gp(g,0,6,bk);gp(g,0,3,bk);
      gr(g,10,1,3,4,c);gr(g,12,2,3,3,c);gr(g,13,4,2,1,wh);gp(g,14,3,CL.dark);gp(g,12,2,[250,230,60]);gp(g,10,0,c);gp(g,12,0,c);gp(g,11,2,bk);gp(g,12,4,bk);gp(g,11,0,bk);break}
    case'lynx':{g=G(11,8);const c=[190,162,120],cd=[128,102,70],cl=[238,226,200],bk=[34,30,32];
      if(fr===0){gr(g,2,5,1,3,cd);gr(g,4,5,1,3,cd);gr(g,6,5,1,3,cd);gr(g,8,5,1,3,cd)}else{gr(g,3,5,1,3,cd);gr(g,2,6,1,2,cd);gr(g,7,5,1,3,cd);gr(g,6,6,1,2,cd)}
      gr(g,2,3,7,3,c);gr(g,2,5,7,1,cl);gp(g,4,3,cd);gp(g,6,4,cd);gp(g,3,4,cd);gp(g,5,3,cd);
      gp(g,1,4,cd);gp(g,0,4,bk);gp(g,1,5,cd);
      gr(g,8,2,3,3,c);gp(g,10,3,CL.dark);gp(g,10,4,cl);gp(g,9,2,[240,200,70]);gp(g,8,1,bk);gp(g,10,1,bk);gp(g,8,2,c);gp(g,9,4,cl);gp(g,8,0,bk);gp(g,10,0,bk);break}
    case'mongoose':{g=G(11,6);const c=[134,114,92],cd=[92,76,60],cl=[196,176,148];
      if(fr===0){gr(g,3,4,1,2,cd);gr(g,6,4,1,2,cd)}else{gr(g,4,4,1,2,cd);gr(g,5,4,1,2,cd);gp(g,3,5,cd)}
      gr(g,2,2,6,3,c);gr(g,2,4,6,1,cl);gp(g,4,2,cd);gp(g,6,3,cd);gr(g,0,3,2,1,cd);gp(g,0,2,cd);gp(g,0,4,cd);
      gr(g,7,1,3,3,c);gr(g,9,2,2,2,cl);gp(g,10,3,CL.dark);gp(g,8,1,CL.eye);gp(g,7,0,cd);gp(g,8,0,cd);break}
    case'seagull':{g=G(11,8);const w=CL.white,gy=[160,170,188],gd=[110,120,140];
      gr(g,3,3,5,3,w);gr(g,2,4,2,1,w);gp(g,1,4,gy);gp(g,0,4,gd);gr(g,3,5,5,1,[218,224,234]);
      gr(g,7,2,3,2,w);gp(g,9,2,CL.eye);gr(g,10,3,1,1,[250,190,50]);gp(g,10,4,[250,190,50]);gp(g,7,4,w);
      if(fr===0){gr(g,2,0,4,3,gy);gp(g,1,0,gd);gp(g,2,1,gd);gp(g,5,1,w)}else{gr(g,1,5,5,2,gy);gp(g,0,6,gd);gp(g,1,5,gd);gp(g,3,6,gd)}break}
    case'parrot':{g=G(9,10);const cs=[[222,46,42],[70,170,96],[60,112,214]],c=cs[v%3],cd=sh(c,.66),by=[250,204,54],bl=[60,110,220];
      gr(g,2,0,2,2,cd);gp(g,3,1,cd);gr(g,3,2,3,3,c);gr(g,2,4,3,4,c);gr(g,1,6,3,3,cd);gr(g,2,8,2,2,by);gp(g,1,9,bl);gp(g,0,9,bl);
      gr(g,3,3,2,1,CL.white);gp(g,4,2,CL.eye);gp(g,5,2,CL.white);gr(g,5,3,2,2,[236,230,206]);gp(g,6,4,CL.dark);gp(g,6,3,[236,230,206]);
      if(fr===0){gr(g,3,5,2,3,by);gp(g,3,7,bl);gp(g,4,7,bl)}else{gr(g,3,4,3,3,by);gp(g,5,6,bl);gp(g,4,7,bl);gp(g,3,6,bl)}
      gp(g,3,8,[220,170,60]);gp(g,3,9,[220,170,60]);break}
    case'troll':{g=G(16,19);const sk=[116,132,142],sd=[78,94,106],mo=[92,142,70],ls=[102,82,62];
      if(fr===0){gr(g,4,14,3,5,sd);gr(g,9,14,3,5,sd);gr(g,3,18,4,1,CL.stoneD);gr(g,9,18,4,1,CL.stoneD)}else{gr(g,5,14,5,5,sd);gr(g,4,18,7,1,CL.stoneD)}
      gr(g,3,6,10,8,sk);gr(g,3,6,3,8,sd);gr(g,10,7,2,5,sh(sk,1.15));gr(g,3,12,10,2,ls);gp(g,8,12,CL.gold);
      gr(g,3,6,5,2,mo);gp(g,9,6,mo);gp(g,5,8,mo);gp(g,4,9,mo);gp(g,11,9,mo);
      gr(g,0,7,3,8,sk);gr(g,13,7,3,8,sk);gr(g,0,13,3,3,sd);gr(g,13,13,3,3,sd);gp(g,1,8,mo);
      gr(g,4,1,8,6,sk);gr(g,4,1,8,1,sd);gr(g,5,0,3,1,mo);gp(g,9,0,CL.stoneL);gp(g,10,0,sd);
      gr(g,5,3,2,1,[250,220,70]);gr(g,9,3,2,1,[250,220,70]);gp(g,6,3,CL.dark);gp(g,10,3,CL.dark);gp(g,8,3,sd);gr(g,5,5,6,2,sd);gp(g,5,4,CL.tusk);gp(g,10,4,CL.tusk);gp(g,6,5,CL.tusk);gp(g,9,5,CL.tusk);break}
    case'basilisk':{g=G(17,9);const c=[126,158,62],cd=[78,104,44],cl=[210,220,120],cr=[236,200,44];
      if(fr===0){gr(g,4,6,2,3,cd);gr(g,10,6,2,3,cd);gp(g,3,8,cd);gp(g,12,8,cd)}else{gr(g,5,6,2,3,cd);gr(g,9,6,2,3,cd);gp(g,6,8,cd);gp(g,8,8,cd)}
      gr(g,3,3,9,4,c);gr(g,3,6,9,1,cl);for(let x=4;x<12;x+=2){gp(g,x,3,cd);gp(g,x,2,cr)}gr(g,2,4,2,2,c);gr(g,0,5,3,1,c);gp(g,0,6,cd);gp(g,1,5,cd);gp(g,2,4,cd);
      gr(g,11,2,4,4,c);gr(g,14,3,3,2,c);gr(g,14,5,3,1,cl);gp(g,12,1,cr);gp(g,13,1,cr);gp(g,11,1,cr);gp(g,13,2,[255,60,40]);gp(g,14,2,[255,240,90]);gp(g,16,3,CL.dark);gp(g,15,5,CL.white);break}
    case'thunderbird':{g=G(20,15);const d1=[40,48,88],d2=[70,86,150],d3=[22,26,52],yl=[255,226,70],bk=[244,190,40];
      gr(g,7,6,7,3,d1);gr(g,7,6,7,1,d2);gr(g,8,9,4,1,d3);gr(g,1,7,6,2,d3);gr(g,0,8,3,2,d1);gp(g,0,7,yl);gp(g,1,9,yl);
      gr(g,14,4,3,3,d1);gr(g,13,5,2,3,d1);gr(g,17,5,2,1,bk);gp(g,18,6,bk);gp(g,15,4,yl);gp(g,16,4,CL.white);gp(g,14,3,yl);gp(g,13,3,d3);
      gp(g,9,9,yl);gp(g,11,9,yl);gp(g,9,10,bk);gp(g,11,10,bk);
      for(let x=3;x<=12;x++){
        if(fr===0){const t=Math.max(0,5-Math.round((12-x)*.6)-(x<8?1:0));gr(g,x,t,1,6-t,x%3===0?d2:d1);gp(g,x,t,d3);if(x%3===1)gp(g,x,t+2,yl)}
        else{const b=Math.min(14,9+Math.round((12-x)*.6)+(x<8?1:0));gr(g,x,8,1,b-8+1,x%3===0?d2:d1);gp(g,x,b,d3);if(x%3===1)gp(g,x,b-2,yl)}
      }break}
/*SPR-END*/
  }
  if(!g)g=G(6,6),gr(g,1,1,4,4,[255,0,255]);
  return g;
}

/* ---------- voices ---------- */
Object.assign(CALLS,{
  goat:(o,t)=>vox(o,t,{type:'sawtooth',f0:420,mid:520,f1:380,d:.6,a:.04,vib:30,vd:.12,ff:1100,q:3,p:.3}),
  llama:(o,t)=>vox(o,t,{type:'sawtooth',f0:300,mid:380,f1:240,d:.7,a:.1,vib:5,vd:.05,ff:900,q:2,p:.3}),
  penguin:(o,t)=>{for(const k of [0,.13,.26])vox(o,t+k,{type:'square',f0:1100,f1:800,d:.09,ff:1500,q:3,p:.2})},
  frog:(o,t)=>{for(const k of [0,.11])vox(o,t+k,{type:'square',f0:210,f1:330,d:.08,ff:620,q:4,p:.3})},
  snake:(o,t)=>noiseHit(o,'highpass',4800,3200,1.2,t,.05,.7,.25),
  monkey:(o,t)=>{for(let k=0;k<4;k++)vox(o,t+k*.1,{type:'sawtooth',f0:700+k*90,f1:1000+k*70,d:.07,ff:1700,q:2.5,p:.22})},
  raccoon:(o,t)=>{for(let k=0;k<5;k++)vox(o,t+k*.05,{type:'triangle',f0:1500,f1:1900,d:.04,ff:2200,q:3,p:.16})},
  hyena:(o,t)=>{for(let k=0;k<6;k++)vox(o,t+k*.1,{type:'sawtooth',f0:520-k*14,mid:680-k*20,f1:480-k*10,d:.08,ff:1200,q:2,p:.28})},
  rhino:(o,t)=>{vox(o,t,{type:'sawtooth',f0:110,f1:70,d:.6,a:.06,vib:19,vd:.1,ft:'lowpass',ff:420,q:2,p:.55});noiseHit(o,'lowpass',500,200,1,t,.03,.5,.3)},
  armadillo:(o,t)=>{for(const k of [0,.06])noiseHit(o,'bandpass',1800,1400,3,t+k,.002,.04,.18)},
  bee:(o,t)=>vox(o,t,{type:'sawtooth',f0:230,f1:250,d:.5,a:.1,vib:48,vd:.06,ft:'bandpass',ff:420,q:4,p:.06}),
  butterfly:(o,t)=>{for(const k of [0,.06,.12])osc(o,'sine',3400+k*1000,3800+k*900,t+k,.004,.04,.04)},
  flamingo:(o,t)=>{for(const k of [0,.18])vox(o,t+k,{type:'sawtooth',f0:640,mid:900,f1:620,d:.14,ff:1500,q:3,p:.26})},
  crocodile:(o,t)=>{vox(o,t,{type:'sawtooth',f0:62,f1:44,d:1,a:.2,vib:26,vd:.14,ft:'lowpass',ff:260,q:2,p:.6});noiseHit(o,'bandpass',800,300,1,t,.1,.7,.2)},
  scorpion:(o,t)=>{for(let k=0;k<4;k++)noiseHit(o,'highpass',5200,6200,2,t+k*.05,.001,.03,.18)},
  slime:(o,t)=>vox(o,t,{type:'sine',f0:190,mid:330,f1:150,d:.3,a:.02,vib:14,vd:.2,ft:'lowpass',ff:900,p:.35}),
  fireelem:(o,t)=>{noiseHit(o,'bandpass',1200,500,1,t,.1,.8,.4);vox(o,t,{type:'sawtooth',f0:140,f1:95,d:.8,a:.1,vib:20,vd:.1,ft:'lowpass',ff:500,p:.3})},
  treant:(o,t)=>{vox(o,t,{type:'sawtooth',f0:68,mid:82,f1:54,d:1.5,a:.3,vib:3,vd:.03,ft:'lowpass',ff:300,q:2,p:.6});noiseHit(o,'bandpass',500,300,2,t,.2,1.2,.2)},
  snowman:(o,t)=>vox(o,t,{type:'triangle',f0:640,f1:520,d:.4,a:.05,vib:6,vd:.04,ft:'lowpass',ff:1500,p:.2}),
  unicorn:(o,t)=>{vox(o,t,{type:'sine',f0:880,mid:1180,f1:760,d:.9,a:.05,vib:10,vd:.05,ft:'lowpass',ff:3000,p:.25});[1318,1568,1976].forEach((f,k)=>osc(o,'sine',f,f,t+.1+k*.08,.005,.6,.05))},
  mage:(o,t)=>{vox(o,t,{type:'sawtooth',f0:180,mid:240,f1:130,d:.9,a:.1,vib:8,vd:.1,ft:'bandpass',ff:700,q:2,p:.35});osc(o,'sine',920,1380,t+.2,.01,.5,.08)},
  demon:(o,t)=>{vox(o,t,{type:'sawtooth',f0:96,f1:60,d:1.2,a:.08,vib:32,vd:.18,ft:'lowpass',ff:420,q:3,p:.7});noiseHit(o,'bandpass',700,250,1,t,.1,1.1,.3)},
  golem:(o,t)=>{osc(o,'sine',90,45,t,.01,.5,.5);noiseHit(o,'lowpass',500,200,1,t,.01,.3,.3);osc(o,'triangle',1560,1500,t+.05,.002,.7,.07)},
  maneater:(o,t)=>{vox(o,t,{type:'sawtooth',f0:150,f1:90,d:.5,a:.02,vib:40,vd:.2,ft:'lowpass',ff:500,p:.5});noiseHit(o,'bandpass',1400,900,3,t+.05,.002,.1,.3)},
  sandworm:(o,t)=>{vox(o,t,{type:'sawtooth',f0:70,mid:120,f1:50,d:1.6,a:.2,vib:7,vd:.1,ft:'lowpass',ff:400,q:2,p:.7});noiseHit(o,'bandpass',900,200,1,t,.2,1.4,.4)},
  ghost:(o,t)=>vox(o,t,{type:'sine',f0:420,mid:700,f1:300,d:1.8,a:.4,vib:5,vd:.1,ft:'bandpass',ff:900,q:4,p:.22}),
/*CALLS-BEGIN*/
  yak:(o,t)=>{vox(o,t,{type:'sawtooth',f0:90,f1:74,d:.7,a:.1,vib:25,vd:.1,ft:'lowpass',ff:360,q:2,p:.5});noiseHit(o,'lowpass',400,200,1,t,.05,.4,.12)},
  camel:(o,t)=>vox(o,t,{type:'sawtooth',f0:150,mid:210,f1:120,d:.9,a:.08,vib:30,vd:.12,ft:'bandpass',ff:520,q:2.5,p:.38}),
  duck:(o,t)=>{for(const k of [0,.14,.28])vox(o,t+k,{type:'square',f0:520,f1:400,d:.08,ff:900,q:4,p:.24})},
  gazelle:(o,t)=>vox(o,t,{type:'triangle',f0:880,mid:1000,f1:760,d:.18,a:.01,vib:40,vd:.05,ff:1800,q:2,p:.18}),
  reindeer:(o,t)=>{vox(o,t,{type:'sawtooth',f0:130,f1:100,d:.28,a:.02,ft:'lowpass',ff:520,q:2,p:.35});vox(o,t+.3,{type:'sawtooth',f0:140,f1:95,d:.22,a:.02,ft:'lowpass',ff:500,q:2,p:.3})},
  capybara:(o,t)=>{for(const k of [0,.08,.16])osc(o,'sine',1600+k*1500,2300+k*900,t+k,.004,.05,.08)},
  otter:(o,t)=>{for(let k=0;k<3;k++)vox(o,t+k*.09,{type:'square',f0:1500+k*160,f1:2300,d:.06,ff:2600,q:4,p:.16})},
  hippo:(o,t)=>{for(const k of [0,.2,.4])vox(o,t+k,{type:'sawtooth',f0:78,f1:58,d:.16,a:.01,vib:30,vd:.15,ft:'lowpass',ff:280,q:2,p:.5});noiseHit(o,'lowpass',300,150,1,t,.1,.5,.18)},
  lion:(o,t)=>{vox(o,t,{type:'sawtooth',f0:86,mid:130,f1:44,d:1.5,a:.2,vib:15,vd:.1,ft:'lowpass',ff:480,q:2.5,p:.62});noiseHit(o,'bandpass',500,200,1,t,.15,1.2,.25)},
  tiger:(o,t)=>{vox(o,t,{type:'sawtooth',f0:120,mid:180,f1:80,d:.9,a:.05,vib:34,vd:.12,ft:'lowpass',ff:620,q:2,p:.55});noiseHit(o,'bandpass',900,400,1.5,t,.05,.7,.25)},
  lynx:(o,t)=>{vox(o,t,{type:'sawtooth',f0:640,mid:900,f1:520,d:.5,a:.03,vib:12,vd:.08,ff:1400,q:3,p:.25});vox(o,t+.5,{type:'sawtooth',f0:620,f1:480,d:.3,ff:1300,q:3,p:.18})},
  mongoose:(o,t)=>{for(let k=0;k<5;k++)vox(o,t+k*.06,{type:'sawtooth',f0:900-k*50,f1:700,d:.05,ff:1900,q:3,p:.16})},
  seagull:(o,t)=>{vox(o,t,{type:'sawtooth',f0:900,mid:1500,f1:760,d:.3,a:.02,vib:18,vd:.06,ff:2200,q:2,p:.24});vox(o,t+.3,{type:'sawtooth',f0:1300,f1:800,d:.25,ff:2000,q:2,p:.2})},
  parrot:(o,t)=>{vox(o,t,{type:'sawtooth',f0:1000,mid:1900,f1:1100,d:.2,a:.01,vib:25,vd:.06,ff:2600,q:2.5,p:.22});vox(o,t+.22,{type:'square',f0:1500,f1:2200,d:.12,ff:3000,q:3,p:.16})},
  troll:(o,t)=>{vox(o,t,{type:'sawtooth',f0:72,mid:100,f1:46,d:1.3,a:.15,vib:9,vd:.12,ft:'lowpass',ff:360,q:3,p:.66});noiseHit(o,'lowpass',400,120,1,t+.1,.05,.8,.35)},
  basilisk:(o,t)=>{noiseHit(o,'highpass',3600,2200,1.5,t,.15,.9,.28);vox(o,t,{type:'sawtooth',f0:200,f1:130,d:.7,a:.1,vib:60,vd:.15,ft:'bandpass',ff:800,q:4,p:.25})},
  thunderbird:(o,t)=>{vox(o,t,{type:'sawtooth',f0:1100,mid:1700,f1:600,d:.9,a:.03,vib:14,vd:.08,ff:2400,q:2,p:.3});noiseHit(o,'lowpass',2000,200,1,t+.15,.002,.7,.5);osc(o,'sine',90,40,t+.15,.01,.6,.4)},
  spiderling:(o,t)=>noiseHit(o,'highpass',5200,7500,1.5,t,.01,.25,.15),
  imp:(o,t)=>{vox(o,t,{type:'square',f0:620,mid:900,f1:480,d:.4,a:.02,vib:40,vd:.1,ff:2200,q:3,p:.2})},
/*CALLS-END*/
});

/* ---------- habitats: where each creature starts and where it wanders back in from ----------
   [groups, size, pred(tile)]; used when a world is generated and, for rarer ones, each year when numbers run low */
const FHAB={
  goat:[3,3,j=>bio(hgt[j])===4],
  llama:[2,3,j=>bio(hgt[j])===4||bm[j]===BM.SAV],
  penguin:[3,2,j=>bio(hgt[j])===2],
  frog:[4,2,j=>bio(hgt[j])===1||bio(hgt[j])===2],
  flamingo:[2,2,j=>bio(hgt[j])===2],
  crocodile:[2,1,j=>bio(hgt[j])===2],
  snake:[3,1,j=>fertile(j)],
  monkey:[3,3,j=>bm[j]===BM.JUNGLE||(fertile(j)&&tree[j]&&R()<.2)],
  raccoon:[3,2,j=>fertile(j)&&ringFind(j%W,(j/W)|0,3,k=>tree[k])>=0],
  hyena:[2,2,j=>bm[j]===BM.SAV||fertile(j)],
  rhino:[1,1,j=>bm[j]===BM.SAV||fertile(j)],
  armadillo:[3,1,j=>fertile(j)],
  scorpion:[2,1,j=>bm[j]===BM.WASTE||bio(hgt[j])===2],
  bee:[4,2,j=>fertile(j)],
  butterfly:[4,2,j=>fertile(j)],
/*FHAB-BEGIN*/
  yak:[2,3,j=>bio(hgt[j])===5||(bio(hgt[j])===4&&ringFind(j%W,(j/W)|0,4,k=>bio(hgt[k])===5)>=0)],
  camel:[2,2,j=>bm[j]===BM.WASTE||bm[j]===BM.SAV||bio(hgt[j])===2],
  duck:[3,3,j=>bio(hgt[j])===2||bio(hgt[j])===1],
  gazelle:[3,4,j=>bm[j]===BM.SAV||(fertile(j)&&bio(hgt[j])===3)],
  reindeer:[2,3,j=>bio(hgt[j])===5||(bio(hgt[j])===4&&ringFind(j%W,(j/W)|0,4,k=>bio(hgt[k])===5)>=0)],
  capybara:[3,2,j=>bio(hgt[j])===2||(bio(hgt[j])===3&&ringFind(j%W,(j/W)|0,3,k=>bio(hgt[k])<=1)>=0)],
  otter:[3,2,j=>bio(hgt[j])===2],
  hippo:[1,2,j=>bio(hgt[j])===2||bio(hgt[j])===1],
  lion:[1,2,j=>bm[j]===BM.SAV||fertile(j)],
  tiger:[1,1,j=>bm[j]===BM.JUNGLE||bm[j]===BM.FOREST||(fertile(j)&&tree[j]>0)],
  lynx:[2,1,j=>bio(hgt[j])===4||(fertile(j)&&tree[j]>0)],
  mongoose:[2,2,j=>bm[j]===BM.SAV||bm[j]===BM.WASTE||fertile(j)],
  seagull:[3,3,j=>bio(hgt[j])===2],
  parrot:[2,3,j=>bm[j]===BM.JUNGLE||(fertile(j)&&tree[j]>0)],
/*FHAB-END*/
};
function genFauna(herd){for(const sp in FHAB){const h=FHAB[sp];herd(sp,h[0],h[1],h[2])}}
function faunaYear(){
  for(const sp in FHAB){
    const S=SPECIES[sp],h=FHAB[sp];
    if((cnt.sp[sp]||0)<S.cap*.15&&R()<.3&&units.length<1300){
      for(let k=0;k<20;k++){
        const i=randomLand(j=>h[2](j)&&farFrom(j,16),150);
        if(i>=0){for(let m=0;m<h[1];m++)addAnimal(sp,i%W,(i/W)|0);break}
      }
    }
  }
  /* snowmen are made by winter: they stand about in the cold and melt away with the thaw */
  if(season()===3&&(cnt.sp.snowman||0)<SPECIES.snowman.cap&&units.length<1300){
    for(let n=0;n<3;n++){const i=randomLand(j=>fertile(j),150);if(i>=0)addAnimal('snowman',i%W,(i/W)|0)}
  }
}

/* ---------- special behaviours. A handler returns true when it has taken over the creature's whole turn ---------- */
const FAUNA={
  slime(u,S){
    /* a slime that is hurt badly splits in two */
    if(u.hp<u.maxhp*.55&&u.hp>3&&(cnt.sp.slime||0)<S.cap&&units.length<1500){
      u.hp/=2;u.maxhp=Math.max(6,u.maxhp/2);u.scale=Math.max(.55,(u.scale||1)*.82);
      const c=addAnimal('slime',u.x|0,u.y|0);c.x=c.px=u.x+(R()-.5)*.6;c.y=c.py=u.y+(R()-.5)*.6;c.hp=u.hp;c.maxhp=u.maxhp;c.scale=u.scale;c.age=u.age;
      cnt.sp.slime=(cnt.sp.slime||0)+1;sfx('cry',u.x,u.y,'slime');
    }
    return false;
  },
  fireelem(u){
    const i=tileOf(u);
    if((step+u.id)%9===0&&R()<.5)ignite(i,true);
    if(WX.rain>.4&&(u.hp-=.12)<=0)die(u);
    return false;
  },
  snowman(u){
    const i=tileOf(u),warm=season()!==3&&!isNight()&&WX.snow<.3;
    if(warm){if((u.hp-=.014)<=0){effects.push({type:'rite',x:u.x,y:u.y,c:[170,210,255],t:0,dur:24});die(u);return true}}
    else if(season()===3&&u.hp<u.maxhp)u.hp+=.02;
    if(fire[i]||lava[i])u.hp-=.5;
    return false;
  },
  ghost(u){
    /* spirits only linger in the dark */
    if(!isNight()&&(u.hp-=.06)<=0){die(u);return true}
    return false;
  },
  unicorn(u){
    if((step+u.id)%30===0){
      const i=tileOf(u);
      for(const v of units){
        if(v.dead||v.inside||v===u||isMon(v)||Math.hypot(v.x-u.x,v.y-u.y)>3.5)continue;
        if(v.hp<v.maxhp)v.hp=Math.min(v.maxhp,v.hp+3);
        if(v.traits&&v.traits.includes('Cursed'))v.traits=v.traits.filter(t=>t!=='Cursed');
      }
      if(bm[i]===0&&(bio(hgt[i])===3||bio(hgt[i])===4)&&bld[i]===-1&&R()<.04)setBiome(i,BM.FLOWER,.1);
    }
    return false;
  },
  treant(u){
    if((step+u.id)%220===0&&R()<.6){
      const j=sampleNear(u.x,u.y,3,k=>fertile(k)&&!tree[k]&&bld[k]===-1,6);
      if(j>=0){tree[j]=1;burnt[j]=0;markTile(j)}
    }
    if(WX.rain>.3&&u.hp<u.maxhp)u.hp+=.03;
    return false;
  },
  golem(u){
    if((step+u.id)%500===0&&bm[tileOf(u)]===BM.CRYS){
      const i=tileOf(u);if(!ore[i]&&bld[i]===-1&&bio(hgt[i])>=3){ore[i]=ORE.GEMS;oreAmt[i]=18;markTile(i)}
    }
    return false;
  },
  mage(u){
    /* a bolt of dark fire from afar */
    if(u.target&&--u.fcd<=0){
      const t=u.target,d=Math.hypot(t.x-u.x,t.y-u.y);
      if(d<9){
        u.fcd=34+((R()*30)|0);
        effects.push({type:'flame',x0:u.x,y0:u.y-1.2,x1:t.x,y1:t.y-.3,t:0,dur:14});
        ignite(tileOf(t),true);hit(t,u.dmg,u);sfx('cry',u.x,u.y,'mage');
      }else u.fcd=0;
    }
    return false;
  },
  maneater(u,S){
    /* rooted: it only bites what comes within reach */
    if(u.target&&(u.target.dead||Math.hypot(u.target.x-u.x,u.target.y-u.y)>3.4))u.target=null;
    if(!u.target&&--u.cd<=0){u.cd=8;const p=nearest(u,3,v=>!isMon(v)&&v.sp!=='maneater');if(p){u.target=p;sfx('cry',u.x,u.y,'maneater')}}
    u.moving=false;
    if(u.target)chase(u,.012,u.dmg,1.5);
    return true;
  },
/*ACT-BEGIN*/
  /* ----- the great beasts. Each has a signature move; all of them hit back, shrug off blows (armor in data.js) and fight on ----- */
  troll(u){
    /* wounds knit shut, unless fire has touched it: a burning troll does not heal */
    const i=tileOf(u);if(fire[i]||lava[i])u.burn=step+150;
    if(u.hp<u.maxhp&&u.burn<=step&&(step+u.id)%5===0)u.hp=Math.min(u.maxhp,u.hp+u.maxhp*.0011);
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    /* ground slam: everyone crowding it is thrown back and stunned */
    if(d<2.8&&step>=u.bcd&&crowd(u,2.6)>=1){u.bcd=step+170+((R()*120)|0);slam(u,2.7,.75,16)}
    /* hurls a boulder at anyone it cannot reach */
    else if(d>3.6&&d<11&&--u.fcd<=0){u.fcd=170+((R()*90)|0);throwRock(u,t)}
    return false;
  },
  demon(u){
    if((step+u.id)%25===0&&R()<.5)ignite(tileOf(u),true);
    /* hellfire aura: everything beside it smoulders */
    if((step+u.id)%10===0)eachNear(u.x,u.y,2.3,v=>{if(foeOf(u,v)){v.hp-=1.2+u.dmg*.05;v.burn=step+80;if(v.hp<=0)die(v)}});
    /* its footsteps corrupt the land */
    if((step+u.id)%90===0){const j=sampleNear(u.x,u.y,2.5,k=>canStand(u,k)&&bld[k]===-1&&bm[k]!==BM.CORRUPT,6);if(j>=0)setBiome(j,BM.CORRUPT,.04)}
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    if(d>2.5&&d<13&&step>=u.bcd){u.bcd=step+300+((R()*140)|0);hellfire(u,t)}
    if(d<14&&--u.fcd<=0){u.fcd=480+((R()*200)|0);summon(u,'imp',u.hp<u.maxhp*.5?3:2)}
    return false;
  },
  imp(u){
    if((step+u.id)%40===0&&R()<.3)ignite(tileOf(u),true);
    return false;
  },
  spider(u){
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    /* it spins its brood out of thin air once the fight starts */
    if(step>=u.bcd&&d<12){u.bcd=step+360+((R()*160)|0);summon(u,'spiderling',3)}
    /* webs: the victim and everyone near it is bound fast, and the venom does the rest */
    if(d>2.4&&d<9&&--u.fcd<=0){u.fcd=120+((R()*70)|0);web(u,t)}
    return false;
  },
  ogre(u){
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    if(u.haste>step&&d<1.9){u.haste=0;hit(t,u.dmg*1.5,u,true);shove(t,u.x,u.y,2.2);t.frozen=step+20;slam(u,2.2,.5,10)}
    else if(d>4.5&&d<12&&step>=u.bcd){u.bcd=step+250+((R()*120)|0);u.haste=step+34;sfx('roar',u.x,u.y)}
    else if(d<2.3&&--u.fcd<=0&&crowd(u,2.2)>=2){u.fcd=190+((R()*80)|0);slam(u,2.4,.6,12)}
    return false;
  },
  dragon(u){
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    /* a cone of fire that sets the land alight */
    if(d<8&&--u.fcd<=0){u.fcd=(u.rage>step?56:90)+((R()*50)|0);breatheCone(u,t)}
    /* roar: the unarmed are rooted with terror */
    if(d<15&&step>=u.bcd){u.bcd=step+440+((R()*220)|0);roar(u,10)}
    /* below half health it beats its wings and hurls attackers away */
    if(u.hp<u.maxhp*.5&&d<3.4&&step%240===u.id%240)slam(u,3.4,.5,12);
    return false;
  },
  sandworm(u){
    /* below ground nothing can touch it: it tunnels to its prey, or to a safe sandy hollow to heal */
    if(u.dig){
      if(u.dig<=step){emerge(u,u.dtile<0);return false}
      const t=u.target;
      if(u.dtile>=0){
        const tx=(u.dtile%W)+.5,ty=((u.dtile/W)|0)+.5;u.tx=tx;u.ty=ty;
        if(Math.hypot(tx-u.x,ty-u.y)>.7)tunnel(u,.14);
        else{
          u.hp=Math.min(u.maxhp,u.hp+u.maxhp*.0007);
          if(u.hp>=u.maxhp*.75){emerge(u,false);return false}
        }
      }else{
        if(!t||t.dead){emerge(u,false);return false}
        u.tx=t.x;u.ty=t.y;tunnel(u,.115);
        if(Math.hypot(t.x-u.x,t.y-u.y)<1.7)emerge(u,true);
      }
      return true;
    }
    /* badly hurt: dive and slip away to heal */
    if(u.hp<u.maxhp*.3){
      const j=safeBurrow(u);
      if(j>=0){goUnder(u,j,step+2600);return true}
    }
    const t=u.target;if(!t)return false;
    const d=Math.hypot(t.x-u.x,t.y-u.y);
    /* it burrows to ambush when the prey is a little way off */
    if(d>4&&d<12&&u.hp>u.maxhp*.4&&step>=u.bcd&&!fire[tileOf(u)]){u.bcd=step+420+((R()*200)|0);goUnder(u,-1,step+230);return true}
    if(d<3.2&&--u.fcd<=0&&crowd(u,3)>=3){u.fcd=210+((R()*80)|0);slam(u,3.2,.6,14)}
    return false;
  },
  basilisk(u){
    /* its stare locks the hunted rigid for a moment while it closes in */
    if(u.target&&(step+u.id)%36===0){
      const t=u.target;
      if(!(t.frozen>step)&&Math.hypot(t.x-u.x,t.y-u.y)<5){
        t.frozen=step+70;t.moving=false;
        effects.push({type:'rite',x:t.x,y:t.y,c:[190,190,150],t:0,dur:22});sfx('cry',u.x,u.y,'basilisk');
      }
    }
    return false;
  },
  thunderbird(u){
    /* hurls a bolt of lightning from the sky at whatever it hunts */
    if(u.target&&--u.fcd<=0){
      const t=u.target,d=Math.hypot(t.x-u.x,t.y-u.y);
      if(d<8){
        u.fcd=60+((R()*50)|0);
        const px=t.x+(R()-.5)*3,py=t.y-14,pts=[];
        for(let k=0;k<=6;k++){const q=k/6;pts.push([px+(t.x-px)*q+(k&&k<6?(R()-.5)*2.4:0),py+(t.y-py)*q])}
        effects.push({type:'bolt',pts,t:0,dur:12});
        ignite(tileOf(t),true);hit(t,u.dmg*1.4,u);sfx('thunder',t.x,t.y);
      }else u.fcd=0;
    }
    return false;
  },
/*ACT-END*/
};

/* ---------- great-beast helpers ---------- */
const foeOf=(u,v)=>!v.dead&&v!==u&&(u.charm==null?!isMon(v):(isMon(v)&&v.charm!==u.charm)||(v.k===0&&v.tribe!==u.charm&&hostile(v.tribe,u.charm)));
function eachNear(x,y,r,fn){
  const gx0=clamp((x-r)/GC|0,0,GW-1),gx1=clamp((x+r)/GC|0,0,GW-1),gy0=clamp((y-r)/GC|0,0,GH-1),gy1=clamp((y+r)/GC|0,0,GH-1);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
    const cell=grid[gy*GW+gx];
    for(let n=0;n<cell.length;n++){const v=cell[n];if(!v.dead&&Math.hypot(v.x-x,v.y-y)<r)fn(v)}
  }
}
function crowd(u,r){let n=0;eachNear(u.x,u.y,r,v=>{if(foeOf(u,v))n++});return n}
function shove(v,fx,fy,dist){
  const dx=v.x-fx,dy=v.y-fy,d=Math.hypot(dx,dy)||1,nx=v.x+dx/d*dist,ny=v.y+dy/d*dist;
  if(inb(nx|0,ny|0)&&canStand(v,(ny|0)*W+(nx|0))){v.x=nx;v.y=ny;v.tx=nx;v.ty=ny}
}
/* a stomp or buffet: damage, a shove and a short stun for every foe within r */
function slam(u,r,dm,stun){
  eachNear(u.x,u.y,r,v=>{if(foeOf(u,v)){hit(v,u.dmg*dm,u,true);if(!v.dead){shove(v,u.x,u.y,1.6);v.frozen=Math.max(v.frozen|0,step+stun)}}});
  if(effects.length<300)effects.push({type:'quake',x:u.x,y:u.y+.2,r,t:0,dur:26});
  sfx('slam',u.x,u.y);
}
function throwRock(u,t){
  if(effects.length<300)effects.push({type:'boulder',x0:u.x,y0:u.y-1.4,x1:t.x,y1:t.y,t:0,dur:18});
  hit(t,u.dmg*.8,u,false);
  eachNear(t.x,t.y,1.3,v=>{if(v!==t&&foeOf(u,v))hit(v,u.dmg*.4,u,false)});
  sfx('boulder',u.x,u.y);
}
function web(u,t){
  const stunned=[];eachNear(t.x,t.y,1.4,v=>{if(foeOf(u,v))stunned.push(v)});
  if(!stunned.includes(t))stunned.push(t);
  for(const v of stunned){v.frozen=step+75;v.moving=false;v.venom=step+120;if(effects.length<300)effects.push({type:'web',x0:u.x,y0:u.y-.5,x1:v.x,y1:v.y-.2,t:0,dur:75})}
  sfx('web',u.x,u.y);
}
function summon(u,sp,n){
  if(units.length>1450||(cnt.sp[sp]||0)>=SPECIES[sp].cap)return;
  for(let k=0;k<n;k++){
    const a=addAnimal(sp,u.x|0,u.y|0);a.x=a.px=u.x+(R()-.5)*1.6;a.y=a.py=u.y+(R()-.5)*1.6;
    if(!canStand(a,tileOf(a))){a.x=a.px=u.x;a.y=a.py=u.y}
    a.target=u.target;a.life=Math.min(a.life,YEAR*1.2);cnt.sp[sp]=(cnt.sp[sp]||0)+1;
    if(effects.length<300)effects.push({type:'rite',x:a.x,y:a.y,c:sp==='imp'?[255,90,40]:[150,110,190],t:0,dur:16});
  }
  sfx('cry',u.x,u.y,sp);
}
function roar(u,r){
  eachNear(u.x,u.y,r,v=>{if(foeOf(u,v)&&v.k===0&&!(v.job==='soldier'||v.job==='general')){v.frozen=step+30;v.moving=false}});
  if(effects.length<300)effects.push({type:'rite',x:u.x,y:u.y,c:[255,120,60],t:0,dur:40,big:true});
  sfx('roar',u.x,u.y);
}
/* dragonfire: a cone, scorching the ground and burning everything caught in it */
function breatheCone(u,t){
  const a=Math.atan2(t.y-u.y,t.x-u.x),L=7.2,spread=.42;
  for(let k=-1;k<=1;k++)if(effects.length<300)effects.push({type:'flame',x0:u.x,y0:u.y-1,x1:u.x+Math.cos(a+k*.3)*L,y1:u.y+Math.sin(a+k*.3)*L*.9-.3,t:0,dur:24});
  for(let r=1.6;r<=L;r+=.9){
    for(let k=-2;k<=2;k++){
      const aa=a+k*spread/2,X=(u.x+Math.cos(aa)*r)|0,Y=(u.y+Math.sin(aa)*r)|0;
      if(inb(X,Y)&&R()<.8)ignite(Y*W+X,true);
    }
  }
  eachNear(u.x,u.y,L,v=>{
    if(!foeOf(u,v))return;
    let da=Math.atan2(v.y-u.y,v.x-u.x)-a;da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da)));
    if(da<spread+.12){v.burn=step+100;hit(v,u.dmg*.42,u)}
  });
  sfx('breath',u.x,u.y);
}
/* a rain of hellfire around the hunted */
function hellfire(u,t){
  for(let k=0;k<6;k++){
    const x=t.x+(R()-.5)*6,y=t.y+(R()-.5)*6;if(!inb(x|0,y|0))continue;
    if(effects.length<300)effects.push({type:'blast',x,y,r:2,t:0,dur:30+k*3,c:[255,96,32],dark:false,big:false});
    ignite((y|0)*W+(x|0),true);
    eachNear(x,y,1.6,v=>{if(foeOf(u,v))hit(v,u.dmg*.45,u)});
  }
  sfx('hellfire',t.x,t.y);
}
/* ---- the sand worm below ground ---- */
function tunnel(u,spd){
  const dx=u.tx-u.x,dy=u.ty-u.y,d=Math.hypot(dx,dy);
  if(Math.abs(dx)>.05)u.dir=dx>0?1:-1;
  if(d<=spd){u.x=u.tx;u.y=u.ty;return}
  const nx=u.x+dx/d*spd,ny=u.y+dy/d*spd;
  if(!inb(nx|0,ny|0)||!canStand(u,(ny|0)*W+(nx|0))){emerge(u,false);return}
  u.x=nx;u.y=ny;u.moving=true;
}
function goUnder(u,tile,until){
  u.dig=until;u.dtile=tile;if(tile>=0)u.target=null;u.task=null;
  if(effects.length<300)effects.push({type:'quake',x:u.x,y:u.y+.2,r:1.8,t:0,dur:26});
  sfx('burrow',u.x,u.y);
}
function emerge(u,ambush){
  u.dig=0;u.dtile=-1;u.cd=0;u.bcd=step+260;u.moving=false;
  u.px=u.x;u.py=u.y;
  eachNear(u.x,u.y,2.5,v=>{if(foeOf(u,v)){hit(v,u.dmg*(ambush?1.5:.7),u,true);if(!v.dead){shove(v,u.x,u.y,1.8);v.frozen=Math.max(v.frozen|0,step+(ambush?24:12))}}});
  const p=nearest(u,u.hp<u.maxhp*.5?4:SPECIES.sandworm.sight,v=>foeOf(u,v));if(p)u.target=p;
  if(effects.length<300){effects.push({type:'quake',x:u.x,y:u.y+.2,r:2.8,t:0,dur:30});effects.push({type:'rite',x:u.x,y:u.y,c:[214,180,120],t:0,dur:30,big:true})}
  sfx('erupt',u.x,u.y);
}
/* a sandy hollow far from any soldier, outside every border where possible: where a hurt worm will rest */
function safeBurrow(u){
  const lone=(k,r)=>{const p={x:k%W+.5,y:((k/W)|0)+.5};return !nearest(p,r,v=>v.k===0)};
  const sandy=k=>bm[k]===BM.WASTE||bio(hgt[k])===2;
  for(const pass of [0,1,2]){
    for(let n=0;n<45;n++){
      const k=sampleNear(u.x,u.y,pass===2?46:34,j=>canStand(u,j)&&!lava[j]&&!fire[j]&&bld[j]===-1&&(pass===2||(own[j]<0&&(pass===1||sandy(j)))),1);
      if(k>=0&&lone(k,pass===2?10:14))return k;
    }
  }
  return -1;
}


/* ---------- lasting effects of the extra powers (called from updateWorldFx, drawn by drawWorldFx through FXDRAW) ---------- */
const WFX2={
  blizzard(f){
    if(step%4)return;
    for(const u of units){
      if(u.dead||u.inside||Math.hypot(u.x-f.x,u.y-f.y)>f.r)continue;
      if(!isMon(u)){u.hp-=.05;if(u.hp<=0){die(u);continue}}
      if(R()<.012&&!(u.frozen>step))u.frozen=step+70;
    }
    for(let n=0;n<10;n++){
      const a=R()*6.28,d=Math.sqrt(R())*f.r,X=(f.x+Math.cos(a)*d)|0,Y=(f.y+Math.sin(a)*d)|0;if(!inb(X,Y))continue;
      const i=Y*W+X;if(fire[i]){fire[i]=0;fires.delete(i)}
      if(lava[i]&&R()<.05)lava[i]=Math.max(1,lava[i]-60);
    }
  },
  magnet(f){
    for(const u of units){
      if(u.dead||u.inside||u.k!==0)continue;
      if(!(u.job==='soldier'||u.job==='miner'||u.job==='builder'))continue;
      const dx=f.x-u.x,dy=f.y-u.y,d=Math.hypot(dx,dy);if(d>f.r||d<.6)continue;
      const nx=u.x+dx/d*.13,ny=u.y+dy/d*.13;
      if(inb(nx|0,ny|0)&&canStand(u,(ny|0)*W+(nx|0))){u.x=nx;u.y=ny;u.tx=nx;u.ty=ny;u.task=null}
    }
    if(step%20===0)effects.push({type:'rite',x:f.x,y:f.y,c:[230,90,90],t:0,dur:18});
  },
  ufo(f){
    f.a+=(R()-.5)*.4;f.x+=Math.cos(f.a)*.08;f.y+=Math.sin(f.a)*.05;
    if(f.x<2||f.x>W-3)f.a=Math.PI-f.a;if(f.y<2||f.y>H-3)f.a=-f.a;
    f.x=clamp(f.x,1,W-2);f.y=clamp(f.y,1,H-2);
    if((step-f.at)%45===0){
      const v=nearest({x:f.x,y:f.y+1.5},4,w=>!w.dead&&!w.inside&&!isMon(w));
      if(v){
        f.beam=step+14;f.tx=v.x;f.ty=v.y;
        if(v.k===1&&R()<.4)morphAnimal(v,pick(WILD_PICK));
        else if(v.k===1&&R()<.3){v.scale=(v.scale||1)*1.4;v.maxhp*=1.6;v.hp=v.maxhp}
        teleport(v);sfx('spawn',f.x|0,f.y|0);
      }
    }
  },
};
const FXDRAW={
  quake(f,X,Y,tz,pz){
    const T=f.until-f.at,t=Math.max(0,Math.min(1,(step-f.at+alpha)/T)),R0=tz*f.r,env=t<.1?t/.1:Math.max(0,1-(t-.1)/.9);
    /* ground darkening and shockwave rings */
    const g=ctx.createRadialGradient(X,Y,0,X,Y,R0*.8);g.addColorStop(0,`rgba(60,40,25,${.4*env})`);g.addColorStop(1,'rgba(60,40,25,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,R0*.8,0,7);ctx.fill();
    ctx.lineWidth=Math.max(2,tz*.35);
    for(let k=0;k<4;k++){const q=t*2.4-k*.28;if(q<=0||q>=1)continue;ctx.strokeStyle=`rgba(210,180,130,${.7*(1-q)})`;ctx.beginPath();ctx.arc(X,Y,R0*(.1+q*.95),0,7);ctx.stroke()}
    /* fissures: the main fault plus radial cracks, jagged and growing */
    const grow=Math.min(1,t*4),seed=f.s;
    const crack=(a,len,w,id)=>{
      const n=14,L=len*grow;let px=X,py=Y,ca=a;ctx.beginPath();ctx.moveTo(px,py);
      for(let k=1;k<=n;k++){ca+=(hash(k*7+seed,id)-.5)*.9;const sl=L/n;px+=Math.cos(ca)*sl;py+=Math.sin(ca)*sl;ctx.lineTo(px,py)}
      ctx.strokeStyle=`rgba(20,10,5,${.9*Math.min(1,env*1.6)})`;ctx.lineWidth=w;ctx.stroke();
      ctx.strokeStyle=`rgba(255,150,60,${.35*env})`;ctx.lineWidth=Math.max(1,w*.35);ctx.stroke();
    };
    const cw0=Math.max(2,tz*.42);
    crack(f.a,R0*.95,cw0*1.4,1);crack(f.a+Math.PI,R0*.95,cw0*1.4,2);
    for(let k=0;k<7;k++){const a=f.a+.5+k*.9+hash(k,seed)*.4;crack(a,R0*(.35+hash(k+3,seed)*.4),cw0*.7,k+10)}
    /* dust plumes and flying debris (visual only, a pure function of time) */
    for(let k=0;k<22;k++){
      const h=hash(k,seed+11),a=h*6.28,d=Math.sqrt(hash(k,seed+5))*R0*.9,life=((t*3+hash(k,seed+2)*2)%1.2);if(life>1)continue;
      const px=X+Math.cos(a)*d,py=Y+Math.sin(a)*d*.8-life*tz*3,r=tz*(.5+life*1.6);
      ctx.fillStyle=`rgba(170,145,110,${.45*(1-life)*env})`;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill();
    }
    ctx.fillStyle='rgba(90,70,50,.95)';
    for(let k=0;k<26;k++){
      const h=hash(k,seed+17),a=h*6.28,d=hash(k,seed+19)*R0*.8,life=((t*4+hash(k,seed+23)*3)%1.5);if(life>1)continue;
      const jump=Math.sin(life*Math.PI)*tz*(1+h*2.2),s=Math.max(2,Math.ceil(pz*1.3));
      ctx.fillRect(Math.round(X+Math.cos(a)*d),Math.round(Y+Math.sin(a)*d*.8-jump),s,s);
    }
  },
  blizzard(f,X,Y,tz,pz){
    const r=tz*f.r,g=ctx.createRadialGradient(X,Y,0,X,Y,r);
    g.addColorStop(0,'rgba(230,240,255,.32)');g.addColorStop(1,'rgba(230,240,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(let k=0;k<46;k++){const a=hash(k,3)*6.28,d=Math.sqrt(hash(k,5))*r,px=X+Math.cos(a)*d+((frameN*3+k*13)%(tz*4))-tz*2,py=Y+Math.sin(a)*d*.6-tz*2+((frameN*4+k*29)%(tz*3));
      ctx.fillRect(Math.round(px),Math.round(py),Math.max(2,Math.ceil(pz*1.2)),Math.max(2,Math.ceil(pz*1.2)))}
  },
  magnet(f,X,Y,tz,pz){
    ctx.strokeStyle='rgba(120,160,255,.6)';ctx.lineWidth=Math.max(1.5,tz*.2);
    for(let k=0;k<3;k++){const q=((frameN*.03+k/3)%1),r=tz*f.r*(1-q);ctx.globalAlpha=q;ctx.beginPath();ctx.ellipse(X,Y,r,r*.6,0,0,7);ctx.stroke()}
    ctx.globalAlpha=1;
    const w=tz*1.6;ctx.fillStyle='#d83a3a';ctx.fillRect(X-w,Y-w*.9,w*.7,w*1.1);ctx.fillStyle='#e8e8f0';ctx.fillRect(X-w,Y-w*.15,w*.7,w*.35);
    ctx.fillStyle='#d83a3a';ctx.fillRect(X+w*.3,Y-w*.9,w*.7,w*1.1);ctx.fillStyle='#e8e8f0';ctx.fillRect(X+w*.3,Y-w*.15,w*.7,w*.35);
    ctx.fillStyle='#6a6a7a';ctx.fillRect(X-w,Y+w*.2,w*2,w*.5);
  },
  ufo(f,X,Y,tz,pz){
    const bob=Math.sin(frameN/9)*tz*.2,Yy=Y-tz*6+bob,w=tz*2.4;
    if(f.beam>step&&inb(f.tx|0,f.ty|0)){
      const bx=ox2(f.tx,X,f.x,tz),by=oy2(f.ty,Y,f.y,tz);
      const g=ctx.createLinearGradient(0,Yy,0,by);g.addColorStop(0,'rgba(150,255,170,.7)');g.addColorStop(1,'rgba(150,255,170,.15)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(X-tz*.5,Yy+tz*.4);ctx.lineTo(X+tz*.5,Yy+tz*.4);ctx.lineTo(bx+tz*1.3,by);ctx.lineTo(bx-tz*1.3,by);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(X,Y,w*.8,w*.28,0,0,7);ctx.fill();
    ctx.fillStyle='#9ad8ff';ctx.beginPath();ctx.ellipse(X,Yy-tz*.5,w*.4,tz*.7,0,Math.PI,0);ctx.fill();
    ctx.fillStyle='#b8bccb';ctx.beginPath();ctx.ellipse(X,Yy,w,tz*.7,0,0,7);ctx.fill();
    ctx.fillStyle='#7a7f94';ctx.beginPath();ctx.ellipse(X,Yy+tz*.25,w*.9,tz*.4,0,0,Math.PI);ctx.fill();
    for(let k=-2;k<=2;k++){ctx.fillStyle=(k+((frameN>>3)&3))%2?'#ffe066':'#7fff9a';ctx.fillRect(X+k*w*.32-tz*.15,Yy-tz*.1,tz*.3,tz*.3)}
  },
};
const ox2=(wx,X,fx,tz)=>X+(wx-fx)*tz,oy2=(wy,Y,fy,tz)=>Y+(wy-fy)*tz;

/* ---------- life from the land: the biomes give birth to their own creatures (called from biomeLife) ---------- */
function faunaBiome(i,b){
  const r=R();
  switch(b){
    case BM.JUNGLE:if(r<.0035)spawnMon('monkey',i);else if(r<.0042)spawnMon('maneater',i);else if(r<.0046)spawnMon('parrot',i);else if(r<.0049)spawnMon('basilisk',i);else if(r<.0051)spawnMon('tiger',i);break;
    case BM.SAV:if(r<.0014)spawnMon('hyena',i);else if(r<.0018)spawnMon('rhino',i);else if(r<.0026)spawnMon('gazelle',i);else if(r<.0028)spawnMon('lion',i);break;
    case BM.WASTE:if(r<.003)spawnMon('scorpion',i);else if(r<.0033)spawnMon('sandworm',i);else if(r<.0036)spawnMon('basilisk',i);else if(r<.0042)spawnMon('mongoose',i);break;
    case BM.ROCK:if(r<.0006)spawnMon('troll',i);else if(r<.0012)spawnMon('lynx',i);break;
    case BM.CRYS:if(r<.0006)spawnMon('golem',i);break;
    case BM.FOREST:if(r<.003)spawnMon('raccoon',i);else if(r<.0033)spawnMon('treant',i);break;
    case BM.FLOWER:case BM.CLOVER:if(r<.005)spawnMon(r<.0025?'bee':'butterfly',i);else if(r<.0053)spawnMon('unicorn',i);break;
    case BM.CORRUPT:if(r<.0004)spawnMon('demon',i);else if(r<.0009)spawnMon('mage',i);break;
    case BM.CANDY:if(r<.004)spawnMon('slime',i);break;
    case BM.LEMON:if(r<.002)spawnMon('slime',i);break;
  }
}
/* the dead are restless at night: skeletons and ghosts rise from ruins (called every step from updateWorldFx) */
function faunaWorld(){
  /* thunderbirds ride in on big storms */
  if(step%300===151&&WX.storm>.45&&units.length<1400&&(cnt.sp.thunderbird||0)<SPECIES.thunderbird.cap&&R()<.3){
    const i=randomLand(j=>bio(hgt[j])>=4,200);if(i>=0)spawnMon('thunderbird',i);
  }
  if(step%240!==97||!isNight()||units.length>1400)return;
  let pick1=-1,n=0;
  for(let i=0;i<N;i++)if(bld[i]===-2&&R()<1/(++n))pick1=i;
  if(pick1<0)return;
  if(R()<.55)spawnMon('skeleton',pick1);else spawnMon('ghost',pick1);
}

/* ---------- extra god powers ---------- */
const sendFx=(p,c,big)=>effects.push({type:'rite',x:p.x,y:p.y,c,t:0,dur:36,big:!!big});
Object.assign(BRUSHFN,{
  sponge:(p,r,k)=>brushAt(p.x,p.y,r,i=>{if(hgt[i]<.41&&bld[i]===-1){hgt[i]=Math.min(.41,hgt[i]+.035*k);afterH(i);markTile(i)}}),
  heal:(p,r,k)=>{
    for(const u of units){
      if(u.dead||u.inside||isMon(u)||Math.hypot(u.x-p.x,u.y-p.y)>r+.8)continue;
      u.hp=Math.min(u.maxhp,u.hp+.9*k);
      if(u.traits&&u.traits.includes('Cursed')&&R()<.02*k)u.traits=u.traits.filter(t=>t!=='Cursed');
    }
    if(RC()<.25*k)effects.push({type:'rite',x:p.x+(RC()-.5)*r,y:p.y+(RC()-.5)*r,c:[150,255,170],t:0,dur:20});
  },
  blight:(p,r,k)=>{
    brushAt(p.x,p.y,r,i=>{if(tree[i]&&R()<.03*k){tree[i]=0;markTile(i)}});
    for(const u of units){
      if(u.dead||u.inside||Math.hypot(u.x-p.x,u.y-p.y)>r+.8)continue;
      if(isMon(u))continue;u.hp-=.14*k;if(u.hp<=0)die(u);
    }
    if(RC()<.25*k)effects.push({type:'rite',x:p.x+(RC()-.5)*r,y:p.y+(RC()-.5)*r,c:[130,190,60],t:0,dur:20});
  },
});
BOMBS.napalm={r:5.5,crater:0,fire:1,core:.35,shake:7,dur:36,c:[255,120,40],name:'Napalm',snd:'crackle'};
Object.assign(TAPS,{
  napalm:p=>{
    blast(p.x,p.y,BOMBS.napalm);
    for(let k=0;k<26;k++){const a=R()*6.28,d=R()*8,X=(p.x+Math.cos(a)*d)|0,Y=(p.y+Math.sin(a)*d)|0;if(inb(X,Y))ignite(Y*W+X,true)}
  },
  drought:p=>{
    const x=p.x|0,y=p.y|0;if(!inb(x,y))return;const r=15;
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const d=Math.hypot(dx,dy);if(d>r)continue;
      const i=Y*W+X,f=d/r,b=bio(hgt[i]);
      if(b===1&&R()<.55*(1-f*.5)){hgt[i]=.43;afterH(i)}
      else if(b>=3&&b<=4){
        if(tree[i]&&R()<.4*(1-f)){tree[i]=0;if(R()<.1)ignite(i,true)}
        if(bld[i]===-1&&bm[i]===0&&R()<.04*(1-f))bm[i]=BM.WASTE;
      }
      markTile(i);
    }
    const T=tribeNear(p);if(T)T.food=Math.max(0,T.food-16);
    setWeather('clear');WX.rain*=.2;
    effects.push({type:'blast',x:x+.5,y:y+.5,r:r*.7,t:0,dur:50,c:[240,200,110],dark:false,big:false});
    log(`A drought parched the land ${nearTribeText(x,y)}.`,[220,180,90]);sfx('crackle',x,y);
  },
  blizzard:p=>{
    setWeather('snow');wfx.push({type:'blizzard',x:p.x,y:p.y,until:step+320,r:10});
    log(`A blizzard howled in ${nearTribeText(p.x|0,p.y|0)}.`,[200,220,250]);sfx('thunder',p.x|0,p.y|0);
  },
  magnet:p=>{wfx.push({type:'magnet',x:p.x,y:p.y,until:step+140,r:10});sfx('spawn',p.x|0,p.y|0)},
  ufo:p=>{
    wfx.push({type:'ufo',x:p.x,y:p.y,a:R()*6.28,at:step,until:step+380});
    sfx('spawn',p.x|0,p.y|0);toast('A saucer drifts over the land, taking creatures and bringing them back changed.');
  },
  fireworks:p=>{
    const T=tribeNear(p);
    const cols=[[255,120,120],[120,200,255],[255,230,110],[190,140,255],[140,255,170]];
    for(let k=0;k<7;k++)effects.push({type:'rite',x:p.x+(R()-.5)*7,y:p.y+(R()-.5)*5-3,c:cols[k%5],t:0,dur:26+k*6,big:true});
    sfx('fanfare',p.x|0,p.y|0);
    if(T){T.stab=clamp(T.stab+4,0,100);T.devo=clamp(T.devo+2,0,100)}
  },
  orchard:p=>{
    let n=0;const r=2;
    brushAt(p.x,p.y,r,i=>{if(fertile(i)&&bld[i]===-1&&!fire[i]&&R()<.6){tree[i]=1;burnt[i]=0;markTile(i);n++}});
    if(!n){toast('Fruit trees need fertile open ground.');return}
    const T=tribeNear(p);if(T)T.food+=18;
    sendFx(p,[255,170,80]);sfx('unveil',p.x|0,p.y|0);
  },
  fling:p=>{
    const u=nearest({x:p.x,y:p.y},2.2,v=>!v.dead&&!v.inside);
    if(!u){toast('Tap a creature to pick it up and fling it.');return}
    const a=R()*6.28,d=10+R()*14;
    let tx=clamp(u.x+Math.cos(a)*d,1,W-2),ty=clamp(u.y+Math.sin(a)*d,1,H-2);
    effects.push({type:'rite',x:u.x,y:u.y,c:[255,255,255],t:0,dur:18});
    u.x=u.px=u.tx=tx;u.y=u.py=u.ty=ty;u.target=null;u.task=null;u.cd=0;
    if(!u.fly&&(!canStand(u,(ty|0)*W+(tx|0)))){die(u);sfx('splash',tx|0,ty|0);return}
    u.hp-=u.maxhp*.25;if(u.hp<=0)die(u);
    effects.push({type:'rite',x:tx,y:ty,c:[255,255,255],t:0,dur:18});sfx('thud',tx|0,ty|0);
  },
});

/* the items the power tray shows for these (appended to tabs in ui.js) */
const FAUNA_ITEMS={
  nature:[
    ['sponge','🧽','Sponge','Drag to soak up water: shallows and seas dry into sand.'],
    ['heal','💚','Healing hands','Drag over creatures to heal them and lift curses.'],
    ['blight','🥀','Blight','Drag to wither trees and sicken everything alive (monsters shrug it off).'],
    ['orchard','🍎','Orchard','Tap to plant a grove of fruit trees; a nearby kingdom gets food.'],
    ['drought','🏜️','Drought','Tap to bake the land dry: seas recede, trees die, crops fail, stores shrink.'],
    ['blizzard','🌨️','Blizzard','Tap to whip up a blizzard that freezes creatures and snuffs out fires.'],
  ],
  chaos:[
    ['napalm','🛢️','Napalm','Tap for a sheet of burning fuel that sets everything in a wide area alight.'],
    ['magnet','🧲','Magnet','Tap to hang a giant magnet: soldiers, miners and builders in armour are dragged to it.'],
    ['ufo','🛸','Flying saucer','Tap to send a saucer that abducts creatures and drops them elsewhere, sometimes changed.'],
  ],
  wonders:[
    ['fireworks','🎆','Fireworks','Tap for a fireworks show. A kingdom nearby feels calmer and prouder.'],
    ['fling','🤚','Hand of god','Tap a creature to pick it up and fling it far across the map.'],
  ],
};
