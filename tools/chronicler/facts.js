/* ============ Facts: everything the model is allowed to know about one kingdom ============
   Plain code reads the save and boils a kingdom down to a small fact sheet. Each recorded event gets an id (E1, E2...)
   so the model can cite it and the validator can check the citation. Nothing here calls the model. */
"use strict";
const fs=require('fs'),zlib=require('zlib');

const AGE_NAME=['Stone Age','Bronze Age','Iron Age','Medieval Age','Gunpowder Age','Industrial Age','Modern Age','Future Age'];
const MAX_EVENTS=40;

/* a .biosphere file is JSON, usually gzipped by the browser */
function readSave(file){
  const buf=fs.readFileSync(file);
  const text=buf[0]===0x1f&&buf[1]===0x8b?zlib.gunzipSync(buf).toString('utf8'):buf.toString('utf8');
  const o=JSON.parse(text);
  if(!o||o.format!=='biosphere-realm'||!Array.isArray(o.tribes))throw new Error(`${file} is not a Biosphere Realm save`);
  return o;
}
function writeSave(file,o){fs.writeFileSync(file,zlib.gzipSync(JSON.stringify(o)))}

/* the people's display name; woken peoples carry their own definition in the save */
function peopleOf(save,race){
  const up=(save.races||[]).find(r=>r.key===race);
  if(up)return up.def.title||up.def.name||race;
  return {human:'Humans',elf:'Elves',dwarf:'Dwarves',orc:'Orcs',gnome:'Gnomes',goblin:'Goblins',saurian:'Saurians'}[race]||race;
}

function kingdomFacts(save,T){
  const rel=save.religions[T.rel]||{};
  const parent=T.parent>=0?save.tribes[T.parent]:null;
  /* hist is newest first; the chronicle reads oldest first, and keeps the most recent events if there are many */
  const events=(T.hist||[]).slice(0,MAX_EVENTS).reverse().map((h,i)=>({id:'E'+(i+1),year:h.y,text:h.m}));
  return {
    id:T.id,
    kingdom:T.title,
    name:T.name,
    people:peopleOf(save,T.race),
    status:T.alive?'living':'fallen',
    era:AGE_NAME[T.age|0]||AGE_NAME[0],
    founded:T.founded|0,
    worldYear:save.year|0,
    parent:parent?parent.title:null,
    rebel:!!T.rebel,
    faith:rel.name||null,
    patronGod:rel.patronName||rel.deity||null,
    secondGod:rel.secondName||null,
    doctrine:rel.docId||null,
    values:(T.values||[]).map(v=>v.name),
    villages:(T.towns||[]).map(t=>t.name).filter(Boolean),
    population:T.pop|0,
    renown:T.renown|0,
    legend:T.legend||null,
    worksOfArt:(T.arts||[]).slice(0,8).map(a=>({name:a.name,form:a.form,creator:a.creator,year:a.year})),
    events,
  };
}

/* every word in the fact sheet: the validator uses it to catch names the model made up */
function vocabulary(facts){
  const words=new Set();
  const walk=v=>{
    if(v==null)return;
    if(typeof v==='string'){for(const w of v.match(/[\p{L}][\p{L}'’-]*/gu)||[])words.add(norm(w))}
    else if(Array.isArray(v))v.forEach(walk);
    else if(typeof v==='object')Object.values(v).forEach(walk);
  };
  walk(facts);
  return words;
}
const norm=w=>w.toLowerCase().replace(/[’']s?$/,'').replace(/[’']/g,"'");

module.exports={readSave,writeSave,kingdomFacts,vocabulary,norm,AGE_NAME};
