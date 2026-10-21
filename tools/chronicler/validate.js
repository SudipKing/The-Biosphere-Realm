/* ============ Validate: plain code checks what the model wrote ============
   The model writes prose. This file decides whether that prose may go into the save. Every check returns a readable
   error, so a failed run says exactly what went wrong, and the same list is sent back to the model on a retry. */
"use strict";
const {vocabulary,norm}=require('./facts');

const LIMITS={titleMin:3,titleMax:80,versesMin:3,versesMax:6,textMin:40,textMax:700};
/* capitalised words that are fine in any chronicle even when the facts never say them */
const ALWAYS_OK=new Set(['i','god','gods','goddess','king','queen','lord','lady','chief','prophet','general','kingdom','realm','horde','clan',
  'warren','dominion','age','ages','spring','summer','autumn','winter','north','south','east','west','heaven','heavens','chronicle',
  'year','years','the','a','an','and','of','in','so','thus','then','when','after','before','yet','but','for','o']);

/* pull a JSON object out of the reply, even if the model wrapped it in a code fence or a sentence */
function parseReply(text){
  const s=String(text||'').trim();
  const fence=s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body=fence?fence[1]:s.slice(s.indexOf('{'),s.lastIndexOf('}')+1);
  try{return {ok:true,value:JSON.parse(body)}}catch(e){return {ok:false,error:`the reply is not valid JSON (${e.message})`}}
}

/* words that start with a capital letter but do not start a sentence: these are names */
function namesIn(text){
  const out=[];
  for(const sentence of text.split(/(?<=[.!?;:])\s+|\n+/)){
    const words=sentence.match(/[\p{L}][\p{L}'’-]*/gu)||[];
    words.forEach((w,i)=>{if(i>0&&/^\p{Lu}/u.test(w))out.push(w)});
  }
  return out;
}

/* number words up to 999, cardinal or ordinal: "forty-two", "forty-second", "one hundred and third" */
const UNITS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen',
  'sixteen','seventeen','eighteen','nineteen'];
const UNIT_ORD=['zeroth','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth',
  'thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const WORD_NUM=new Map();
UNITS.forEach((w,i)=>WORD_NUM.set(w,i));UNIT_ORD.forEach((w,i)=>WORD_NUM.set(w,i));
TENS.forEach((w,i)=>{if(w){WORD_NUM.set(w,i*10);WORD_NUM.set(w.replace(/y$/,'ieth'),i*10)}});
WORD_NUM.set('hundred',100);WORD_NUM.set('hundredth',100);
const NUM_WORD=`(?:${[...WORD_NUM.keys()].sort((a,b)=>b.length-a.length).join('|')})`;
const NUM_PHRASE=`${NUM_WORD}(?:(?:[\\s-]+|\\s+and\\s+)${NUM_WORD})*`;
function wordsToNum(s){
  let total=0,cur=0;
  for(const w of s.toLowerCase().split(/[\s-]+/)){
    if(w==='and')continue;
    const n=WORD_NUM.get(w);if(n==null)return null;
    if(n===100)cur=(cur||1)*100;else cur+=n;
  }
  return total+cur;
}
function yearsIn(text){
  const out=[];
  for(const m of text.matchAll(/\b(?:[Yy]ears?|Y)\s*(\d{1,5})\b/g))out.push(+m[1]);
  for(const m of text.matchAll(new RegExp(`\\b[Yy]ears?\\s+(?:the\\s+)?(${NUM_PHRASE})\\b`,'gi'))){const n=wordsToNum(m[1]);if(n!=null)out.push(n)}
  for(const m of text.matchAll(new RegExp(`\\b(${NUM_PHRASE})\\s+year\\b`,'gi'))){
    /* only ordinals name a year ("the fifth year"); "five years" is a span */
    if(/(?:st|nd|rd|th)$/i.test(m[1])){const n=wordsToNum(m[1]);if(n!=null)out.push(n)}
  }
  return out;
}

function validate(chron,facts){
  const errors=[];
  if(!chron||typeof chron!=='object'||Array.isArray(chron))return ['the reply must be one JSON object with "title" and "verses"'];
  const {title,verses}=chron;
  if(typeof title!=='string'||title.trim().length<LIMITS.titleMin||title.length>LIMITS.titleMax)
    errors.push(`"title" must be a string of ${LIMITS.titleMin} to ${LIMITS.titleMax} characters`);
  if(!Array.isArray(verses)||verses.length<LIMITS.versesMin||verses.length>LIMITS.versesMax){
    errors.push(`"verses" must be a list of ${LIMITS.versesMin} to ${LIMITS.versesMax} items`);
    return errors;
  }
  const byId=new Map(facts.events.map(e=>[e.id,e]));
  const known=vocabulary(facts);
  const years=new Set([facts.founded,facts.worldYear,...facts.events.map(e=>e.year),...facts.worksOfArt.map(a=>a.year)]);
  const cited=new Set();let lastYear=-Infinity;
  verses.forEach((v,n)=>{
    const where=`verse ${n+1}`;
    if(!v||typeof v.text!=='string'){errors.push(`${where} has no "text"`);return}
    const t=v.text;
    if(t.length<LIMITS.textMin||t.length>LIMITS.textMax)errors.push(`${where} is ${t.length} characters; keep each verse between ${LIMITS.textMin} and ${LIMITS.textMax}`);
    if(/[<>]/.test(t))errors.push(`${where} contains < or >; write plain text only`);
    /* grounding: every verse must rest on recorded events */
    if(!Array.isArray(v.cites)||!v.cites.length){errors.push(`${where} cites no events; every verse must cite at least one event id`);return}
    const evs=[];
    for(const c of v.cites){const e=byId.get(c);if(!e)errors.push(`${where} cites "${c}", which is not an event id`);else{evs.push(e);cited.add(c)}}
    /* verses run from oldest to newest */
    if(evs.length){const y=Math.min(...evs.map(e=>e.year));if(y<lastYear)errors.push(`${where} goes back in time (year ${y} after year ${lastYear}); keep the verses in order`);lastYear=Math.max(lastYear,y)}
    /* no invented names */
    const unknown=[...new Set(namesIn(t).filter(w=>!known.has(norm(w))&&!ALWAYS_OK.has(norm(w))))];
    if(unknown.length)errors.push(`${where} names ${unknown.map(w=>`"${w}"`).join(', ')}, which the facts never mention; use only names from the facts`);
    /* no invented dates, whether written "year 42", "the year forty-two" or "the forty-second year" */
    for(const y of yearsIn(t))if(!years.has(y))errors.push(`${where} mentions year ${y}, which is not in the facts`);
  });
  const need=Math.min(3,facts.events.length);
  if(cited.size<need)errors.push(`the chronicle cites only ${cited.size} different events; cite at least ${need}`);
  return errors;
}

/* the form stored in the save: the verses keep the years they rest on, for the Codex to show */
function toStored(chron,facts,meta){
  const byId=new Map(facts.events.map(e=>[e.id,e]));
  return {
    title:chron.title.trim(),
    verses:chron.verses.map(v=>{const ys=v.cites.map(c=>byId.get(c).year);return {text:v.text.trim(),from:Math.min(...ys),to:Math.max(...ys)}}),
    year:facts.worldYear,
    ...meta,
  };
}

module.exports={validate,parseReply,toStored,namesIn,yearsIn,LIMITS};
