/* ============ Facts: everything the model is allowed to know about one kingdom ============
   Plain code reads the save and boils a kingdom down to a small fact sheet (CHRON.factSheet in src/chronicle.js, the
   same one the game builds). Each recorded event gets an id (E1, E2...) so the model can cite it and the validator
   can check the citation. Nothing here calls the model. */
"use strict";
const fs=require('fs'),zlib=require('zlib');
const CHRON=require('../../src/chronicle.js');

/* a .biosphere file is JSON, usually gzipped by the browser */
function readSave(file){
  const buf=fs.readFileSync(file);
  const text=buf[0]===0x1f&&buf[1]===0x8b?zlib.gunzipSync(buf).toString('utf8'):buf.toString('utf8');
  const o=JSON.parse(text);
  if(!o||o.format!=='biosphere-realm'||!Array.isArray(o.tribes))throw new Error(`${file} is not a Biosphere Realm save`);
  return o;
}
function writeSave(file,o){fs.writeFileSync(file,zlib.gzipSync(JSON.stringify(o)))}

/* the people's plural name; woken peoples carry their own definition in the save */
function peopleOf(save,race){
  const up=(save.races||[]).find(r=>r.key===race);
  if(up)return up.def.plural||up.def.name||race;
  return {human:'Humans',elf:'Elves',dwarf:'Dwarves',orc:'Orcs',gnome:'Gnomes',goblin:'Goblins',saurian:'Saurians'}[race]||race;
}

function kingdomFacts(save,T){
  const rel=save.religions[T.rel]||{},parent=T.parent>=0?save.tribes[T.parent]:null;
  return CHRON.factSheet(T,{people:peopleOf(save,T.race),faith:rel.name,patronGod:rel.patronName||rel.deity,secondGod:rel.secondName,
    doctrine:rel.docId,parentTitle:parent&&parent.title,worldYear:save.year});
}

module.exports={readSave,writeSave,kingdomFacts,vocabulary:CHRON.vocabulary,norm:CHRON.norm,AGE_NAME:CHRON.AGES};
