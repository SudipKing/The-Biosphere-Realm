/* ============ One headless Claude call, shared by tools/chronicler and tools/ruler-bridge ============
   No tools, no project settings, no MCP servers, no saved session; the prompt goes in on stdin and the run happens in
   the temp folder so this repository's CLAUDE.md is not loaded. Uses the Claude Code login, not an API key. */
"use strict";
const os=require('os'),{spawn}=require('child_process');

const TIMEOUT_MS=180000;
const defaultBin=()=>process.env.CLAUDE_BIN||'claude';

function askClaude({bin=defaultBin(),model='sonnet',system,prompt,timeout=TIMEOUT_MS}){
  return new Promise((resolve,reject)=>{
    const argv=['-p','--output-format','json','--model',model,'--tools','','--system-prompt',system,
      '--no-session-persistence','--strict-mcp-config','--setting-sources',''];
    const p=spawn(bin,argv,{cwd:os.tmpdir(),windowsHide:true});
    let out='',err='';
    const timer=setTimeout(()=>{p.kill();reject(new Error(`claude -p took longer than ${timeout/1000}s`))},timeout);
    p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
    p.on('error',e=>{clearTimeout(timer);reject(e.code==='ENOENT'?new Error(`cannot run "${bin}"; install Claude Code or set CLAUDE_BIN to its path`):e)});
    p.on('close',code=>{
      clearTimeout(timer);
      let j;try{j=JSON.parse(out)}catch(e){return reject(new Error(`claude -p exited ${code}: ${(err||out).slice(0,300)}`))}
      if(j.is_error)return reject(new Error(`claude -p failed: ${String(j.result).slice(0,300)}`));
      resolve({text:j.result,usage:j.usage,ms:j.duration_ms});
    });
    p.stdin.end(prompt);
  });
}

module.exports={askClaude,defaultBin};
