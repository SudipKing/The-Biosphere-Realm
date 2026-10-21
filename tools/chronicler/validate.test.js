/* Offline tests for the validator: no model is called. Run with `node --test tools/chronicler/validate.test.js` */
"use strict";
const test=require('node:test'),assert=require('node:assert');
const {validate,parseReply,namesIn,yearsIn}=require('./validate');

const facts={
  kingdom:'Kingdom of Northhaven',name:'Northhaven',people:'Humans',founded:0,worldYear:60,
  patronGod:'Mercanta',villages:['Northhaven','Cedwood'],worksOfArt:[{name:'Hymn to Mercanta',year:38}],
  events:[
    {id:'E1',year:17,text:'Germund was made general of the Kingdom of Northhaven.'},
    {id:'E2',year:30,text:'The Kingdom of Northhaven founded the village of Cedwood.'},
    {id:'E3',year:59,text:'Holy war! The Warren of Mukden march on the Kingdom of Northhaven in the name of Ghorak.'},
  ],
};
const good=()=>({title:'The Ledger of Northhaven',verses:[
  {text:'In year 17 the soldiers raised Germund to lead them, and Northhaven stood guarded.',cites:['E1']},
  {text:'Our people walked west and built Cedwood, a second hearth beneath the gaze of Mercanta.',cites:['E2']},
  {text:'Then the Warren of Mukden came howling the name of Ghorak, and the walls of Northhaven held.',cites:['E3']},
]});

test('a grounded chronicle passes',()=>assert.deepStrictEqual(validate(good(),facts),[]));

test('an invented name is caught',()=>{
  const c=good();c.verses[1].text='Our people walked west with Queen Elowen and built Cedwood in the light of Mercanta.';
  const e=validate(c,facts);
  assert.ok(e.some(x=>x.includes('"Elowen"')),e.join('\n'));
});

test('a citation to a missing event is caught',()=>{
  const c=good();c.verses[0].cites=['E9'];
  assert.ok(validate(c,facts).some(x=>x.includes('"E9"')));
});

test('a verse with no citations is caught',()=>{
  const c=good();c.verses[0].cites=[];
  assert.ok(validate(c,facts).some(x=>x.includes('cites no events')));
});

test('a year that is not in the facts is caught',()=>{
  const c=good();c.verses[0].text='In year 12 the soldiers raised Germund to lead them, and Northhaven stood guarded.';
  assert.ok(validate(c,facts).some(x=>x.includes('year 12')));
});

test('verses out of order are caught',()=>{
  const c=good();c.verses.reverse();
  assert.ok(validate(c,facts).some(x=>x.includes('goes back in time')));
});

test('too few verses and bad shapes are caught',()=>{
  assert.ok(validate({title:'X',verses:[]},facts).length>0);
  assert.ok(validate(null,facts).length>0);
  assert.ok(validate([],facts).length>0);
});

test('markup is refused',()=>{
  const c=good();c.verses[0].text='In year 17 <b>Germund</b> was raised to lead, and Northhaven stood guarded.';
  assert.ok(validate(c,facts).some(x=>x.includes('plain text')));
});

test('replies wrapped in a code fence still parse',()=>{
  const r=parseReply('Here it is:\n```json\n{"title":"T","verses":[]}\n```');
  assert.ok(r.ok);assert.strictEqual(r.value.title,'T');
  assert.ok(!parseReply('no json here').ok);
});

test('sentence-initial words are not treated as names',()=>{
  assert.deepStrictEqual(namesIn('Rivers ran red. Then Germund rode out.'),['Germund']);
});

test('years written as words are read',()=>{
  assert.deepStrictEqual(yearsIn('In the year forty-two, and in the fifty-eighth year, and in year 7.').sort((a,b)=>a-b),[7,42,58]);
  assert.deepStrictEqual(yearsIn('For five years they waited.'),[]);
  assert.deepStrictEqual(yearsIn('the one hundred and third year'),[103]);
});

test('a spelled-out year that is not in the facts is caught',()=>{
  const c=good();c.verses[0].text='In the twelfth year the soldiers raised Germund to lead them, and Northhaven stood guarded.';
  assert.ok(validate(c,facts).some(x=>x.includes('year 12')));
  c.verses[0].text='In the seventeenth year the soldiers raised Germund to lead them, and Northhaven stood guarded.';
  assert.deepStrictEqual(validate(c,facts),[]);
});

test('possessives of known names are accepted',()=>{
  const c=good();c.verses[2].text="Then the Warren of Mukden came howling, Ghorak's chant and Ghorak' drums, and Northhaven held.";
  assert.deepStrictEqual(validate(c,facts),[]);
});
