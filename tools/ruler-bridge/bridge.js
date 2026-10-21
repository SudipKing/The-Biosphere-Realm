#!/usr/bin/env node
/* ============ Ruler bridge: lets the game ask Claude for a kingdom's next move ============
   A tiny HTTP server on this computer only (127.0.0.1). The game POSTs a situation report to /decide; the bridge builds
   the prompt from src/ruler.js (the game cannot send its own prompt, so this is not a general Claude proxy), runs
   claude -p on your Claude Code login, and returns Claude's raw answer. The game checks and applies it.
   One call runs at a time; a few more may wait. Every call is logged to tools/ruler-bridge/runs/.

   Usage: node tools/ruler-bridge/bridge.js [--port 8787] [--model sonnet] [--claude <path>] [--allow-origin <origin>] [--allow-file]
   By default only pages from localhost, 127.0.0.1 and https://sudipking.github.io may call it. */
"use strict";
const http=require('http'),fs=require('fs'),path=require('path');
const RULER=require('../../src/ruler.js');
const {askClaude,defaultBin}=require('../claude');

const o={port:8787,model:'sonnet',claude:defaultBin(),origins:['https://sudipking.github.io'],file:false};
for(let i=2;i<process.argv.length;i++){
  const a=process.argv[i];
  if(a==='--port')o.port=+process.argv[++i];
  else if(a==='--model')o.model=process.argv[++i];
  else if(a==='--claude')o.claude=process.argv[++i];
  else if(a==='--allow-origin')o.origins.push(process.argv[++i].replace(/\/$/,''));
  else if(a==='--allow-file')o.file=true;
  else{console.error(`unknown option ${a}`);process.exit(1)}
}
const MAX_BODY=64*1024,MAX_WAITING=4;

/* which pages may use your Claude login through this bridge */
function allowed(origin){
  if(!origin)return false;
  if(origin==='null')return o.file;
  if(/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin))return true;
  return o.origins.includes(origin);
}
function cors(req,res){
  const origin=req.headers.origin;
  if(!allowed(origin))return false;
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  /* Chrome asks before a public page (GitHub Pages) may reach a server on this computer */
  res.setHeader('Access-Control-Allow-Private-Network','true');
  return true;
}
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(obj))};

const runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});
const logFile=path.join(runs,`${new Date().toISOString().replace(/[:.]/g,'-')}.jsonl`);
const log=e=>fs.appendFileSync(logFile,JSON.stringify({t:new Date().toISOString(),...e})+'\n');

/* one claude -p at a time, so a world with several Claude kingdoms does not start a crowd of processes */
let chain=Promise.resolve(),waiting=0;
function queued(fn){waiting++;const p=chain.then(fn).finally(()=>waiting--);chain=p.catch(()=>{});return p}

const server=http.createServer((req,res)=>{
  const ok=cors(req,res);
  if(req.method==='OPTIONS'){res.writeHead(ok?204:403);return res.end()}
  if(!ok)return send(res,403,{error:'this page is not allowed to use the bridge; start it with --allow-origin <origin>'});
  if(req.method==='GET'&&req.url==='/health')return send(res,200,{ok:true,model:o.model,waiting});
  if(req.method!=='POST'||req.url!=='/decide')return send(res,404,{error:'not found'});
  let body='',size=0;
  req.on('data',d=>{size+=d.length;if(size>MAX_BODY){send(res,413,{error:'too large'});req.destroy()}else body+=d});
  req.on('end',async()=>{
    if(res.writableEnded)return;
    let q;try{q=JSON.parse(body)}catch(e){return send(res,400,{error:'the body is not JSON'})}
    const bad=RULER.checkRequest(q);if(bad)return send(res,400,{error:bad});
    if(waiting>=MAX_WAITING)return send(res,429,{error:'Claude is busy with other kingdoms; try next turn'});
    const prompt=RULER.prompt(q.situation,q.last,q.errors);
    try{
      const r=await queued(()=>askClaude({bin:o.claude,model:o.model,system:RULER.SYSTEM,prompt}));
      log({kingdom:q.situation.kingdom,year:q.situation.year,retry:!!(q.errors&&q.errors.length),errors:q.errors||null,ms:r.ms,reply:r.text});
      console.log(`  ${q.situation.kingdom}, year ${q.situation.year}: answered in ${((r.ms||0)/1000).toFixed(1)}s${q.errors&&q.errors.length?' (retry)':''}`);
      send(res,200,{text:r.text});
    }catch(e){
      log({kingdom:q.situation.kingdom,error:e.message});console.log(`  ${q.situation.kingdom}: ${e.message}`);
      send(res,502,{error:e.message});
    }
  });
});
server.listen(o.port,'127.0.0.1',()=>{
  console.log(`Ruler bridge on http://127.0.0.1:${o.port} using ${o.model} through "${o.claude}".`);
  console.log(`Allowed pages: localhost, ${o.origins.join(', ')}${o.file?', local files':''}. Log: ${logFile}`);
  console.log('In the game, open a kingdom\'s Realm Codex and press "Let Claude rule". Ctrl+C to stop.');
});
