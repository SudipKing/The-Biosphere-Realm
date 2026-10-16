"use strict";
/* ============ People sprites: every race, every era of technology, jobs, generals and their mounts ============ */
/* personSprite(race,si,hi,col,fr,job,era,opts) -> baked sprite (facing right, feet on the bottom row).
   Local figure coordinates: x grows forward, y grows down; the figure is placed at (c.ox,c.oy) in the grid. */

/* ---------- small helpers ---------- */
function ppr(c,x,y,w,h,col){gr(c.g,c.ox+x,c.oy+y,w,h,col)}
function ppp(c,x,y,col){gp(c.g,c.ox+x,c.oy+y,col)}
function ppv(c,x,y0,y1,col){for(let y=y0;y<=y1;y++)gp(c.g,c.ox+x,c.oy+y,col)}
function ppMix(a,b,t){return[a[0]+(b[0]-a[0])*t|0,a[1]+(b[1]-a[1])*t|0,a[2]+(b[2]-a[2])*t|0]}
function ppMetal(era){return era<1?CL.stone:era<2?[206,144,58]:era<3?[166,172,186]:[216,222,234]}
function ppStyle(race,L){
  if(L.beast)return'beast';
  return race==='human'||race==='elf'||race==='dwarf'||race==='orc'||race==='gnome'||race==='goblin'||race==='saurian'?race:'human';
}
/* the style that decides weapons and manners: uplifted peoples act like the people they are built from */
function ppKin(race,L){return L.beast?(L.base||'human'):race}
function ppParams(st){
  switch(st){
    case'elf':return{H:15,hx:3,hw:4,hy:2,hh:4,tx:3,tw:3,ty:6,th:5,ly:11,lh:4,lw:1,hatx:3,hatw:4};
    case'dwarf':return{H:11,hx:3,hw:5,hy:1,hh:4,tx:2,tw:6,ty:5,th:3,ly:8,lh:3,lw:2,hatx:3,hatw:5};
    case'orc':return{H:14,hx:4,hw:5,hy:1,hh:4,tx:2,tw:6,ty:5,th:5,ly:10,lh:4,lw:2,hatx:4,hatw:5};
    case'gnome':return{H:12,hx:3,hw:4,hy:5,hh:3,tx:3,tw:4,ty:8,th:2,ly:10,lh:2,lw:1,hatx:3,hatw:4};
    case'goblin':return{H:11,hx:2,hw:6,hy:1,hh:4,tx:3,tw:4,ty:5,th:3,ly:8,lh:3,lw:1,hatx:3,hatw:5};
    default:return{H:13,hx:3,hw:4,hy:1,hh:4,tx:3,tw:4,ty:5,th:4,ly:9,lh:4,lw:1,hatx:3,hatw:4};
  }
}

/* ---------- legs ---------- */
function ppLegs(c,P,st,era,fr,s,sd,pants,k,priest){
  const {tx,tw,ly,lh,lw}=P,bare=era<2||st==='saurian';
  let col=bare?s:era===4?[226,222,210]:era===5?[72,68,80]:era===6?[62,96,152]:era===7?[212,224,238]:pants;
  let cold=bare?sd:sh(col,.78);
  if(priest){col=null}
  let a=tx,b=tx+tw-lw;
  if(fr===1){a=b=tx+((tw-lw)>>1)}
  const wid=fr===1?lw+1:lw;
  const boot=era<1?s:era<2?CL.hideD:era===4?[40,36,44]:era===6?CL.white:era===7?[226,236,246]:CL.boot;
  const bootD=sh(boot,.75),bh=era===4&&lh>=3?2:1;
  const leg=(x,cc,dd)=>{
    if(col)ppr(c,x,ly,wid,lh,cc);
    ppr(c,x,ly+lh-bh,wid,bh,dd);
  };
  leg(a,cold,bootD);
  leg(b,col||cold,boot);
  const fx=(fr===1?a:b)+wid;
  if(st==='saurian'||era<2){ppp(c,fx,ly+lh-1,era<1||st==='saurian'?sh(s,.9):boot)}
  else ppp(c,fx,ly+lh-1,boot);
  if(era===1&&st!=='saurian'){ppp(c,a,ly+lh-2,CL.hideD);ppp(c,b,ly+lh-2,CL.hideD)}
  if(era===6){ppr(c,a,ly+lh-1,wid,1,sh(k,1.15))}
  if(era===7){ppr(c,b,ly+lh-2,wid,1,sh(k,1.4))}
}

/* ---------- torso & clothing by era ---------- */
function ppTorso(c,P,era,k,s,sd,job,st){
  const {tx,ty,tw,th}=P,by=ty+th-1,kd=sh(k,.68),kl=sh(k,1.28),R=(x,y,w,h,cc)=>ppr(c,x,y,w,h,cc);
  switch(era){
    case 0:{
      R(tx,ty,tw,th,s);R(tx,ty,1,th,sd);
      for(let i=0;i<th;i++){const w=Math.min(tw,i+2);R(tx,ty+i,w,1,i===th-1?kd:k)}
      ppp(c,tx,by,sh(k,.55));ppp(c,tx+1,by,CL.hide);ppp(c,tx+2,by,k);
      if(tw>3){ppp(c,tx+tw-1,ty,CL.hideD);ppp(c,tx+tw-2,ty+1,k)}
      ppp(c,tx+1,ty+1,CL.hide);
      break}
    case 1:
      R(tx,ty,tw,th,k);R(tx,ty,1,th,kd);R(tx,by,tw,1,CL.belt);ppp(c,tx+1,by,CL.gold);ppp(c,tx+tw-1,ty,kl);
      R(tx,ty,tw,1,kl);ppp(c,tx+tw-1,ty,s);ppp(c,tx+1,ty,kl);
      break;
    case 2:
      R(tx,ty,tw,th,k);R(tx,ty,1,th,kd);R(tx,by,tw,1,CL.belt);ppp(c,tx+tw-2,by,CL.gold);
      ppp(c,tx+1,ty,sh(k,1.1));ppp(c,tx+tw-1,ty+1,kl);
      break;
    case 3:
      R(tx,ty,tw,th,k);R(tx,ty,1,th,kd);R(tx,by,tw,1,CL.belt);ppp(c,tx+1,by,CL.gold);
      R(tx,ty,tw,1,CL.gold);ppp(c,tx+tw-1,ty,sh(CL.gold,.8));
      if(th>2)R(tx+tw-2,ty+1,1,th-2,sh(CL.gold,.9));
      break;
    case 4:
      R(tx,ty,tw,th,k);R(tx,ty,1,th,kd);ppr(c,tx+tw-1,ty,1,1,kl);
      R(tx+tw-2,ty+1,1,th-1,kd);for(let y=ty+1;y<by;y+=2)ppp(c,tx+tw-1,y,CL.gold);
      R(tx,ty,tw,1,sh(k,1.15));ppp(c,tx+tw-1,ty,CL.white);
      R(tx,by,tw,1,[46,40,44]);
      break;
    case 5:
      R(tx,ty,tw,th,CL.white);R(tx,ty,tw,th,CL.white);
      R(tx,ty+1,tw,th-1,k);R(tx,ty+1,1,th-1,kd);
      R(tx+tw-2,ty,1,2,CL.white);ppp(c,tx+tw-1,ty,sh(k,.8));
      R(tx,by,tw,1,[52,44,44]);ppp(c,tx+1,by,CL.gold);
      break;
    case 6:
      R(tx,ty,tw,th,k);R(tx,ty,1,th,kd);R(tx+tw-1,ty,1,th,kl);
      R(tx+tw-2,ty,1,th,sh(k,.8));R(tx,ty,tw,1,sh(k,1.15));
      ppp(c,tx+tw-1,ty,CL.white);
      break;
    default:{
      const pale=[214,226,240];
      R(tx,ty,tw,th,pale);R(tx,ty,1,th,sh(pale,.78));
      R(tx+1,ty,tw-2,th,sh(k,1.1));ppp(c,tx+1,ty+1,[220,252,255]);
      R(tx,ty,tw,1,sh(k,1.4));R(tx,by,tw,1,sh(k,1.4));
      break}
  }
}
/* coats and robes continue below the torso */
function ppSkirt(c,P,era,k,st,job){
  const {tx,tw,ly,lh}=P,kd=sh(k,.68);
  if(era===4){const n=Math.min(2,lh-1);ppr(c,tx,ly,tw,n,k);ppr(c,tx,ly,1,n,kd);ppr(c,tx+tw-2,ly,1,n,kd);ppp(c,tx+tw-1,ly+n-1,[46,40,44])}
  else if(era===1||era===0){ppr(c,tx,ly,tw,1,era?kd:k);ppp(c,tx+tw-1,ly,sh(k,.8))}
  else if(era===3){ppr(c,tx,ly,tw,1,sh(k,.8));ppr(c,tx,ly,tw,1,sh(k,.85));ppp(c,tx+1,ly,CL.gold)}
}
function ppRobe(c,P,era,k,s){
  const {tx,tw,ty,ly,lh}=P,pale=era<1?[168,134,96]:era>=6?[250,248,246]:[240,236,226],end=ly+lh-2;
  ppr(c,tx,ty,tw,end-ty+1,pale);ppr(c,tx,ty,1,end-ty+1,sh(pale,.78));
  ppr(c,tx+tw-2,ty,1,end-ty+1,k);ppr(c,tx+tw-2,ty,2,1,sh(k,1.2));
  ppr(c,tx-1,end-1,1,2,sh(pale,.8));ppr(c,tx-1,end,tw+1,1,sh(pale,.86));ppp(c,tx-1,end,CL.gold);ppp(c,tx+tw-1,end,CL.gold);
  ppr(c,tx-1,ty,1,3,sh(pale,.7));
  ppr(c,tx,ty+2,tw,1,CL.gold);
  if(era>=7)ppr(c,tx,end,tw,1,[150,236,250]);
}

/* arms: a sleeve in clothing colour, then a hand */
function ppArms(c,P,era,k,s,sd,job,st,seated){
  const X=P.tx+P.tw,Y=P.ty+P.th-2,kd=sh(k,.68);
  const slv=era<1?s:era<3?sh(k,.9):k;
  ppv(c,X,P.ty,Y-1,slv);
  if(era>=2&&Y-1>P.ty)ppp(c,X,Y-1,sh(slv,.85));
  ppp(c,X,Y,era>=5&&era<7&&st!=='saurian'?CL.white:era===7?[226,240,250]:s);
  if(era>=5){ppp(c,X,Y,era===7?[226,240,250]:s)}
  /* back arm */
  ppv(c,P.tx-1,P.ty,P.ty+P.th-3,era<1?sd:kd);
}

/* ---------- heads ---------- */
function ppHead(c,P,st,s,sd,h,hd,k,L,era){
  const R=(x,y,w,hh,cc)=>ppr(c,x,y,w,hh,cc),p=(x,y,cc)=>ppp(c,x,y,cc);
  switch(st){
    case'elf':
      R(3,2,4,4,s);p(3,5,sd);p(6,5,sd);p(5,3,[44,140,96]);p(5,4,sh(s,.9));
      R(3,1,4,1,h);R(3,2,2,1,h);p(6,2,h);
      R(2,2,1,8,hd);R(1,3,1,5,hd);
      p(2,3,s);p(1,3,s);p(0,2,s);p(1,2,sh(s,.9));
      break;
    case'dwarf':
      R(3,1,5,4,s);p(8,3,sh(s,1.06));p(8,3,[238,160,128]);
      R(3,0,5,2,h);R(3,2,1,2,hd);p(6,2,CL.eye);R(6,1,2,1,hd);
      break;
    case'orc':{
      const jd=sh(s,.82);
      R(4,1,5,4,s);R(6,5,3,1,jd);R(4,4,1,1,jd);
      R(5,0,3,1,h);p(4,1,h);p(5,1,h);p(6,0,hd);p(4,0,h);
      p(7,2,CL.red);R(6,1,3,1,CL.dark);R(7,4,2,1,CL.dark);
      p(6,4,CL.tusk);p(8,4,CL.tusk);p(8,3,sd);p(9,3,s);
      break}
    case'gnome':
      R(3,5,4,3,s);p(7,6,CL.pink);p(7,7,CL.pink);p(5,6,CL.eye);p(3,7,sd);
      break;
    case'goblin':{
      const ye=[250,224,60];
      R(2,1,6,4,s);p(2,4,sd);p(7,4,sd);R(2,1,6,1,sd);
      /* ears */
      R(0,2,2,1,s);p(1,3,s);p(0,1,sd);R(8,1,2,1,s);p(9,0,s);p(8,2,s);p(9,1,sd);
      p(4,2,ye);p(5,2,ye);p(6,2,ye);p(5,2,CL.eye);
      p(8,3,sh(s,1.12));p(8,4,sh(s,1.12));
      R(4,4,3,1,CL.dark);p(5,4,CL.tusk);p(6,4,CL.tusk);
      p(4,0,h);p(5,0,h);p(5,-1,h);
      break}
    case'saurian':{
      R(3,1,4,3,s);R(7,2,2,2,s);R(4,4,4,1,sd);R(7,3,2,1,sh(s,.82));
      p(8,2,CL.dark);p(5,2,[250,214,40]);p(5,2,[250,214,40]);p(6,2,CL.dark);
      p(3,1,sd);p(3,2,sd);
      /* crest */
      p(3,0,h);p(4,0,hd);p(5,0,h);p(2,1,h);p(2,2,hd);p(2,3,h);p(2,4,hd);p(1,2,sh(h,1.1));p(4,-1,h);
      /* tail */
      R(2,7,1,2,s);R(1,9,1,2,s);p(0,10,sd);p(1,10,sd);p(2,9,sd);
      break}
    case'beast':{
      const ear=L.beast.ear,mz=sh(s,1.2);
      R(3,1,4,4,s);R(3,4,4,1,sd);p(3,1,sd);
      if(ear==='beak'){R(7,2,2,1,[244,196,60]);p(7,3,[214,160,40]);R(4,0,2,1,h);p(3,1,hd);p(5,-1,[226,44,30])}
      else if(ear==='none'){p(4,0,CL.eye);p(6,0,CL.eye);p(4,1,sd);p(6,1,sd);p(2,5,[220,70,52]);p(2,4,[220,70,52]);p(9,5,sh(s,.8));p(9,4,sh(s,.8))}
      else{R(7,3,2,2,mz);p(8,3,CL.dark);p(7,4,CL.pink)}
      p(5,2,CL.eye);
      if(ear==='pt'){p(3,0,sd);p(3,-1,sd);p(6,0,sd);p(6,-1,s)}
      else if(ear==='rd'){R(2,0,2,2,sd);p(6,0,s);p(7,0,sd)}
      else if(ear==='long'){R(4,-3,1,4,s);p(5,-2,sd);p(5,-1,sd);p(5,0,sd);p(4,-2,CL.pink);p(4,-1,CL.pink)}
      else if(ear==='horn'){p(3,0,CL.tusk);p(2,-1,CL.tusk);p(6,0,CL.tusk);p(7,-1,CL.tusk);p(2,0,sd)}
      R(2,2,1,3,h);
      if(ear!=='beak'&&ear!=='none'){R(1,7,2,1,s);p(0,8,sd);p(1,8,sd)}
      break}
    default:
      R(3,1,4,4,s);p(3,4,sd);p(6,4,sd);p(7,3,s);p(3,3,sd);
      R(3,0,4,1,h);R(3,1,4,1,h);R(3,2,1,2,hd);p(6,1,sh(h,1.2));
      p(5,2,CL.eye);
  }
}

/* ---------- hats and helmets ---------- */
function ppHat(c,P,st,job,era,k,gen){
  if(st==='gnome'){ppHatGnome(c,P,job,era,k);return}
  const x=P.hatx,w=P.hatw,y=P.hy,x1=x+w-1,R=(a,b,cw,ch,cc)=>ppr(c,a,b,cw,ch,cc),p=(a,b,cc)=>ppp(c,a,b,cc);
  const kl=sh(k,1.3),kd=sh(k,.7),m=ppMetal(era),mx=sh(m,1.12),md=sh(m,.78);
  const mid=x+(w>>1);
  if(gen){
    switch(era){
      case 0:R(x,y,w,1,CL.tusk);p(x,y,sh(CL.tusk,.8));
        for(let i=0;i<w;i++){const hh=i%2?3:2;ppv(c,x+i,y-hh,y-1,i%2?k:[226,44,30]);p(x+i,y-hh,i%2?kl:CL.white)}break;
      case 1:case 2:case 3:{
        const hm=era===1?[212,150,60]:era===2?[170,176,190]:[226,230,240];
        R(x,y-1,w,2,hm);R(x,y,1,1,sh(hm,.78));p(x1,y,sh(hm,.8));
        if(era===3){R(x,y+1,w,hh0(P),sh(hm,.88));p(x1,y+1,CL.dark);p(x1-1,y+1,CL.dark);}
        else p(x1,y+1,sh(hm,.7));
        ppv(c,x+1,y-3,y-2,k);p(x,y-2,k);p(x-1,y-1,kl);p(x+2,y-3,kl);p(x+1,y-4,kl);
        break}
      case 4:
        R(x-1,y-1,w+3,1,[46,44,56]);R(x,y-2,w+1,1,[46,44,56]);p(x-1,y,[46,44,56]);
        p(x-1,y-1,CL.gold);p(x+w+1,y-1,CL.gold);p(x+1,y-2,CL.gold);ppv(c,mid,y-4,y-3,k);p(mid+1,y-4,kl);p(mid,y-5,kl);
        break;
      case 5:
        R(x,y-1,w,2,[34,40,70]);R(x,y-2,w-1,1,[34,40,70]);R(x,y-1,w,1,CL.gold);p(x1+1,y,[24,26,40]);R(x1,y,2,1,[24,26,40]);
        p(mid,y-2,CL.gold);p(mid,y-2,CL.white);
        break;
      case 6:
        R(x-1,y-1,w+1,2,k);R(x,y-2,w-1,1,kl);p(x-1,y-1,kd);p(x+1,y-2,CL.gold);p(x1,y-1,k);
        break;
      default:
        R(x,y-1,w,2,[232,240,250]);R(x,y-2,w-1,1,[232,240,250]);R(x+1,y+1,w-1,1,[110,240,255]);p(x1,y,[110,240,255]);
        ppv(c,x,y-4,y-3,sh(k,1.5));ppv(c,x+1,y-5,y-3,sh(k,1.5));p(x+2,y-4,[200,252,255]);p(x-1,y-3,sh(k,1.5));
    }
    return;
  }
  switch(job){
    case'soldier':
      switch(era){
        case 0:p(x+1,y,[210,60,50]);p(x+2,y,CL.white);p(x1,y,[210,60,50]);ppv(c,x+2,y-2,y-1,[210,60,50]);break;
        case 1:R(x,y-1,w,2,[212,150,60]);p(x,y,[150,100,40]);p(x1,y,[150,100,40]);R(x+1,y-2,w-2,1,k);p(x1,y+1,[150,100,40]);break;
        case 2:ppv(c,mid,y-2,y-2,m);R(x,y-1,w,1,m);R(x,y,w,1,mx);p(x,y,md);p(x1,y+1,m);p(x1,y,md);p(mid,y-2,mx);R(mid,y-1,1,1,mx);break;
        case 3:R(x,y-1,w,hh0(P)+2,m);R(x,y-1,1,hh0(P)+2,md);R(x1-2,y+1,3,1,CL.dark);p(x1,y+2,md);p(x+1,y-2,k);p(x+2,y-2,sh(k,1.2));break;
        case 4:R(x-1,y-1,w+3,1,[46,44,56]);R(x,y-2,w+1,1,[46,44,56]);p(x-1,y,[46,44,56]);p(x-1,y-1,CL.white);p(x1+2,y-1,CL.white);p(x+1,y-2,k);break;
        case 5:R(x,y-1,w,2,[92,98,116]);p(x1+1,y,[60,64,76]);p(x,y,[60,64,76]);p(mid,y-2,CL.gold);p(mid,y-1,CL.gold);R(x,y-1,w,1,sh([92,98,116],1.2));break;
        case 6:R(x-1,y-1,w+2,2,ppMix(k,[86,98,66],.55));R(x,y-2,w-1,1,ppMix(k,[86,98,66],.45));p(x1+1,y,sh(k,.5));p(x,y+1,[40,40,40]);p(x+1,y-1,sh(k,1.2));break;
        default:R(x,y-1,w+1,2,[226,234,244]);R(x,y-2,w-1,1,[226,234,244]);R(x+1,y+1,w-1,1,[100,238,255]);p(x1+1,y,[100,238,255]);p(x,y+1,[226,234,244]);p(x,y-2,sh(k,1.5));p(x+1,y-2,sh(k,1.5));
      }
      break;
    case'farmer':
      if(era<1){R(x,y,w,1,CL.hide);p(x1,y,k)}
      else if(era<5){R(x-1,y,w+2,1,[238,208,110]);R(x,y-1,w,1,[226,192,92]);R(x,y,w,1,sh(k,1.1));p(x-1,y,sh([238,208,110],.8))}
      else if(era===5){R(x,y-1,w,2,[96,86,70]);p(x1+1,y,[70,62,52])}
      else if(era===6){R(x,y-1,w,2,k);R(x1,y,2,1,sh(k,.7));p(x+1,y-1,sh(k,1.2))}
      else{R(x,y+1,w,1,[110,240,255]);R(x,y-1,w,2,[222,232,244])}
      break;
    case'miner':
      if(era<1){R(x,y,w,1,CL.hideD)}
      else if(era<4){R(x,y-1,w,2,[120,90,60]);p(x1,y,[90,66,44])}
      else if(era===4){R(x-1,y,w+2,1,[60,56,56]);R(x,y-1,w,1,[60,56,56])}
      else if(era===5){R(x,y-1,w,2,[96,100,114]);p(x1,y-1,[255,244,150]);p(x1+1,y-1,[255,230,110])}
      else if(era===6){R(x,y-1,w,2,[244,206,40]);R(x-1,y,w+2,1,[244,206,40]);p(x1,y-1,[255,255,200]);p(x1+1,y-1,[255,240,130])}
      else{R(x,y-1,w,2,[232,238,246]);R(x+1,y+1,w-1,1,[100,238,255]);p(x1,y-1,[200,252,255])}
      break;
    case'woodcutter':
      if(era<1){R(x,y,w,1,CL.fur);p(x,y-1,CL.fur)}
      else if(era<4){R(x,y-1,w,2,[70,110,66]);p(x,y,[48,80,46]);p(x1,y,[48,80,46]);p(x1+1,y-1,[200,70,60])}
      else if(era<6){R(x,y-1,w,2,[60,56,64]);R(x1,y,2,1,[44,40,48])}
      else if(era===6){R(x,y-1,w,2,[232,110,40]);p(x-1,y+1,[210,210,216]);p(x1+1,y+1,[210,210,216])}
      else{R(x,y-1,w,2,[222,232,244]);R(x,y+1,w,1,[110,240,255])}
      break;
    case'builder':
      if(era<1){R(x,y,w,1,CL.plaster);p(x1,y,CL.plaster);p(x1+1,y+1,CL.plaster)}
      else if(era<3){R(x,y-1,w,2,CL.plaster);p(x,y+1,CL.plaster);p(x1,y,sh(CL.plaster,.8))}
      else if(era<5){R(x,y-1,w,2,[110,84,60]);R(x1,y,2,1,[84,62,44])}
      else if(era===5){R(x,y-1,w,2,[84,92,110]);R(x1,y,2,1,[56,60,72])}
      else if(era===6){R(x,y-1,w,2,[250,148,44]);R(x-1,y,w+2,1,[250,148,44]);p(mid,y-2,[255,190,100])}
      else{R(x,y-1,w,2,[244,248,252]);R(x-1,y,w+2,1,[244,248,252]);ppv(c,mid,y-2,y-2,[110,240,255]);p(x1,y+1,[110,240,255])}
      break;
    case'hunter':
      if(era<1){R(x,y,w,1,CL.hide);ppv(c,x+1,y-2,y-1,[226,44,30]);p(x+2,y-2,CL.white)}
      else if(era<4){R(x,y-1,w,2,[66,118,70]);p(x,y,[44,84,50]);p(x1,y,[44,84,50]);ppv(c,x+1,y-3,y-2,CL.white);p(x+2,y-3,[226,44,30])}
      else if(era===4){R(x-1,y,w+2,1,[100,76,52]);R(x,y-1,w,1,[100,76,52]);p(x+1,y-2,[226,44,30]);p(x,y-2,CL.white)}
      else if(era===5){R(x-1,y,w+3,1,[96,84,50]);R(x,y-1,w,1,[124,108,64])}
      else if(era===6){R(x,y-1,w,2,[96,116,70]);R(x1,y,2,1,[66,82,50]);p(x+1,y-1,[130,100,60])}
      else{R(x,y-1,w,2,[210,220,230]);p(x1,y+1,[110,240,255]);p(x1-1,y+1,[110,240,255])}
      break;
    case'priest':{
      const pale=era<1?CL.tusk:[244,240,230];
      if(era<1){R(x,y-1,w,2,pale);p(x,y+1,pale);ppv(c,x,y-3,y-2,[226,44,30]);ppv(c,mid,y-3,y-2,k);p(x1,y-2,CL.white)}
      else{R(x,y-1,w,2,pale);R(x,y+1,1,2,sh(pale,.86));p(mid,y-2,pale);R(x,y,w,1,CL.gold);p(x1,y-1,CL.gold)}
      if(era>=7){R(x,y-3,w,1,[130,240,255]);p(x-1,y-2,[130,240,255]);p(x1+1,y-2,[130,240,255])}
      break}
    case'teacher':
      if(era<1){R(x,y,w,1,CL.hideD)}
      else if(era>=3&&era<6){R(x-1,y-1,w+2,1,[34,34,50]);R(x,y-2,w,1,[34,34,50]);ppv(c,x1+1,y-1,y+1,k);}
      else if(era>=6){p(x1,y+1,CL.glass);p(x1-1,y+1,CL.glass);p(x1+1,y+1,CL.steelD);if(era>=7)p(x1,y+1,[130,240,255])}
      break;
  }
}
function hh0(P){return P.hh>3?2:1}
function ppHatGnome(c,P,job,era,k){
  /* the signature red pointed hat; jobs add a band or metal */
  const hat=[198,48,44],hl=sh(hat,1.2),hd=sh(hat,.78),R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc);
  R(2,4,7,1,hd);R(3,3,5,1,hat);R(4,2,3,1,hat);R(4,1,2,1,hat);p(5,0,hat);p(6,0,hl);p(7,0,hl);R(3,3,5,1,k);p(5,2,CL.white);p(3,3,k);
  p(6,3,CL.white);p(4,1,hl);
  if(job==='soldier'&&era>=2){R(3,4,5,1,ppMetal(era));p(5,3,ppMetal(era));if(era>=6){R(3,3,5,1,ppMix(k,[86,98,66],.5))}}
  if(job==='general'||job==='soldier'&&era===0){ppv(c,7,-2,0,job==='general'?k:[226,44,30])}
  if(job==='miner'&&era>=5)p(7,3,[255,244,150]);
  if(job==='builder'&&era>=6){R(3,3,5,2,[250,148,44])}
  if(job==='farmer'&&era<5)R(1,4,9,1,[238,208,110]);
  if(job==='priest'){R(3,3,5,1,CL.white);p(5,1,CL.gold)}
  if(era>=7){R(3,4,5,1,[130,240,255])}
}

/* ---------- weapons and tools ---------- */
function ppGun(c,X,Y,era,fat){
  const wood=era===6||era===7?null:CL.wood,R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc);
  if(era===4){R(X-4,Y,3,1,wood);p(X-4,Y+1,CL.woodD);R(X-1,Y-1,5,1,CL.steelD);R(X-1,Y,3,1,wood);p(X,Y-2,CL.steel);R(X+4,Y-1,2,1,CL.steelL);p(X+5,Y-2,CL.steelL);if(fat)R(X-1,Y,5,1,CL.steelD)}
  else if(era===5){R(X-4,Y,4,1,CL.woodD);p(X-4,Y+1,CL.woodD);R(X,Y-1,6,1,CL.steel);R(X-1,Y,5,1,CL.woodD);p(X+1,Y-2,CL.steelD);p(X+6,Y-1,CL.steelL);p(X+6,Y-2,CL.steelL);p(X-1,Y-1,CL.steelD);if(fat)R(X-1,Y,6,1,CL.steelD)}
  else if(era===6){const b=[44,46,54],bl=[84,88,100];R(X-3,Y-1,3,2,b);R(X,Y-1,5,1,b);p(X-1,Y,bl);R(X+1,Y,2,1,b);p(X+1,Y+1,bl);p(X+1,Y+2,bl);R(X+5,Y-1,1,1,bl);p(X,Y-2,bl);p(X+3,Y-2,bl)}
  else{const w=[236,242,250],g=[100,240,255];R(X-3,Y-1,4,2,w);R(X+1,Y-1,4,1,w);p(X+1,Y,sh(w,.8));p(X-2,Y+1,g);R(X+1,Y-2,2,1,g);p(X+5,Y-1,g);p(X+6,Y-1,[200,255,255]);p(X+7,Y-1,[200,255,255,140]);p(X+6,Y,g)}
}
function ppBow(c,X,Y,era,xb){
  const R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc),W=era<1?CL.tusk:CL.wood;
  if(xb){R(X-3,Y-1,6,1,CL.wood);R(X-3,Y,2,1,CL.woodD);ppv(c,X+2,Y-3,Y+1,CL.steelD);ppv(c,X+1,Y-3,Y-3,CL.white);p(X+1,Y+1,CL.white);p(X,Y-1,CL.steelL);p(X+1,Y-2,CL.steelL)}
  else{
    p(X+1,Y-4,W);p(X+2,Y-3,W);R(X+3,Y-2,1,5,W);p(X+2,Y+3,W);p(X+1,Y+4,W);ppv(c,X,Y-3,Y+3,[232,228,216]);
    p(X+1,Y,CL.steelL);p(X+2,Y,CL.steelL);p(X+3,Y,CL.steelL);
    if(era>=2){p(X+3,Y-3,CL.woodD);p(X+3,Y+3,CL.woodD)}
  }
}
function ppPole(c,X,Y,up,down,col){ppv(c,X,Y-up,Y+down,col)}
function ppWeapon(c,X,Y,kind,era,k){
  const R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc),m=ppMetal(era),ml=sh(m,1.2),md=sh(m,.8),W=CL.wood,WD=CL.woodD;
  switch(kind){
    case'spear':ppPole(c,X,Y,7,3,W);p(X,Y-8,ml);p(X,Y-9,m);if(era>=1)p(X+1,Y-8,md);else p(X+1,Y-8,sh(CL.stone,.8));p(X-1,Y-8,era<1?CL.stone:md);break;
    case'sword':ppPole(c,X,Y,0,1,WD);R(X-1,Y-1,3,1,CL.gold);ppv(c,X,Y-6,Y-2,ml);p(X,Y-7,CL.white);if(era>=3)ppv(c,X,Y-8,Y-7,ml);break;
    case'sabre':R(X-1,Y-1,3,1,CL.gold);p(X,Y,WD);ppv(c,X,Y-3,Y-2,CL.steelL);p(X+1,Y-4,CL.steelL);p(X+1,Y-5,CL.steelL);p(X+2,Y-6,CL.white);p(X+2,Y-7,CL.white);break;
    case'axe':ppPole(c,X,Y,5,3,W);R(X,Y-6,3,3,m);R(X+1,Y-6,1,3,ml);p(X+3,Y-5,ml);p(X,Y-4,md);break;
    case'hammer':ppPole(c,X,Y,5,3,W);R(X-1,Y-6,4,2,m);R(X-1,Y-6,4,1,ml);break;
    case'cleaver':
      if(era<1){ppPole(c,X,Y,4,2,W);R(X,Y-6,2,3,WD);p(X+1,Y-6,CL.tusk);p(X+2,Y-5,CL.tusk);p(X-1,Y-4,CL.tusk)}
      else{ppPole(c,X,Y,2,2,W);R(X,Y-7,3,5,m);R(X+2,Y-7,1,5,ml);p(X,Y-7,md);p(X+3,Y-6,ml)}break;
    case'dagger':ppPole(c,X,Y,0,1,WD);ppv(c,X,Y-3,Y-1,ml);p(X,Y-4,m);R(X-1,Y,3,1,CL.gold);ppv(c,X+3,Y-2,Y,ml);break;
    case'trident':ppPole(c,X,Y,6,3,W);ppv(c,X-1,Y-9,Y-7,ml);ppv(c,X+1,Y-9,Y-7,ml);ppv(c,X,Y-9,Y-7,ml);R(X-1,Y-7,3,1,m);break;
    case'club':ppPole(c,X,Y,3,2,W);R(X,Y-6,2,3,WD);p(X-1,Y-5,CL.tusk);p(X+2,Y-5,CL.tusk);break;
    case'dart':ppPole(c,X,Y,4,2,W);p(X,Y-5,ml);p(X,Y-6,m);p(X+1,Y-4,CL.white);break;
  }
}
/* the weapon a fighting person carries: kind depends on race kin, era and range */
function ppFightKind(kin,era,ranged,job){
  if(era>=4)return'gun';
  if(ranged&&kin!=='gnome')return job==='hunter'&&era>=3?'xbow':'bow';
  if(kin==='gnome')return era<1?'dart':'xbow';
  switch(kin){
    case'dwarf':return era<1?'hammer':era<3?'axe':'hammer';
    case'orc':return era<1?'club':'cleaver';
    case'goblin':return era<1?'spear':'dagger';
    case'saurian':return era<2?'spear':'trident';
    case'elf':return'bow';
    default:return era<2?'spear':'sword';
  }
}
function ppShield(c,P,era,k){
  const x=P.tx-1,y=P.ty+Math.max(0,(P.th>>1)-1),kd=sh(k,.65),R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc);
  if(era<=2){const rim=era===1?[212,150,60]:[170,176,190];R(x,y,4,4,rim);R(x+1,y+1,2,2,k);p(x+1,y+1,sh(k,1.3));p(x,y,sh(rim,.8));p(x+3,y+3,sh(rim,.8));p(x,y+3,sh(rim,.8));p(x+3,y,sh(rim,.8))}
  else{R(x,y-1,4,3,[226,230,240]);R(x+1,y+2,2,1,[226,230,240]);R(x+1,y-1,2,3,k);p(x+1,y-1,sh(k,1.3));p(x,y-1,CL.white);p(x+3,y-1,[150,156,170])}
}
function ppToolJob(c,P,st,L,job,era,k,kin){
  const X=P.tx+P.tw,Y=P.ty+P.th-2,R=(a,b,w,h,cc)=>ppr(c,a,b,w,h,cc),p=(a,b,cc)=>ppp(c,a,b,cc);
  const m=ppMetal(era),ml=sh(m,1.2),W=CL.wood,WD=CL.woodD,ranged=L.range>2,glow=[110,240,255];
  switch(job){
    case'soldier':{
      const kind=ppFightKind(kin,era,ranged,job);
      if(kind==='gun')ppGun(c,X-1,Y,era,kin==='orc'||kin==='dwarf');
      else if(kind==='bow')ppBow(c,X,Y,era,false);
      else if(kind==='xbow')ppBow(c,X,Y,era,true);
      else ppWeapon(c,X,Y,kind,era,k);
      if(era>=1&&era<=3&&kind!=='bow'&&kind!=='xbow')ppShield(c,P,era,k);
      if(era===4){ /* white cross belts */
        for(let i=0;i<P.th-1;i++){p(P.tx+Math.min(P.tw-1,i),P.ty+i,CL.white);p(P.tx+Math.max(0,P.tw-1-i),P.ty+i,CL.white)}
      }
      if(era===5){R(P.tx,P.ty+P.th-1,P.tw,1,[52,44,44]);p(P.tx+P.tw-1,P.ty+P.th-1,CL.steelL);p(P.tx,P.ty+1,[84,70,60])}
      if(era===6){R(P.tx,P.ty,P.tw,P.th-1,ppMix(k,[86,98,66],.5));R(P.tx+1,P.ty+1,P.tw-2,1,[60,66,52]);p(P.tx+P.tw-1,P.ty,k);p(P.tx+P.tw-1,P.ty+1,k)}
      if(era===7){R(P.tx,P.ty,P.tw,P.th,[226,234,246]);R(P.tx,P.ty,1,P.th,[168,178,196]);R(P.tx+1,P.ty+1,P.tw-2,P.th-2,k);p(P.tx+2,P.ty+1,[200,255,255]);R(P.tx-1,P.ty-1,2,2,[232,240,250]);p(P.tx-1,P.ty-1,k);R(P.tx+P.tw-1,P.ty-1,2,2,[232,240,250]);p(P.tx+P.tw,P.ty-1,k)}
      if(era===0){p(P.tx+P.tw-1,P.ty+1,[240,236,226]);p(P.tx+1,P.ty,[240,236,226])}
      break}
    case'general':ppWeapon(c,X,Y,'sabre',era,k);break;
    case'hunter':{
      const kind=era>=4?'gun':era>=3?'xbow':era<1?'spear':'bow';
      if(kind==='gun')ppGun(c,X-1,Y,Math.min(era,7)===4?4:era===5?5:era,false);
      else if(kind==='spear')ppWeapon(c,X,Y,'spear',0,k);
      else ppBow(c,X,Y,era,kind==='xbow');
      if(era>=1&&era<4){ppr(c,P.tx-2,P.ty,1,3,[110,76,50]);ppp(c,P.tx-2,P.ty-1,CL.white);ppp(c,P.tx-3,P.ty-1,[226,44,30])}
      if(era===5||era===6)ppp(c,X+1,Y-2,era===6?glow:CL.steelL);
      p(P.tx,P.ty+P.th,CL.hide);
      break}
    case'farmer':
      if(era===0){ppPole(c,X,Y,5,3,W);R(X,Y-6,3,1,CL.stone);p(X+2,Y-5,CL.stone)}
      else if(era===1){ppPole(c,X,Y,2,2,W);p(X+1,Y-3,m);p(X+2,Y-4,m);p(X+3,Y-4,ml);p(X+3,Y-3,ml)}
      else if(era===2||era===5){ppPole(c,X,Y,6,3,W);p(X,Y-7,m);R(X+1,Y-7,3,1,ml);p(X+3,Y-6,ml);p(X+4,Y-5,m)}
      else if(era===3||era===4||era===6){ppPole(c,X,Y,5,3,W);ppv(c,X-1,Y-8,Y-6,ml);ppv(c,X,Y-8,Y-6,ml);ppv(c,X+1,Y-8,Y-6,ml);R(X-1,Y-6,3,1,m)}
      else{ppPole(c,X,Y,5,3,[226,234,244]);R(X-1,Y-6,3,1,[200,210,226]);ppv(c,X-1,Y-8,Y-7,glow);ppv(c,X+1,Y-8,Y-7,glow);ppv(c,X,Y-8,Y-7,[200,255,255])}
      if(era>=1&&era<5)p(P.tx-1,P.ty+1,[238,208,110]);
      break;
    case'miner':
      if(era<=1){ppPole(c,X,Y,4,3,W);R(X-2,Y-5,5,1,era?m:CL.stone);p(X-2,Y-4,era?m:CL.stone);p(X+2,Y-4,era?m:CL.stone);if(era<1){p(X-1,Y-6,CL.tusk);p(X+1,Y-6,CL.tusk)}}
      else if(era<5){ppPole(c,X,Y,4,3,W);R(X-2,Y-5,5,1,m);p(X-2,Y-4,m);p(X+2,Y-4,ml);p(X+2,Y-5,ml)}
      else if(era===5){ppPole(c,X,Y,4,3,W);R(X-2,Y-5,5,1,CL.steel);p(X-2,Y-4,CL.steel);p(X+2,Y-4,CL.steelL);p(X+3,Y-6,[255,244,150])}
      else if(era===6){const o=[244,140,40];ppv(c,X,Y-1,Y+1,o);R(X-1,Y-2,3,1,CL.dark);ppv(c,X,Y+2,Y+5,CL.steelD);p(X+1,Y+5,CL.steelL);p(X-1,Y+1,o)}
      else{R(X-1,Y-2,3,3,[230,236,246]);p(X+1,Y-2,glow);ppv(c,X+1,Y+1,Y+4,glow);p(X+1,Y+5,[220,255,255]);p(X-1,Y-1,CL.steelD)}
      p(P.tx-1,P.ty+P.th-1,[60,56,64]);
      break;
    case'woodcutter':
      if(era<=3){ppPole(c,X,Y,5,3,W);R(X,Y-6,3,3,m);R(X+2,Y-6,1,3,ml);p(X+3,Y-5,ml);p(X,Y-4,sh(m,.8));if(era===0){p(X,Y-5,CL.hide);p(X,Y-4,CL.hide)}}
      else if(era===4){ppPole(c,X,Y,5,3,W);R(X,Y-6,3,2,m);p(X+3,Y-5,ml);R(P.tx-2,P.ty,1,4,CL.steelL);p(P.tx-2,P.ty+3,CL.steelD)}
      else if(era===5){R(X-3,Y-1,7,1,CL.steelL);ppv(c,X-3,Y-3,Y-1,W);ppv(c,X+3,Y-3,Y-1,W);R(X-3,Y-3,7,1,W);for(let i=0;i<7;i++)if(i%2)p(X-3+i,Y,CL.steelD)}
      else if(era===6){const o=[238,120,36];R(X-2,Y-1,3,3,o);R(X-2,Y-1,3,1,sh(o,1.2));R(X+1,Y,5,1,CL.steelL);for(let i=0;i<5;i++)p(X+1+i,Y+1,i%2?CL.dark:CL.steelD);p(X-2,Y-2,CL.dark);p(X+1,Y+1,CL.dark)}
      else{R(X-1,Y-2,3,3,[230,236,246]);p(X-1,Y,glow);R(X+2,Y-1,6,1,[160,250,255]);p(X+8,Y-1,[255,255,255]);R(X+2,Y,5,1,[110,240,255,160])}
      break;
    case'builder':
      if(era===0){ppPole(c,X,Y,3,3,W);R(X-1,Y-5,3,2,CL.stone);p(X-1,Y-5,CL.stoneL)}
      else if(era===1){ppPole(c,X,Y,3,3,W);R(X-1,Y-5,3,2,CL.woodD);p(X-1,Y-5,CL.wood)}
      else if(era<5){ppPole(c,X,Y,3,3,W);R(X-1,Y-5,4,2,m);R(X-1,Y-5,4,1,ml);if(era>=3){p(P.tx-1,P.ty+P.th-1,CL.steelL);p(P.tx-1,P.ty+P.th,CL.steelL)}}
      else if(era===5){ppPole(c,X,Y,4,3,W);R(X-1,Y-6,4,3,CL.steelD);R(X-1,Y-6,4,1,CL.steel);R(P.tx-2,P.ty+P.th-1,2,1,CL.steelL)}
      else if(era===6){const o=[238,130,36];R(X-2,Y-2,4,2,o);R(X-2,Y-2,4,1,sh(o,1.2));p(X-2,Y,CL.dark);R(X+2,Y-2,2,1,CL.steelL);p(X+4,Y-2,CL.steelD);R(X-1,Y,2,1,CL.dark)}
      else{R(X-1,Y-3,3,3,[22,60,78]);R(X-1,Y-3,3,1,glow);p(X,Y-2,[200,255,255]);ppv(c,X,Y,Y+1,glow)}
      break;
    case'teacher':{
      if(era===0){R(X-1,Y-3,3,3,[176,128,84]);p(X,Y-2,CL.hideD);p(X+1,Y-1,CL.hideD);p(X,Y-1,CL.hideD)}
      else if(era<3){R(X-1,Y-3,3,3,CL.plaster);ppv(c,X-1,Y-3,Y-1,CL.hideD);ppv(c,X+1,Y-3,Y-1,CL.hideD);p(X,Y-2,CL.red)}
      else if(era<5){R(X-1,Y-3,3,3,[188,70,62]);R(X-1,Y-3,3,1,CL.white);p(X,Y-2,CL.gold);p(X+2,Y-2,CL.white)}
      else if(era<7){R(X-1,Y-3,3,3,[188,70,62]);R(X-1,Y-3,3,1,CL.white);ppv(c,X+2,Y-6,Y,W);}
      if(era===6){R(X-1,Y-3,3,4,CL.steelD);R(X,Y-2,2,2,CL.glass)}
      if(era>=7){R(X-1,Y-4,3,4,[24,64,84]);R(X,Y-3,2,2,glow);p(X,Y-5,[170,255,255]);p(X+1,Y-6,[170,255,255,160])}
      break}
    case'priest':{
      ppPole(c,X,Y,8,4,era<1?CL.tusk:WD);
      if(era<1){p(X,Y-9,CL.tusk);p(X-1,Y-8,CL.tusk);p(X+1,Y-8,CL.tusk);ppv(c,X-1,Y-8,Y-6,[226,44,30]);p(X+1,Y-7,k)}
      else if(era<4){p(X,Y-9,CL.gold);R(X-1,Y-9,3,1,CL.gold);p(X-1,Y-8,CL.gold);p(X+1,Y-8,CL.gold)}
      else if(era<7){p(X,Y-10,CL.gold);R(X-1,Y-9,3,1,CL.gold);R(X-1,Y-8,3,1,CL.gold);p(X,Y-8,CL.white)}
      else{ppv(c,X,Y-8,Y+4,[230,240,250]);R(X-1,Y-10,3,3,[130,240,255]);p(X,Y-9,[255,255,255])}
      break}
  }
}

/* ---------- one person on the grid ---------- */
function ppPerson(c,race,L,si,hi,k,fr,job,era,seated,opt){
  const st=ppStyle(race,L),P=ppParams(st),kin=ppKin(race,L),s=L.skins[si%L.skins.length],sd=sh(s,.8),h=L.hairs[hi%L.hairs.length],hd=sh(h,.72),gen=job==='general',pri=job==='priest';
  /* banner pole stands behind the figure */
  if(gen){
    const px=P.tx-2,top=P.hy-7;
    ppv(c,px,top,P.ty+P.th,CL.woodD);
    ppr(c,px-4,top,4,3,k);ppr(c,px-4,top+2,4,1,sh(k,.7));ppp(c,px-2,top+1,CL.gold);ppp(c,px,top-1,CL.gold);ppp(c,px-4,top+3,sh(k,.8));
  }
  /* back accents: elf cloak, general cape */
  if(gen){
    const kd=sh(k,.7);
    ppr(c,P.tx-1,P.ty,1,P.th+(seated?0:P.lh-1),sh(k,1.15));ppr(c,P.tx-2,P.ty+2,1,P.th+(seated?0:P.lh-2),kd);ppp(c,P.tx-1,P.ty,CL.gold);ppp(c,P.tx-1,P.ty+P.th+(seated?0:P.lh-2),CL.gold);
  }else if(st==='elf'){ppr(c,P.tx-1,P.ty,1,P.th+(seated?0:2),[58,112,76]);ppp(c,P.tx-1,P.ty,[96,160,100])}
  if(st==='saurian'&&!seated)ppp(c,1,8,sh(s,.9));
  /* legs */
  if(!seated)ppLegs(c,P,st,era,fr,s,sd,L.pants,k,pri);
  else{ppr(c,P.tx+1,P.ly,2,2,era>=2?L.pants:s);ppr(c,P.tx+1,P.ly+2,2,1,CL.boot)}
  /* torso */
  if(pri&&!seated)ppRobe(c,P,era,k,s);
  else{ppTorso(c,P,era,k,s,sd,job,st);if(!seated)ppSkirt(c,P,era,k,st,job)}
  if(gen&&era>=0){ /* officer trimmings */
    ppp(c,P.tx,P.ty,CL.gold);ppp(c,P.tx+P.tw-1,P.ty,CL.gold);
    ppp(c,P.tx+P.tw-2,P.ty+1,CL.white);
    if(P.th>2){ppp(c,P.tx+1,P.ty+P.th-2,CL.gold)}
  }
  /* orc pauldron and goblin/orc/saurian extras */
  if(st==='orc'){ppr(c,1,5,3,2,CL.steelD);ppr(c,1,5,3,1,CL.steelL);ppp(c,2,4,CL.steelL);ppp(c,1,4,CL.steelD)}
  ppArms(c,P,era,k,s,sd,job,st,seated);
  /* head */
  ppHead(c,P,st,s,sd,h,hd,k,L,era);
  /* beards over the torso */
  if(st==='dwarf'){
    ppr(c,3,3,5,2,h);ppr(c,4,5,4,2,h);ppr(c,5,7,2,1,hd);ppr(c,3,3,1,2,hd);ppp(c,4,6,hd);ppp(c,6,5,sh(h,1.15));ppp(c,6,7,CL.gold);
    ppp(c,3,5,hd);ppp(c,2,5,hd);ppp(c,2,6,sh(h,.6));
  }
  if(st==='gnome'){ppr(c,3,7,5,1,h);ppr(c,3,8,4,1,h);ppr(c,4,9,3,1,sh(h,.9));ppp(c,3,7,sh(h,.8));ppp(c,7,8,sh(h,.9))}
  /* hats & helmets */
  if(job)ppHat(c,P,st,job,era,k,gen);
  else if(st==='gnome')ppHatGnome(c,P,null,era,k);
  /* tools */
  if(job&&!(opt&&opt.noTool))ppToolJob(c,P,st,L,job,era,k,kin);
  else if(!job){/* children: simple pose, hand only */}
  return P;
}

/* ---------- mounts and vehicles ---------- */
function ppWheel(g,cx,cy,r,fr,rim,hub,spoke){
  /* a wheel with spokes that turn with the walk frame */
  const R2=r*r;
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){
    const d=x*x+y*y;
    if(d<=R2+r*.8){gp(g,cx+x,cy+y,d>=R2-r*1.6?rim:null)}
  }
  gp(g,cx,cy,hub);
  const dirs=fr?[[1,1],[-1,-1],[1,-1],[-1,1]]:[[1,0],[-1,0],[0,1],[0,-1]];
  for(const[a,b]of dirs){gp(g,cx+a,cy+b,spoke);if(r>=3)gp(g,cx+a*2,cy+b*2,spoke)}
}
function ppHorse(g,x0,gy,fr,k,col){
  const b=col||[152,100,58],bd=sh(b,.76),bl=sh(b,1.18),mane=[44,34,30];
  /* far legs, body, near legs */
  const xs=fr?[x0+1,x0+3,x0+5,x0+7]:[x0,x0+2,x0+6,x0+8];
  gr(g,xs[1],gy-3,1,4,bd);gr(g,xs[3],gy-3,1,4,bd);
  gr(g,x0,gy-8,9,4,b);gr(g,x0,gy-8,9,1,bl);gr(g,x0,gy-5,9,1,bd);gr(g,x0+1,gy-4,7,1,bd);
  gr(g,xs[0],gy-3,1,3,b);gr(g,xs[2],gy-3,1,3,b);
  gp(g,xs[0],gy,CL.dark);gp(g,xs[1],gy,CL.dark);gp(g,xs[2],gy,CL.dark);gp(g,xs[3],gy,CL.dark);
  /* neck, head */
  gr(g,x0+8,gy-11,2,4,b);gr(g,x0+9,gy-12,3,2,b);gp(g,x0+11,gy-11,bd);gr(g,x0+11,gy-11,1,1,sh(b,1.1));gp(g,x0+10,gy-13,bd);gp(g,x0+9,gy-13,bd);
  gp(g,x0+10,gy-12,CL.eye);gp(g,x0+11,gy-11,bd);
  gr(g,x0+8,gy-12,1,4,mane);gp(g,x0+9,gy-13,mane);
  /* tail */
  gr(g,x0-1,gy-8,1,4,mane);gp(g,x0-2,gy-6,mane);gp(g,x0-2,gy-5,mane);
  /* saddle cloth in the kingdom colour, with gold trim */
  gr(g,x0+3,gy-8,4,3,k);gr(g,x0+3,gy-6,4,1,sh(k,.7));gp(g,x0+3,gy-6,CL.gold);gp(g,x0+6,gy-6,CL.gold);gp(g,x0+4,gy-8,sh(k,1.3));
  gp(g,x0+11,gy-11,CL.belt);
}

/* ---------- main entry ---------- */
function personSprite(race,si,hi,col,fr,job,era,opts){
  const L=RACES[race]||RACES.human;era=era|0;if(era<0)era=0;if(era>7)era=7;
  const gen=job==='general',veh=!!(opts&&opts.vehicle);
  const st=ppStyle(race,L),P0=ppParams(st);
  const mode=veh&&gen&&era>=1?(era===1?'chariot':era<=5?'horse':era===6?'jeep':'hover'):veh&&job==='farmer'&&era>=5?(era===5?'steam':era===6?'tractor':'harvest'):null;
  const top=gen?8:4;
  if(!mode){
    const g=G(17,top+P0.H),c={g,ox:3,oy:top};
    ppPerson(c,race,L,si,hi,col,fr,job,era,false,null);
    return bake(g);
  }
  const k=col,kd=sh(k,.7),kl=sh(k,1.3),ly=P0.ly,gold=CL.gold;
  let g,c,gy;
  if(mode==='horse'){
    gy=top+ly+7;g=G(21,gy+1);
    ppHorse(g,5,gy,fr,k);
    c={g,ox:3,oy:gy-7-ly};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,null);
  }else if(mode==='chariot'){
    const fy=top+P0.H+3;gy=fy+3;g=G(26,gy+1);
    ppHorse(g,13,gy,fr,k);
    /* shaft and box */
    gr(g,10,fy-1,4,1,CL.woodD);gr(g,1,fy,10,2,k);gr(g,1,fy,10,1,kl);gr(g,1,fy+1,10,1,kd);gp(g,1,fy,gold);gp(g,10,fy,gold);
    gr(g,10,fy-3,1,3,k);gp(g,10,fy-3,gold);gr(g,1,fy-2,1,2,kd);
    ppWheel(g,5,fy+2,3,fr,CL.wood,CL.woodD,CL.woodD);
    c={g,ox:3,oy:fy-P0.H};
    ppPerson(c,race,L,si,hi,k,0,job,era,false,null);
    gr(g,10,fy-1,1,1,CL.woodD);
  }else if(mode==='jeep'){
    gy=top+ly+5;g=G(24,gy+1);
    const hull=[72,86,64],t=ppMix(k,hull,.35);
    gr(g,1,gy-5,17,3,hull);gr(g,1,gy-5,17,1,sh(hull,1.2));gr(g,12,gy-7,1,3,CL.steelD);gr(g,11,gy-7,2,1,CL.glass);gr(g,13,gy-4,5,1,sh(hull,.8));
    gr(g,1,gy-4,17,1,k);gr(g,1,gy-3,17,1,kd);gp(g,18,gy-4,[250,240,170]);gp(g,18,gy-3,[250,240,170]);gr(g,0,gy-4,1,2,CL.steelD);gr(g,16,gy-6,2,1,sh(hull,1.1));
    ppWheel(g,4,gy-1,2,fr,CL.dark,CL.steelL,CL.steelD);ppWheel(g,14,gy-1,2,fr,CL.dark,CL.steelL,CL.steelD);
    c={g,ox:3,oy:gy-5-ly};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,null);
    gr(g,12,gy-7,1,1,CL.steelD);gr(g,11,gy-8,3,1,CL.glass);
    gr(g,10,gy-5,6,1,CL.steelD);
  }else if(mode==='hover'){
    gy=top+ly+7;g=G(24,gy+1);
    const body=[232,240,250],bd=[160,172,194],gl=[110,240,255];
    gr(g,2,gy-6,14,3,body);gr(g,2,gy-3,14,1,bd);gr(g,3,gy-7,6,1,body);gr(g,14,gy-5,3,2,body);gp(g,17,gy-4,gl);gr(g,2,gy-5,14,1,sh(k,1.3));
    gr(g,13,gy-7,2,1,gl);gr(g,0,gy-5,2,2,bd);gp(g,0,gy-4,gl);gp(g,-1,gy-4,gl);
    /* glow under the bike */
    gr(g,3,gy-2,12,1,fr?[110,240,255,200]:[110,240,255,150]);gr(g,4,gy-1,10,1,fr?[150,250,255,150]:[110,240,255,200]);gr(g,5,gy,8,1,fr?[110,240,255,110]:[110,240,255,160]);
    c={g,ox:3,oy:gy-6-ly};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,null);
  }else if(mode==='steam'){
    gy=top+ly+7;g=G(22,gy+1);
    const iron=[70,68,78],ir2=[104,100,112];
    ppWheel(g,4,gy-3,3,fr,CL.dark,CL.steelD,CL.steelD);ppWheel(g,15,gy-1,2,fr,CL.dark,CL.steelD,CL.steelD);
    gr(g,3,gy-7,1,2,CL.woodD);gr(g,0,gy-8,5,1,CL.woodD);
    gr(g,7,gy-6,11,4,iron);gr(g,7,gy-6,11,1,ir2);gr(g,7,gy-3,11,1,sh(iron,.7));gr(g,10,gy-6,1,4,k);gr(g,14,gy-6,1,4,k);gp(g,18,gy-5,gold);
    gr(g,16,gy-10,2,5,iron);gr(g,15,gy-11,4,1,sh(iron,1.2));
    const sm=fr?[[16,gy-13],[17,gy-15]]:[[17,gy-13],[16,gy-15]];for(const[a,b]of sm){gr(g,a,b,2,1,[210,210,216,210])}
    gp(g,18,gy-12,[226,226,230,200]);
    c={g,ox:1,oy:gy-7-ly+1};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,{noTool:true});
    gr(g,2,gy-6,6,1,CL.woodD);
  }else if(mode==='tractor'){
    gy=top+ly+7;g=G(22,gy+1);
    ppWheel(g,4,gy-3,3,fr,CL.dark,CL.steelL,CL.steelD);ppWheel(g,16,gy-1,2,fr,CL.dark,CL.steelL,CL.steelD);
    gr(g,2,gy-7,3,1,CL.dark);
    gr(g,8,gy-6,11,4,k);gr(g,8,gy-6,11,1,kl);gr(g,8,gy-3,11,1,kd);gr(g,19,gy-5,1,2,CL.steelD);gp(g,19,gy-6,[250,240,170]);gr(g,12,gy-5,1,3,kd);
    gr(g,13,gy-10,1,4,CL.steelD);gp(g,13,gy-11,CL.steelL);gr(g,7,gy-6,2,1,CL.steelD);
    c={g,ox:1,oy:gy-7-ly+1};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,{noTool:true});
    gr(g,2,gy-6,6,1,CL.steelD);
  }else{
    gy=top+ly+7;g=G(24,gy+1);
    const body=[232,240,250],gl=[110,240,255],bd=[150,164,188];
    gr(g,1,gy-6,18,3,body);gr(g,1,gy-6,18,1,sh(body,.9));gr(g,1,gy-4,18,1,k);gr(g,1,gy-3,18,1,bd);
    gr(g,19,gy-5,4,2,[200,212,230]);ppv({g,ox:0,oy:0},21,gy-8,gy-5,gl);ppv({g,ox:0,oy:0},22,gy-7,gy-5,gl);gp(g,22,gy-8,[200,255,255]);
    gr(g,2,gy-2,16,1,fr?[110,240,255,200]:[110,240,255,140]);gr(g,3,gy-1,14,1,fr?[110,240,255,120]:[110,240,255,190]);gr(g,5,gy,10,1,fr?[110,240,255,90]:[110,240,255,150]);
    c={g,ox:2,oy:gy-6-ly};
    ppPerson(c,race,L,si,hi,k,fr,job,era,true,{noTool:true});
    /* glass canopy around the farmer */
    const cx=c.ox+P0.tx-1,cy=c.oy-1;gr(g,cx,cy,1,P0.ly+1,[190,240,255,150]);gr(g,cx,cy,P0.tw+3,1,[190,240,255,170]);gr(g,cx+P0.tw+2,cy,1,2,[190,240,255,150]);
  }
  return bake(g);
}
