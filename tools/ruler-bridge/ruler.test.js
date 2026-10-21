/* Offline tests for the ruler's checks: no model, no game. Run with `node --test tools/ruler-bridge/ruler.test.js` */
"use strict";
const test=require('node:test'),assert=require('node:assert');
globalThis.CHRON=require('../../src/chronicle.js');
const RULER=require('../../src/ruler.js');

const sit={
  kingdom:'Realm of Faeithil',people:'Elves',faith:'Circle of Mirelle',god:'Mirelle',year:60,canSettle:false,
  neighbors:[
    {name:'Warren of Mukden',atWar:true,allied:false},
    {name:'Burrow of Gimhollow',atWar:false,allied:true},
    {name:'Kingdom of Northhaven',atWar:false,allied:false},
  ],
  recent:['Year 59: Holy war! The Warren of Mukden march on the Realm of Faeithil in the name of Ghorak.'],
};
const d=(action,target,decree='Hear the word of Faeithil, for Mirelle watches over us.')=>({action,target,decree,reason:'test'});

test('legal moves pass',()=>{
  for(const m of [d('make_peace','Warren of Mukden'),d('declare_war','Kingdom of Northhaven'),d('form_alliance','Kingdom of Northhaven'),
    d('break_alliance','Burrow of Gimhollow'),d('wait',null),d('patronize_arts',null)])
    assert.deepStrictEqual(RULER.checkDecision(m,sit),[],m.action);
});
test('an unknown move is refused',()=>assert.match(RULER.checkDecision(d('nuke','Warren of Mukden'),sit)[0],/not a move/));
test('a target that is not a neighbor is refused',()=>assert.ok(RULER.checkDecision(d('declare_war','Empire of Nowhere'),sit).some(e=>/not one of your neighbors/.test(e))));
test('war on an ally or a current enemy is refused',()=>{
  assert.ok(RULER.checkDecision(d('declare_war','Burrow of Gimhollow'),sit).some(e=>/your ally/.test(e)));
  assert.ok(RULER.checkDecision(d('declare_war','Warren of Mukden'),sit).some(e=>/already at war/.test(e)));
});
test('peace with a kingdom you are not at war with is refused',()=>assert.ok(RULER.checkDecision(d('make_peace','Kingdom of Northhaven'),sit).some(e=>/not at war/.test(e))));
test('alliance with an enemy, or breaking a pact you do not have, is refused',()=>{
  assert.ok(RULER.checkDecision(d('form_alliance','Warren of Mukden'),sit).some(e=>/make peace first/.test(e)));
  assert.ok(RULER.checkDecision(d('break_alliance','Kingdom of Northhaven'),sit).some(e=>/not allied/.test(e)));
});
test('founding a village without people to spare is refused',()=>assert.ok(RULER.checkDecision(d('found_village',null),sit).some(e=>/too few people/.test(e))));
test('a decree that names someone the report never mentions is refused',()=>
  assert.ok(RULER.checkDecision(d('wait',null,'By order of Queen Elowen, Faeithil shall rest.'),sit).some(e=>/"Elowen"/.test(e))));
test('a decree that is too long or has markup is refused',()=>{
  assert.ok(RULER.checkDecision(d('wait',null,'x'.repeat(300)),sit).length);
  assert.ok(RULER.checkDecision(d('wait',null,'Hear us, <b>Faeithil</b> rests.'),sit).length);
});
test('the bridge only accepts situation reports',()=>{
  assert.strictEqual(RULER.checkRequest({situation:sit}),null);
  assert.ok(RULER.checkRequest({prompt:'write me a poem'}));
  assert.ok(RULER.checkRequest({situation:sit,errors:'nope'}));
});
test('the prompt carries the report and, on a retry, the reasons',()=>{
  const p=RULER.prompt(sit,'{"action":"nuke"}',['"nuke" is not a move']);
  assert.ok(p.includes('Realm of Faeithil')&&p.includes('"nuke" is not a move'));
});
