"use strict";
/* ============ Audio: generative music, creature voices, ambience (all synthesized live) ============ */
const AU={ctx:null,ready:false,music:true,sfx:true,master:null,mg:null,sg:null,ag:null,rev:null,noise:null,
  nextNote:0,beat:0,bar:0,tokens:6,cool:{},rain:null,wind:null,lastPhase:'',timer:0};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=AU.ctx=new AC();
  const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;
  AU.master=c.createGain();AU.master.gain.value=.85;comp.connect(AU.master);AU.master.connect(c.destination);
  AU.mg=c.createGain();AU.mg.gain.value=AU.music?.3:0;
  AU.sg=c.createGain();AU.sg.gain.value=AU.sfx?.75:0;
  AU.ag=c.createGain();AU.ag.gain.value=AU.sfx?.55:0;
  AU.noise=(()=>{const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b})();
  AU.rev=c.createConvolver();
  AU.rev.buffer=(()=>{const len=c.sampleRate*2.6|0,b=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}return b})();
  const rg=c.createGain();rg.gain.value=.4;AU.rev.connect(rg);rg.connect(comp);
  for(const g of [AU.mg,AU.sg,AU.ag])g.connect(comp);
  const ms=c.createGain();ms.gain.value=.7;AU.mg.connect(ms);ms.connect(AU.rev);
  const ss=c.createGain();ss.gain.value=.25;AU.sg.connect(ss);ss.connect(AU.rev);
  AU.rain=loopNoise('bandpass',1500,.5);AU.wind=loopNoise('lowpass',380,1.5);AU.surf=loopNoise('lowpass',520,.7);
  AU.nextNote=c.currentTime+.3;
  AU.timer=setInterval(audioTick,100);
  AU.ready=true;
  const tip=document.getElementById('tip');if(tip)tip.style.opacity=0;
}
function setMusic(on){AU.music=on;if(AU.mg)AU.mg.gain.setTargetAtTime(on?.3:0,AU.ctx.currentTime,.3)}
function setSfx(on){AU.sfx=on;if(AU.sg){AU.sg.gain.setTargetAtTime(on?.75:0,AU.ctx.currentTime,.2);AU.ag.gain.setTargetAtTime(on?.55:0,AU.ctx.currentTime,.2)}}
function loopNoise(type,f,q){const c=AU.ctx,s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(AU.ag);s.start();return{g,f:fl}}
function env(g,t,a,peak,d){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function osc(out,type,f0,f1,t,a,d,peak){
  const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+a+d);
  env(g,t,a,peak,d);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+d+.05);return o;
}
function noiseHit(out,type,f0,f1,q,t,a,d,peak){
  const c=AU.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();
  s.buffer=AU.noise;fl.type=type;fl.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)fl.frequency.exponentialRampToValueAtTime(f1,t+a+d);fl.Q.value=q;
  env(g,t,a,peak,d);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random()*1.5);s.stop(t+a+d+.05);
}
/* voiced sound: oscillator through a filter with vibrato; the building block of every animal call */
function vox(out,t,o){
  const c=AU.ctx,s=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();
  s.type=o.type||'sawtooth';s.frequency.setValueAtTime(o.f0,t);
  if(o.mid)s.frequency.exponentialRampToValueAtTime(o.mid,t+o.d*.4);
  s.frequency.exponentialRampToValueAtTime(o.f1||o.f0,t+o.d);
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.f0*(o.vd||.03);l.connect(lg);lg.connect(s.frequency);l.start(t);l.stop(t+o.d+.1)}
  fl.type=o.ft||'bandpass';fl.frequency.value=o.ff||1000;fl.Q.value=o.q||1.5;
  env(g,t,o.a||.02,o.p||.3,o.d);s.connect(fl);fl.connect(g);g.connect(out);s.start(t);s.stop(t+(o.a||.02)+o.d+.05);
}
function bus(vol,pan){
  const c=AU.ctx,g=c.createGain();g.gain.value=vol;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);p.connect(AU.sg)}else g.connect(AU.sg);
  return g;
}
const CALLS={
  sheep:(o,t)=>vox(o,t,{f0:400,f1:350,d:.5,vib:7,vd:.06,ff:1100,q:2,p:.35}),
  cow:(o,t)=>{vox(o,t,{f0:118,f1:92,d:1.1,a:.18,vib:4,vd:.02,ft:'lowpass',ff:520,q:1.2,p:.55});vox(o,t+.05,{f0:236,f1:184,d:1,a:.2,ft:'bandpass',ff:700,q:2,p:.12})},
  pig:(o,t)=>{for(const k of [0,.15])vox(o,t+k,{type:'square',f0:210,f1:150,d:.09,ff:650,q:3,p:.3});noiseHit(o,'bandpass',500,500,2,t,.01,.12,.15)},
  chicken:(o,t)=>{const n=3+(RC()*3|0);for(let k=0;k<n;k++)vox(o,t+k*.09,{type:'square',f0:650+RC()*150,f1:950,d:.04,ff:1500,q:2,p:.18})},
  horse:(o,t)=>vox(o,t,{f0:720,mid:820,f1:320,d:.95,a:.03,vib:17,vd:.12,ff:1300,q:2,p:.3}),
  deer:(o,t)=>vox(o,t,{type:'sine',f0:950,f1:640,d:.28,ft:'lowpass',ff:2400,p:.22}),
  rabbit:(o,t)=>{for(const k of [0,.12])noiseHit(o,'lowpass',220,120,1,t+k,.005,.06,.35)},
  wolf:(o,t)=>{vox(o,t,{type:'sine',f0:360,mid:640,f1:470,d:1.8,a:.35,vib:5,vd:.015,ft:'lowpass',ff:1800,p:.32});vox(o,t+.02,{type:'triangle',f0:720,mid:1280,f1:940,d:1.7,a:.4,ft:'lowpass',ff:2200,p:.06})},
  bear:(o,t)=>{vox(o,t,{f0:78,f1:58,d:.9,a:.08,vib:28,vd:.15,ft:'lowpass',ff:420,q:2,p:.6});noiseHit(o,'lowpass',380,200,1,t,.05,.8,.25)},
  fox:(o,t)=>{for(const k of [0,.13])vox(o,t+k,{type:'square',f0:980,f1:1450,d:.07,ff:1800,q:2.5,p:.2})},
  buffalo:(o,t)=>vox(o,t,{f0:96,f1:66,d:.8,a:.1,vib:6,vd:.04,ft:'lowpass',ff:380,q:1.5,p:.5}),
  dog:(o,t)=>{for(const k of [0,.2])vox(o,t+k,{type:'sawtooth',f0:430,f1:250,d:.13,ff:950,q:2.5,p:.35})},
  cat:(o,t)=>vox(o,t,{type:'triangle',f0:620,mid:1050,f1:560,d:.55,a:.08,vib:9,vd:.04,ff:1500,q:2,p:.25}),
  rat:(o,t)=>{for(const k of [0,.08])vox(o,t+k,{type:'sine',f0:3200,f1:2700,d:.05,ft:'lowpass',ff:5000,p:.12})},
  crab:(o,t)=>{for(const k of [0,.07,.15])noiseHit(o,'highpass',3500,5000,2,t+k,.001,.03,.2)},
  turtle:(o,t)=>noiseHit(o,'lowpass',900,300,1,t,.05,.45,.15),
  crow:(o,t)=>{for(const k of [0,.26])vox(o,t+k,{type:'square',f0:520,f1:340,d:.2,ff:1250,q:3,p:.3})},
  eagle:(o,t)=>vox(o,t,{type:'sawtooth',f0:2300,mid:2900,f1:1500,d:.6,a:.04,vib:26,vd:.05,ft:'bandpass',ff:2600,q:2,p:.22}),
  skeleton:(o,t)=>{for(let k=0;k<6;k++)noiseHit(o,'bandpass',2600+RC()*1600,2000,4,t+k*.045,.001,.03,.3);osc(o,'triangle',200,150,t,.002,.2,.1)},
  zombie:(o,t)=>{vox(o,t,{type:'sawtooth',f0:118,f1:62,d:1.3,a:.2,vib:5,vd:.06,ft:'lowpass',ff:360,q:2,p:.5});noiseHit(o,'lowpass',500,200,1,t+.1,.2,.9,.12)},
  dragon:(o,t)=>{vox(o,t,{type:'sawtooth',f0:86,mid:150,f1:55,d:2,a:.12,vib:11,vd:.08,ft:'lowpass',ff:520,q:1.5,p:.7});noiseHit(o,'bandpass',900,300,1,t+.05,.15,1.7,.4);osc(o,'sine',48,34,t,.05,1.6,.5)},
  wraith:(o,t)=>vox(o,t,{type:'sine',f0:560,mid:920,f1:480,d:1.6,a:.3,vib:6,vd:.09,ft:'bandpass',ff:1300,q:3,p:.3}),
  spider:(o,t)=>noiseHit(o,'highpass',4200,6500,1.5,t,.01,.4,.22),
  ogre:(o,t)=>{vox(o,t,{type:'sawtooth',f0:74,f1:48,d:1,a:.06,vib:20,vd:.12,ft:'lowpass',ff:320,q:2,p:.7});noiseHit(o,'lowpass',400,160,1,t,.04,.8,.3)},
};
const VOWELS=[[300,2300],[400,2000],[600,1200],[700,1100],[350,800],[500,1500]];
function speak(o,t,race,child){
  const V=RACES[race].voice,c=AU.ctx,n=2+(RC()*3|0),f=V.f*(child?1.6:1)*(.9+RC()*.2);
  for(let k=0;k<n;k++){
    const st=t+k*.13,d=.08+RC()*.05,s=c.createOscillator(),g=c.createGain(),[f1,f2]=pick(VOWELS);
    s.type=V.type;s.frequency.setValueAtTime(f*(.92+RC()*.2),st);s.frequency.linearRampToValueAtTime(f*(.85+RC()*.25),st+d);
    const b1=c.createBiquadFilter(),b2=c.createBiquadFilter();b1.type=b2.type='bandpass';b1.frequency.value=f1;b2.frequency.value=f2;b1.Q.value=b2.Q.value=4;
    env(g,st,.015,race==='elf'?.35:.5,d);
    let src=s;
    if(V.growl){const ws=c.createWaveShaper(),cv2=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv2[i]=Math.tanh(x*4)}ws.curve=cv2;s.connect(ws);src=ws}
    src.connect(b1);src.connect(b2);b1.connect(g);b2.connect(g);g.connect(o);s.start(st);s.stop(st+d+.05);
  }
  if(race==='elf')osc(o,'sine',f*4,f*4.2,t,.05,.4,.03);
}
const SFX={
  clang:(o,t)=>{osc(o,'square',1860,1800,t,.002,.12,.08);osc(o,'square',2710,2650,t,.002,.09,.05);noiseHit(o,'bandpass',4200,3000,3,t,.002,.07,.2)},
  death:(o,t)=>{osc(o,'sawtooth',240,70,t,.005,.3,.12);osc(o,'sine',90,40,t+.05,.01,.25,.3);noiseHit(o,'lowpass',500,200,1,t+.04,.002,.12,.15)},
  thud:(o,t)=>{osc(o,'sine',150,55,t,.003,.14,.4);noiseHit(o,'lowpass',700,300,1,t,.002,.08,.2)},
  arrow:(o,t)=>noiseHit(o,'highpass',2500,6000,1,t,.01,.14,.18),
  chop:(o,t)=>{noiseHit(o,'bandpass',800,600,4,t,.002,.07,.45);osc(o,'sine',320,200,t,.002,.06,.2)},
  rustle:(o,t)=>noiseHit(o,'highpass',3000,5000,.7,t,.04,.25,.1),
  mine:(o,t)=>{osc(o,'triangle',2400,2350,t,.001,.18,.12);osc(o,'sine',3650,3600,t,.001,.12,.06)},
  build:(o,t)=>{for(const k of [0,.2,.4]){osc(o,'sine',230,180,t+k,.002,.06,.35);noiseHit(o,'bandpass',1500,1200,2,t+k,.001,.04,.15)}},
  bell:(o,t)=>{for(const [f,p] of [[523,.2],[1046,.1],[1568,.05]])osc(o,'sine',f,f,t,.005,2.5,p)},
  fanfare:(o,t)=>{[392,494,587,784].forEach((f,k)=>osc(o,'triangle',f,f,t+k*.12,.01,.35,.12))},
  splash:(o,t)=>noiseHit(o,'lowpass',1600,250,1,t,.01,.45,.35),
  thunder:(o,t)=>{noiseHit(o,'highpass',2000,800,1,t,.002,.18,.5);noiseHit(o,'lowpass',260,90,1,t+.25,.15,2.8,.9);osc(o,'sine',48,32,t+.25,.2,2,.4)},
  boom:(o,t)=>{noiseHit(o,'bandpass',300,2400,1,t-.6,.6,.3,.25);noiseHit(o,'lowpass',420,80,1,t,.01,2.2,1);osc(o,'sine',62,28,t,.01,1.5,.7)},
  horn:(o,t)=>{const c=AU.ctx,s=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();s.type='sawtooth';s.frequency.setValueAtTime(196,t);s.frequency.linearRampToValueAtTime(220,t+.3);fl.type='lowpass';fl.frequency.value=900;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.25);g.gain.setValueAtTime(.18,t+1);g.gain.linearRampToValueAtTime(0,t+1.5);s.connect(fl);fl.connect(g);g.connect(o);s.start(t);s.stop(t+1.6)},
  spawn:(o,t)=>{[880,1175,1568].forEach((f,k)=>osc(o,'sine',f,f,t+k*.07,.005,.4,.08))},
  crackle:(o,t)=>{for(let k=0;k<4;k++)noiseHit(o,'bandpass',2000+RC()*2000,1500,3,t+RC()*.3,.001,.02,.25)},
  rooster:(o,t)=>{[[520,620,.12],[620,760,.12],[760,900,.18],[900,700,.5]].forEach(([a,b,d],k)=>vox(o,t+k*.17,{f0:a,f1:b,d,vib:12,vd:.03,ff:1400,q:2,p:.25}))},
  chirp:(o,t)=>{const n=2+(RC()*3|0);for(let k=0;k<n;k++)osc(o,'sine',2800+RC()*900,3800+RC()*800,t+k*.08,.005,.05,.06)},
  cricket:(o,t)=>{for(let k=0;k<3;k++)osc(o,'sine',4400,4450,t+k*.05,.003,.025,.025)},
  owl:(o,t)=>{for(const k of [0,.45])vox(o,t+k,{type:'sine',f0:420,f1:380,d:.35,a:.06,ft:'lowpass',ff:900,p:.18})},
  fish:(o,t)=>noiseHit(o,'lowpass',1400,500,1,t,.005,.18,.18),
  unveil:(o,t)=>{[1318,1568,1976,2637].forEach((f,k)=>osc(o,'sine',f,f,t+k*.09,.004,.9,.06))},
  rite:(o,t,race)=>{
    if(race==='dwarf'){osc(o,'sine',58,52,t,.15,3,.3);for(let k=0;k<5;k++){const tt=t+k*.5;osc(o,'triangle',1180,1150,tt,.001,.6,.12);osc(o,'sine',1770,1760,tt,.001,.35,.05);noiseHit(o,'bandpass',3000,2500,4,tt,.001,.05,.2)}}
    else if(race==='elf'){[784,988,1175,1568,1976,1568,1175].forEach((f,k)=>{osc(o,'sine',f,f,t+k*.16,.01,1.4,.09);osc(o,'triangle',f*2,f*2,t+k*.16,.01,.6,.025)})}
    else if(race==='orc'){for(let k=0;k<8;k++){const tt=t+k*.32;osc(o,'sine',k%2?80:100,36,tt,.002,.3,.6);noiseHit(o,'lowpass',500,200,1,tt,.001,.1,.25)}SFX.horn(o,t+1.2)}
    else{[[262,330,392],[294,370,440],[330,392,523]].forEach((ch,k)=>ch.forEach(f=>osc(o,'triangle',f,f,t+k*.9,.2,1.6,.07)));SFX.bell(o,t)}
  },
};
function playAt(type,vol,pan,extra){
  if(!AU.ready||vol<.03)return;
  const t=AU.ctx.currentTime+.01,o=bus(vol,pan);
  if(type==='call'){CALLS[extra]&&CALLS[extra](o,t);return}
  if(type==='speak'){speak(o,t,extra.race,extra.child);return}
  if(type==='cry'){CALLS[extra]&&CALLS[extra](o,t);return}
  SFX[type]&&SFX[type](o,t,extra);
}
/* music: a slow generative score; major pentatonic by day, minor by night, war drums when kingdoms fight */
const MOODS={
  day:{root:60,bpm:76,scale:[0,2,4,7,9,12,14],chords:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],dens:.3},
  night:{root:57,bpm:60,scale:[0,3,5,7,10,12,15],chords:[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]],dens:.17},
};
function pad(notes,t,d){
  const c=AU.ctx;
  for(const n of notes)for(const det of [-7,7]){
    const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
    o.type='sawtooth';o.frequency.value=mtof(n);o.detune.value=det;f.type='lowpass';f.frequency.value=800;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.028,t+1.4);g.gain.setValueAtTime(.028,t+d-.6);g.gain.linearRampToValueAtTime(0,t+d+1.2);
    o.connect(f);f.connect(g);g.connect(AU.mg);o.start(t);o.stop(t+d+1.3);
  }
}
function pluck(n,t,soft){osc(AU.mg,'triangle',mtof(n),mtof(n),t,.004,soft?1.6:1.1,soft?.09:.13);osc(AU.mg,'sine',mtof(n+12),mtof(n+12),t,.004,.5,.03)}
function audioTick(){
  if(!AU.ready||typeof step==='undefined'||!hgt)return;
  const c=AU.ctx,now=c.currentTime,mood=light>.45?MOODS.day:MOODS.night,soft=mood===MOODS.night;
  const e8=60/mood.bpm/2;
  while(AU.nextNote<now+.45){
    const t=AU.nextNote,b=AU.beat%16,ch=mood.chords[AU.bar%4];
    if(AU.music&&speed>0){
      if(b===0){pad(ch.map(n=>mood.root+n-12),t,e8*16);osc(AU.mg,'sine',mtof(mood.root+ch[0]-24),mtof(mood.root+ch[0]-24),t,.02,e8*6,.16)}
      if(b===8)osc(AU.mg,'sine',mtof(mood.root+ch[0]-24+(RC()<.5?7:0)),0,t,.02,e8*6,.12);
      if((b%2===0&&RC()<mood.dens)||RC()<.05){
        const deg=ch[(RC()*3)|0]%12+(RC()<.5?0:12);
        const sc=mood.scale,near=sc.reduce((a,s)=>Math.abs(s-deg)<Math.abs(a-deg)?s:a,sc[0]);
        pluck(mood.root+(RC()<.6?near:pick(sc)),t,soft);
      }
      if(wars.length&&(b===0||b===6||b===8)){osc(AU.mg,'sine',95,42,t,.002,.32,.32);noiseHit(AU.mg,'lowpass',900,300,1,t,.001,.06,.12)}
    }
    AU.nextNote+=e8;AU.beat++;if(AU.beat%16===0)AU.bar++;
  }
  /* ambience */
  const viewF=typeof viewInfo!=='undefined'?viewInfo:{water:0,close:0};
  AU.rain.g.gain.setTargetAtTime(WX.rain*.28,now,.6);
  AU.wind.g.gain.setTargetAtTime(.015+WX.storm*.22+WX.snow*.06+WX.cloud*.02,now,.8);
  AU.wind.f.frequency.setTargetAtTime(300+Math.sin(now*.3)*120+WX.storm*300,now,.5);
  AU.surf.g.gain.setTargetAtTime(viewF.water*viewF.close*.12,now,.8);
  if(speed>0){
    const ph=phaseName();
    if(ph!==AU.lastPhase){if(ph==='Dawn'&&AU.lastPhase)playAt('rooster',.35,0);AU.lastPhase=ph}
    if(light>.5&&WX.rain<.3&&RC()<.12*viewF.close)playAt('chirp',.25+RC()*.2,RC()*1.6-.8);
    if(light<.3&&RC()<.25*Math.max(.3,viewF.close))playAt('cricket',.4,RC()*1.6-.8);
    if(light<.3&&RC()<.01)playAt('owl',.3,RC()*1.6-.8);
  }
}
