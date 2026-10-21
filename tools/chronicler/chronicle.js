#!/usr/bin/env node
/* ============ The Chronicler: Claude writes each kingdom's history, plain code checks it ============
   1. code reads a .biosphere save and builds a fact sheet per kingdom (facts.js)
   2. the model, run headless with `claude -p`, turns one fact sheet into a short chronicle in JSON
   3. code validates the reply (validate.js); on failure the errors go back to the model, at most MAX_TRIES times
   4. code writes the chronicles that passed into a copy of the save, which the game shows in the Realm Codex
   Every attempt is logged to tools/chronicler/runs/, so a bad chronicle can be traced to the model or to the code.

   Usage: node tools/chronicler/chronicle.js <save.biosphere> [options]
     --out <file>        where to write (default: <save>-chronicled.biosphere)
     --kingdom <name|id> only this kingdom (repeatable)
     --fallen            also chronicle fallen kingdoms
     --model <name>      model for claude -p (default: sonnet)
     --claude <path>     the claude executable (default: $CLAUDE_BIN or "claude")
     --dry-run           print the first prompt and stop; the model is not called */
"use strict";
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const {readSave,writeSave,kingdomFacts}=require('./facts');
const {validate,parseReply,toStored,LIMITS}=require('./validate');

const MAX_TRIES=3,PARALLEL=3,MIN_EVENTS=3,TIMEOUT_MS=180000;

const SYSTEM=`You are the court chronicler of a kingdom in a fantasy world simulation.
You receive a fact sheet as JSON and write that kingdom's chronicle.
Rules:
- Use only what the facts say. Do not invent people, places, gods, battles or dates.
- Every name you write must appear in the facts.
- Write in the voice of the kingdom's own people (stately for humans, lyrical for elves, carved and terse for dwarves, boastful for orcs).
- Tell it as a story: choose the events that matter most and say why they mattered. Do not list every event.
- Write years as digits, like "year 42".
- ${LIMITS.versesMin} to ${LIMITS.versesMax} verses, oldest events first, each ${LIMITS.textMin} to ${LIMITS.textMax} characters of plain text.
- Each verse lists the ids of the events it tells in "cites".
Reply with only this JSON, no other text:
{"title": "a title for the chronicle", "verses": [{"text": "...", "cites": ["E1", "E2"]}]}`;

function args(argv){
  const o={kingdoms:[],model:'sonnet',claude:process.env.CLAUDE_BIN||'claude'};
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(a==='--out')o.out=argv[++i];
    else if(a==='--kingdom')o.kingdoms.push(argv[++i]);
    else if(a==='--fallen')o.fallen=true;
    else if(a==='--model')o.model=argv[++i];
    else if(a==='--claude')o.claude=argv[++i];
    else if(a==='--dry-run')o.dry=true;
    else if(a.startsWith('--'))throw new Error(`unknown option ${a}`);
    else o.save=a;
  }
  if(!o.save)throw new Error('give a .biosphere save file');
  return o;
}

/* one headless call: no tools, no project settings, no saved session; the prompt goes in on stdin */
function askClaude(bin,model,prompt){
  return new Promise((resolve,reject)=>{
    const argv=['-p','--output-format','json','--model',model,'--tools','','--system-prompt',SYSTEM,
      '--no-session-persistence','--strict-mcp-config','--setting-sources',''];
    /* run from the temp folder so this repository's CLAUDE.md is not loaded into the chronicler */
    const p=spawn(bin,argv,{cwd:os.tmpdir(),windowsHide:true});
    let out='',err='';
    const timer=setTimeout(()=>{p.kill();reject(new Error(`claude -p took longer than ${TIMEOUT_MS/1000}s`))},TIMEOUT_MS);
    p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
    p.on('error',e=>{clearTimeout(timer);reject(e.code==='ENOENT'?new Error(`cannot run "${bin}"; install Claude Code or pass --claude <path>`):e)});
    p.on('close',code=>{
      clearTimeout(timer);
      let j;try{j=JSON.parse(out)}catch(e){return reject(new Error(`claude -p exited ${code}: ${(err||out).slice(0,300)}`))}
      if(j.is_error)return reject(new Error(`claude -p failed: ${String(j.result).slice(0,300)}`));
      resolve({text:j.result,usage:j.usage,ms:j.duration_ms});
    });
    p.stdin.end(prompt);
  });
}

function firstPrompt(facts){return `Fact sheet:\n${JSON.stringify(facts,null,1)}`}
function retryPrompt(facts,reply,errors){
  return `${firstPrompt(facts)}\n\nYour last reply was:\n${reply}\n\nIt was rejected for these reasons:\n${errors.map(e=>'- '+e).join('\n')}\n\nWrite the chronicle again and fix every problem.`;
}

async function chronicleOne(o,facts,log){
  let prompt=firstPrompt(facts),last='';
  for(let attempt=1;attempt<=MAX_TRIES;attempt++){
    const t0=Date.now();let reply,errors;
    try{reply=await askClaude(o.claude,o.model,prompt)}
    catch(e){log({kingdom:facts.kingdom,attempt,stage:'call',error:e.message});throw e}
    const parsed=parseReply(reply.text);
    errors=parsed.ok?validate(parsed.value,facts):[parsed.error];
    log({kingdom:facts.kingdom,attempt,ms:Date.now()-t0,tokens:reply.usage&&reply.usage.output_tokens,reply:reply.text,errors});
    if(!errors.length)return {stored:toStored(parsed.value,facts,{by:`Claude (${o.model}) via claude -p`,at:new Date().toISOString(),tries:attempt}),attempt};
    console.log(`  ${facts.kingdom}: attempt ${attempt} rejected (${errors.length} problem${errors.length>1?'s':''}): ${errors[0]}`);
    last=reply.text;prompt=retryPrompt(facts,last,errors);
  }
  return null;
}

/* a small worker pool so a dozen kingdoms do not take a dozen minutes */
async function pool(items,n,fn){
  const out=new Array(items.length);let next=0;
  await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(next<items.length){const i=next++;out[i]=await fn(items[i],i)}}));
  return out;
}

async function main(){
  const o=args(process.argv.slice(2));
  const save=readSave(o.save);
  const match=T=>!o.kingdoms.length||o.kingdoms.some(k=>String(T.id)===k||T.name.toLowerCase()===k.toLowerCase()||T.title.toLowerCase()===k.toLowerCase());
  const chosen=save.tribes.filter(T=>(T.alive||o.fallen)&&match(T));
  const sheets=chosen.map(T=>kingdomFacts(save,T)).filter(f=>f.events.length>=MIN_EVENTS);
  const skipped=chosen.length-sheets.length;
  if(!sheets.length){console.log('No kingdom has enough recorded history to chronicle.');return}
  if(o.dry){console.log(`--- system prompt ---\n${SYSTEM}\n--- first prompt (${sheets[0].kingdom}) ---\n${firstPrompt(sheets[0])}`);return}

  const runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});
  const logFile=path.join(runs,`${new Date().toISOString().replace(/[:.]/g,'-')}.jsonl`);
  const log=e=>fs.appendFileSync(logFile,JSON.stringify({t:new Date().toISOString(),...e})+'\n');
  log({start:o.save,model:o.model,kingdoms:sheets.map(f=>f.kingdom)});
  console.log(`Chronicling ${sheets.length} kingdom${sheets.length>1?'s':''} of year ${save.year} with ${o.model}${skipped?` (${skipped} with too little history skipped)`:''}...`);

  const results=await pool(sheets,PARALLEL,async f=>{
    try{const r=await chronicleOne(o,f,log);console.log(r?`  ✓ ${f.kingdom}: "${r.stored.title}" (attempt ${r.attempt})`:`  ✗ ${f.kingdom}: rejected ${MAX_TRIES} times, left out`);return r}
    catch(e){console.log(`  ✗ ${f.kingdom}: ${e.message}`);return null}
  });

  let written=0;
  sheets.forEach((f,i)=>{if(results[i]){save.tribes[f.id].chronicle=results[i].stored;written++}});
  log({done:true,written,failed:sheets.length-written});
  if(!written){console.log(`Nothing passed the checks, so no save was written. Details: ${logFile}`);process.exitCode=1;return}
  const out=o.out||o.save.replace(/(\.biosphere)?$/,'-chronicled.biosphere');
  writeSave(out,save);
  console.log(`Wrote ${written} chronicle${written>1?'s':''} to ${out}\nLoad it from the World panel and open a kingdom's History tab. Log: ${logFile}`);
}

main().catch(e=>{console.error(`chronicle: ${e.message}`);process.exitCode=1});
