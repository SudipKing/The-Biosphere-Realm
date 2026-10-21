/* Make a test save without a browser: load the game's sim scripts into one Node vm with the DOM stubbed,
   grow a world for some years, and write it as a gzipped .biosphere file, the same format the World panel saves.
   Usage: node tools/chronicler/make-save.js [seed] [years] [out.biosphere] */
"use strict";
const fs=require('fs'),path=require('path'),vm=require('vm'),zlib=require('zlib');
const [seed='chronicle',years='60',out]=process.argv.slice(2);
const SRC=path.join(__dirname,'..','..','src');
const FILES=['data','core','sim','culture','world','audio','fauna','powers','threats','divine','save'];

/* anything the sim touches in the page answers with a harmless stand-in */
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='length'?0:stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
const ctx={console,Math,Date,JSON,Map,Set,WeakMap,Promise,Array,Object,String,Number,Boolean,Error,RegExp,Symbol,Proxy,Reflect,
  Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Uint8ClampedArray,ArrayBuffer,DataView,
  setTimeout:()=>0,clearTimeout(){},performance:{now:()=>Date.now()},
  btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),
  document:stub(),window:stub(),navigator:{userAgent:'node'},matchMedia:()=>({matches:false,addEventListener(){}}),
  requestAnimationFrame:()=>0,devicePixelRatio:1,innerWidth:1280,innerHeight:800,localStorage:stub(),
  AudioContext:undefined,OffscreenCanvas:undefined};
ctx.globalThis=ctx;ctx.self=ctx;
vm.createContext(ctx);
const prelude=`var stub=${stub.toString()};function $(){return stub()}
function computeRoads(){} function markTile(){} function markDirty(){} function initTerrain(){} function syncRaceTiles(){}
function toast(){} function viewCenter(){return [W/2,H/2]} function addRaceTile(){} function reportErr(e){throw e}
var cam={x:0,y:0,pz:2,tpz:2,fit:1},dpr=1,fld=new Uint8Array(240*150),road=new Uint8Array(240*150);
`;
const code=prelude+FILES.map(f=>fs.readFileSync(path.join(SRC,f+'.js'),'utf8')).join('\n;\n')+`
;globalThis.__api={genWorld,simStep,saveWorld,year:()=>year(),tribes:()=>tribes};`;
vm.runInContext(code,ctx,{filename:'biosphere-headless.js'});
const api=ctx.__api;
api.genWorld(seed);
const steps=(+years)*200;
for(let s=0;s<steps;s++)api.simStep();
const save=api.saveWorld();
const file=out||path.join(process.cwd(),`realm-${seed}-year-${api.year()}.biosphere`);
fs.writeFileSync(file,zlib.gzipSync(JSON.stringify(save)));
const live=api.tribes().filter(T=>T.alive);
console.log(`Wrote ${file}: year ${api.year()}, ${live.length} living kingdoms, ${save.logs.length} chronicle entries.`);
