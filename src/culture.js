"use strict";
/* ============ Culture, faith, art & history ============
   Every race has its own pantheon. A kingdom's faith picks a patron god and a doctrine; devotion and a temple
   scale the blessing, which feeds back into combat, building, growth, diplomacy and stability. */
const SEASONS=['Spring','Summer','Autumn','Winter'];
const season=()=>seasonLock>=0?seasonLock:((step%YEAR)*4/YEAR)|0; /* months 1-3 spring, 4-6 summer, 7-9 autumn, 10-12 winter */
const SEASON_BOON=[{grow:.4,fert:.12},{ranged:.2,dmg:.04},{food:.2},{regen:.3,def:.08}];
const SEASON_TEXT=['Spring wakes the forest: faster tree growth and births.','Summer light sharpens every arrow.','Autumn fills the granaries.','Winter starlight heals and shields.'];

const BUFF_LABEL={dmg:'damage in battle',def:'damage resistance',mine:'mining yield',craft:'building cost',food:'food output',fert:'births',
  grow:'forest growth',regen:'healing',ranged:'ranged and spell damage',spd:'movement speed',stab:'stability',dipl:'diplomacy',
  expand:'expansion',art:'artistry',lifesteal:'heal on kill',raze:'raze',frenzy:'frenzy'};
function fmtBuff(k,v){
  const pc=Math.round(Math.abs(v)*100),sg=v>=0?'+':'-';
  if(k==='stab')return `${sg}${pc} stability`;
  if(k==='raze')return 'Burns enemy buildings';
  if(k==='frenzy')return `+${pc}% damage when wounded`;
  if(k==='lifesteal')return `Heal ${pc}% of health on a kill`;
  if(k==='craft')return `-${pc}% building cost`;
  return `${sg}${pc}% ${BUFF_LABEL[k]}`;
}

/* ---------- pantheons: one per people ---------- */
const PANTHEON={
  dwarf:[
    {id:'stone',name:'Khazrum',title:'the Stonefather',dom:'Stone & Deep Delving',sym:'stone',epi:'the Deep-Delvers',buff:{mine:.35,def:.12},
      rite:'Delving Rite',ritedesc:'Miners lay the first ore of the year on the altar, then descend in procession.',
      desc:'Father of the mountain roots. He grants his children strong backs and patient picks.'},
    {id:'forge',name:'Vurna',title:'Emberforge',dom:'Forge & Craftsmanship',sym:'forge',epi:'the Forgebound',buff:{craft:.25,dmg:.1},
      rite:'Anvil Vigil',ritedesc:'The smiths keep the sacred forge lit for a night and a day.',
      desc:'Mistress of the deep fires. Every well-made blade is a prayer to her.'},
    {id:'gem',name:'Gorim',title:'Gemheart',dom:'Gems & Hidden Wealth',sym:'gem',epi:'the Gem-Wardens',buff:{food:.2,art:.5},
      rite:'Rite of the First Gem',ritedesc:'A flawless gem is cut and set into the temple wall.',
      desc:'Lord of the vaults beneath the roots. Patron of jewelers, traders and carvers of fine stone.'},
    {id:'deep',name:'The Deep Ancestors',title:'Keepers of the Halls',dom:'Ancestors & Clan Halls',sym:'deep',epi:'the Hall-Keepers',buff:{def:.2,fert:.15},
      rite:'Feast of Ancestors',ritedesc:'Empty seats are set at the long table for the honored dead.',
      desc:'The first dwarves, who sleep in the stone and watch their clans from below.'},
  ],
  elf:[
    {id:'spring',name:'Sylvaen',title:'Spirit of Spring',dom:'Growth & Renewal',sym:'spring',season:0,epi:'the Evergreen',buff:{fert:.3,grow:.7,regen:.3},
      rite:'Awakening Dance',ritedesc:'Dancers wake the sleeping forest, and saplings burst through the ground.',
      desc:'The green spirit who stirs the roots each year. Where she walks, the forest wakes.'},
    {id:'summer',name:'Aelthar',title:'Summer Flame',dom:'Sun, Fire & Light',sym:'summer',season:1,epi:'the Sunbound',buff:{ranged:.35,dmg:.06,art:.2},
      rite:'Sunfire Vigil',ritedesc:'Archers loose burning arrows into the midsummer sky.',
      desc:'A spirit of golden light whose fire lends arrows their blaze.'},
    {id:'autumn',name:'Mirelle',title:'Harvest Spirit',dom:'Harvest & Wind',sym:'autumn',season:2,epi:'the Harvest-Wardens',buff:{food:.3,spd:.1},
      rite:'Harvest Song',ritedesc:'The whole realm gathers to sing the last fruits home.',
      desc:'Keeper of ripening fruit and the turning wind.'},
    {id:'winter',name:'Yssa',title:'Winter Moon',dom:'Frost, Moon & Stars',sym:'winter',season:3,epi:'the Starwatchers',buff:{regen:.5,def:.18,art:.25},
      rite:'Starlit Silence',ritedesc:'Elves keep a silent vigil beneath the longest night\u2019s stars.',
      desc:'A cold and gentle spirit whose starlight mends wounds and inspires songs.'},
    {id:'storm',name:'Zephrael',title:'Storm Spirit',dom:'Storm, Wind & Sky',sym:'storm',epi:'the Wind-Born',buff:{ranged:.2,spd:.15,def:.08},
      rite:'Calling of the Wind',ritedesc:'Spirit-callers whistle the storm down from the mountains.',
      desc:'The restless spirit of storms. She grants swift feet and arrows that fly true.'},
  ],
  human:[
    {id:'order',name:'Aurelan',title:'Lord of Order',dom:'Order & Duty',sym:'order',epi:'the Ordered',buff:{stab:.3,def:.08},
      rite:'Day of Order',ritedesc:'Banners and soldiers march in unison through the capital.',
      desc:'The lawful flame who orders the heavens and expects the same of mortals.'},
    {id:'law',name:'Veritas',title:'Lady of Law',dom:'Law & Justice',sym:'law',epi:'the Just',buff:{dipl:.3,stab:.15},
      rite:'Day of Judgement',ritedesc:'Grievances are heard in open court beneath the temple dome.',
      desc:'She holds the scales of every oath, treaty and verdict.'},
    {id:'ambition',name:'Caspian',title:'the Rising Crown',dom:'Ambition & Glory',sym:'ambition',epi:'the Ascendant',buff:{expand:.5,fert:.12,food:.08},
      rite:'Crowning Games',ritedesc:'Champions compete for the laurel crown.',
      desc:'God of the climbing and the bold. No ceiling is too high.'},
    {id:'fortune',name:'Mercanta',title:'Keeper of Coin',dom:'Fortune & Trade',sym:'fortune',epi:'the Prosperous',buff:{dipl:.15,food:.2,art:.3},
      rite:'Great Market',ritedesc:'Merchants fill the temple square for a week of trade.',
      desc:'Patroness of caravans, contracts and clever bargains.'},
  ],
  orc:[
    {id:'war',name:'Ghorak',title:'the Skullfather',dom:'War & Conquest',sym:'war',epi:'the Skull-Sworn',buff:{dmg:.25,def:.05},
      rite:'Blood Moot',ritedesc:'Warriors gather around the totem to swear oaths over fresh-cut trophies.',
      desc:'The great warlord of the dead, who feasts on every battle.'},
    {id:'ash',name:'Zhulka',title:'Mother of Ash',dom:'Destruction & Fire',sym:'ash',epi:'the Ashen',buff:{dmg:.1,raze:1},
      rite:'Burning of the Fallen',ritedesc:'Great pyres are lit so the fallen may rise as ash and storm.',
      desc:'She who ends all things. Her children burn what they cannot carry.'},
    {id:'blood',name:'Brogmar',title:'Bloodtide',dom:'Bloodlust & the Hunt',sym:'blood',epi:'the Bloodtide',buff:{lifesteal:.35,dmg:.08,food:.1},
      rite:'Hunt of Honor',ritedesc:'The horde hunts the fiercest beast and drinks to the kill.',
      desc:'The red tide that swells in a fighter\u2019s veins.'},
    {id:'chaos',name:'Krukka',title:'the Chaos-Drum',dom:'Chaos & Frenzy',sym:'chaos',epi:'the Unchained',buff:{spd:.12,frenzy:.4,fert:.1},
      rite:'Drum Frenzy',ritedesc:'Drums pound until every orc is mad with joy.',
      desc:'The wild drumbeat that makes warriors forget fear and pain.'},
  ],
};
for(const r in PANTHEON)PANTHEON[r].forEach(d=>{d.race=r;if(d.season==null)d.season=-1});

const DOCTRINES={
  orthodox:{name:'Orthodox',mult:1.05,stab:5,art:0,desc:'Strict observance of the old rites.'},
  zealous:{name:'Zealous',mult:1.3,stab:-8,art:0,zeal:1,desc:'Fervent and uncompromising. Stronger blessings, less stability, quick to holy war.'},
  contemplative:{name:'Contemplative',mult:.9,stab:12,art:.3,desc:'Quiet devotion and study. Calmer realm, finer art, gentler blessings.'},
  syncretic:{name:'Syncretic',mult:1,stab:0,art:.1,second:1,desc:'Honors a second god alongside the first and gains half of its blessing.'},
};
for(const k in DOCTRINES)DOCTRINES[k].id=k;
const DOC_W={
  dwarf:[['orthodox',.4],['contemplative',.3],['zealous',.2],['syncretic',.1]],
  elf:[['contemplative',.35],['syncretic',.3],['orthodox',.25],['zealous',.1]],
  human:[['orthodox',.4],['syncretic',.25],['zealous',.2],['contemplative',.15]],
  orc:[['zealous',.45],['syncretic',.2],['orthodox',.2],['contemplative',.15]],
};
const SECT_WORD={human:'Church',elf:'Circle',dwarf:'Order',orc:'Cult'};
const TENETS={
  human:['Obey the lawful crown','Keep every oath you swear','Honor the written word','Seek glory through honest work','Trade fairly, and be known for it','No one stands above the law'],
  elf:['Take only what the forest offers','Honor the turning of the seasons','Never fell a living tree in anger','Listen to the spirits in the wind','Sing at every dawn','A promise outlives a lifetime'],
  dwarf:['Waste no ore and no word','Honor the dead with stone','No debt goes unpaid, no insult unanswered','A thing worth making is worth making well','The deep keeps what is hers','Share the hall, share the hearth'],
  orc:['Strength is the only law','Never flee from a worthy foe','Burn what you cannot take','Honor the fallen with fire','The weak feed the strong','Take the head, keep the name'],
};
const VALUES={
  human:[
    {id:'honor',name:'Honor',desc:'Oaths and reputation matter above all.',buff:{def:.06}},
    {id:'commerce',name:'Commerce',desc:'Wealth flows through every street.',buff:{food:.1,dipl:.05}},
    {id:'scholar',name:'Scholarship',desc:'Libraries and learned halls.',buff:{art:.4}},
    {id:'piety',name:'Piety',desc:'Faith binds the people together.',buff:{stab:.08}},
    {id:'chivalry',name:'Chivalry',desc:'Knights who fight with grace.',buff:{dmg:.05,dipl:.1}},
    {id:'ambitious',name:'Ambition',desc:'Always reaching beyond the border.',buff:{expand:.2}},
  ],
  dwarf:[
    {id:'craft',name:'Craftsmanship',desc:'Every tool is a work of art.',buff:{craft:.1,art:.3}},
    {id:'clan',name:'Clan Loyalty',desc:'The clan comes before the self.',buff:{def:.08,stab:.08}},
    {id:'grudge',name:'Grudge-Keeping',desc:'Nothing is ever forgotten, or forgiven.',buff:{dmg:.08}},
    {id:'thrift',name:'Thrift',desc:'Nothing is wasted.',buff:{food:.08,mine:.08}},
    {id:'deeplore',name:'Deep Lore',desc:'Songs of the ancient halls.',buff:{art:.3,stab:.04}},
  ],
  elf:[
    {id:'harmony',name:'Harmony',desc:'Realm and forest as one.',buff:{stab:.08,grow:.2}},
    {id:'lore',name:'Lorekeeping',desc:'Every leaf has a story.',buff:{art:.4}},
    {id:'grace',name:'Grace',desc:'Movement is a kind of poetry.',buff:{ranged:.1,spd:.04}},
    {id:'seclusion',name:'Seclusion',desc:'The deep wood keeps its secrets.',buff:{def:.1}},
    {id:'wander',name:'Wanderlust',desc:'The road calls to every heart.',buff:{spd:.06,expand:.2}},
  ],
  orc:[
    {id:'strength',name:'Strength',desc:'Only the strong are heard.',buff:{dmg:.08}},
    {id:'oath',name:'Blood-Oath',desc:'Bonds sealed in blood are unbreakable.',buff:{stab:.1,lifesteal:.1}},
    {id:'plunder',name:'Plunder',desc:'What is taken is owned.',buff:{food:.1,expand:.1}},
    {id:'freedom',name:'Freedom',desc:'No chain holds an orc for long.',buff:{spd:.06}},
    {id:'skulls',name:'Ancestor-Skulls',desc:'The dead watch from the totems.',buff:{art:.3,stab:.05}},
  ],
};
const ART_FORMS={
  human:[{n:'Epic Poem'},{n:'Cathedral Mural'},{n:'Grand Statue',phys:1},{n:'Woven Tapestry'},{n:'Royal Chronicle'}],
  elf:[{n:'Song Cycle'},{n:'Living Sculpture',phys:1},{n:'Star-Tapestry'},{n:'Spirit Dance'},{n:'Moonlit Poem'}],
  dwarf:[{n:'Rune-Pillar',phys:1},{n:'Gem Mosaic'},{n:'Anvil-Song'},{n:'Stone Relief'},{n:'Forged Crown'}],
  orc:[{n:'Skull Totem',phys:1},{n:'War-Paint Mural'},{n:'Drum Saga'},{n:'Bone Carving'},{n:'Banner of Conquest'}],
};
const ART_WORDS={
  human:{adj:['Golden','Undying','Sovereign','Silver','Faithful','Radiant','Eternal'],noun:['Crown','Banner','Harvest','Throne','Oath','Dawn','Bridge']},
  elf:{adj:['Silver','Whispering','Endless','Moonlit','Evergreen','Gentle','Luminous'],noun:['Canopy','Rain','Starlight','Willow','Spring','Echo','Leaf']},
  dwarf:{adj:['Unbroken','Deepest','Gilded','Iron','Ember','Ancient','Crystal'],noun:['Anvil','Vein','Hammer','Hearth','Lode','Gate','Crown']},
  orc:{adj:['Bloody','Roaring','Black','Unchained','Savage','Burning','Hungry'],noun:['Skull','Drum','Fang','Storm','Blade','Horde','Ash']},
};
const LEGENDS={
  human:[
    '{f} led the first families here, guided by a vision of {d}, {t}. They named the land {n} and vowed that {v} and {v2} would be the heart of their laws.',
    'On a cold dawn {f} planted a banner at {n} and swore before {d}, {t}, to raise a realm built on {v} and {v2}.'],
  dwarf:[
    'When {f} struck the first vein beneath {n}, the stone rang with the voice of {d}, {t}. The clan swore to guard that echo with {v} and {v2}.',
    '{f} followed a seam of silver into the dark and found {n}. There the clan carved a hall in honor of {d}, and made {v} their creed.'],
  elf:[
    'As {f} wandered the old forest, {d}, {t}, whispered where {n} should rise. The first elves sang a seedling into a tree and swore to live by {v} and {v2}.',
    '{n} grew from a single glade where {f} saw the spirits dance. The elves bound their song to {d} and held {v} dear.'],
  orc:[
    '{f} cracked the skull of a rival chief and claimed {n} for the horde. {d}, {t}, roared approval, and {v} became their law.',
    'From the ashes of a lost war, {f} gathered the unwanted and marched until the drums of {d} told them to stop. They named the camp {n} and swore by {v} and {v2}.'],
};
const LEGEND_SETTLER={human:'Settlers of the {p}, led by {f}, left the old hearths to found {n}, carrying the faith of {d} with them.',
  dwarf:'A younger clan of the {p}, led by {f}, dug a new hall at {n} and kept the rites of {d}.',
  elf:'Wanderers of the {p}, led by {f}, followed the spirits to {n} and sang a new grove into being under {d}.',
  orc:'{f} led a splinter warband out of the {p}, took {n} by force and howled for {d}.'};
const LEGEND_REBEL={human:'{f} rose against the {p} and raised a rival banner at {n}, taking {d} as a new patron.',
  dwarf:'{f} broke with the elders of the {p} and delved {n} in the name of {d}.',
  elf:'{f} left the {p} over a quarrel of the spirits and founded {n} under the name of {d}.',
  orc:'{f} challenged the warchief of the {p} and was cast out. {n} was founded in {d}\u2019s name.'};

/* ---------- helpers ---------- */
const gain=x=>Math.floor(x)+(R()<x%1?1:0);
function wpick(list){let t=0;for(const [,w] of list)t+=w;let r=R()*t;for(const [v,w] of list){r-=w;if(r<=0)return v}return list[0][0]}
const zeroFx=()=>({dmg:0,def:0,mine:0,craft:0,food:0,fert:0,grow:0,regen:0,ranged:0,spd:0,stab:0,dipl:0,expand:0,art:0,lifesteal:0,raze:0,frenzy:0});
const addFx=(fx,b,s)=>{for(const k in b)fx[k]+=b[k]*s};

function newReligion(race,base){
  const P=PANTHEON[race];let patron,doc;
  if(base&&R()<.25){
    patron=base.patron;
    doc=DOCTRINES[wpick(DOC_W[race].filter(([k])=>k!==base.docId))];
  }else{
    patron=pick(P.filter(d=>!base||d!==base.patron));
    doc=DOCTRINES[wpick(DOC_W[race])];
  }
  const second=doc.second?pick(P.filter(d=>d!==patron)):null;
  const tenets=[];const pool=TENETS[race].slice();
  for(let k=0;k<2;k++)tenets.push(pool.splice((R()*pool.length)|0,1)[0]);
  const word=SECT_WORD[race];
  const rel={id:religions.length,race,patron,second,doc,docId:doc.id,tenets,founded:year(),deity:patron.name,domain:patron.sym,
    name:doc.id==='orthodox'?`${word} of ${patron.name}`:`${doc.name} ${word} of ${patron.name}`};
  religions.push(rel);return rel;
}
function rollValues(race){const pool=VALUES[race].slice(),out=[];for(let k=0;k<2;k++)out.push(pool.splice((R()*pool.length)|0,1)[0]);return out}

function computeFx(T){
  const fx=zeroFx(),rel=T.rel,d=rel.patron,doc=rel.doc;
  let s=(.45+T.devo/100*.85)*(T.temple?1:.65)*doc.mult;
  if(T.bless>step)s*=1.3;
  addFx(fx,d.buff,s*(d.season>=0&&d.season===season()?1.5:1));
  if(rel.second)addFx(fx,rel.second.buff,s*.5);
  if(T.race==='elf')addFx(fx,SEASON_BOON[season()],.5);
  for(const v of T.values)addFx(fx,v.buff,1);
  if(T.golden>step){fx.food+=.15;fx.art+=.3;fx.stab+=.06;fx.mine+=.1}
  let fg=0;for(const t of T.towns)if(t.forge)fg++;fx.mine+=Math.min(.12,.04*fg);
  const ag=T.age||0;fx.def+=.025*ag;fx.mine+=.05*ag;fx.craft+=.025*ag;if(ag>=6){fx.stab+=.08;fx.dipl+=.1}
  if(T.res&&T.res.gems>=10)fx.ranged+=.1;
  const jb=T.jobs||{},edu=clamp((jb.teacher||0)/Math.max(6,T.pop)*3,0,.3);
  fx.craft+=edu*.5;fx.art+=edu;fx.mine+=edu*.5;fx.stab+=edu*.2+clamp((jb.priest||0)/Math.max(8,T.pop)*.6,0,.1);
  fx.art+=doc.art||0;fx.stab+=doc.stab/100;
  fx.dipl+=Math.min(.15,T.renown*.006);
  const CAP={lifesteal:.5,ranged:.6,mine:.7,stab:.6,dipl:.6};
  for(const k in fx)fx[k]=Math.min(fx[k],CAP[k]||.75);
  return fx;
}
function magicColor(u){
  const T=tribes[u.tribe];if(u.race!=='elf'||!T||T.fx.ranged<.15)return null;
  const c=DOMAINS[T.rel.domain].c;return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const allied=(a,b)=>alliances.some(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));
function alliesOf(T){const out=[];for(const a of alliances){if(a.a===T.id)out.push(tribes[a.b]);else if(a.b===T.id)out.push(tribes[a.a])}return out.filter(t=>t.alive)}

/* ---------- history & legend ---------- */
function legendOf(T){
  if(T.legend)return T.legend;
  const founder=T.members.length?T.members.slice().sort((a,b)=>b.age-a.age)[0].name:'A wandering chief';
  const par=T.parent>=0?tribes[T.parent]:null,d=T.rel.patron;
  let tpl;
  if(par&&T.rebel)tpl=LEGEND_REBEL[T.race];
  else if(par)tpl=LEGEND_SETTLER[T.race];
  else tpl=LEGENDS[T.race][T.legendIdx%LEGENDS[T.race].length];
  T.founderName=founder;
  T.legend=tpl.replace('{f}',founder).replace('{n}',T.name).replace('{d}',d.name).replace('{t}',d.title)
    .replace('{v}',T.values[0].name.toLowerCase()).replace('{v2}',T.values[1].name.toLowerCase()).replace('{p}',par?par.title:'');
  return T.legend;
}

/* ---------- art ---------- */
function artTitle(T,form){
  const W=ART_WORDS[T.race],adj=pick(W.adj),noun=pick(W.noun),d=T.rel.patron,r=RB(T.race);
  const opts=[
    {k:'deity',desc:`A devotion to ${d.name}, ${d.title}.`,t:{human:[`Hymn to ${d.name}`,`${d.name}\u2019s ${noun}`],elf:[`Ode to ${d.name}`,`The ${noun} of ${d.name}`],dwarf:[`${d.name}\u2019s ${noun}`,`The ${adj} ${noun} of ${d.name}`],orc:[`Praise of ${d.name}`,`${d.name}\u2019s ${noun}`]}[r]},
    {k:'place',desc:`A tribute to the homeland of ${T.name}.`,t:{human:[`The ${adj} ${noun} of ${T.name}`],elf:[`${T.name}, ${adj} ${noun}`],dwarf:[`The ${adj} ${noun} of ${T.name}`],orc:[`The ${adj} ${noun} of ${T.name}`]}[r]},
    {k:'nature',desc:'Inspired by the world around them.',t:[`The ${adj} ${noun}`]},
  ];
  if(T.foes.length){const f=T.foes[T.foes.length-1];
    opts.push({k:'war',desc:`Inspired by the war with ${f}.`,t:{human:[`Lament for the Fallen of ${f}`,`The Siege of ${f}`],elf:[`Elegy for the War with ${f}`],dwarf:[`The Grudge of ${f}`,`Ballad of the ${f} War`],orc:[`The Slaughter of ${f}`,`Victory over ${f}`]}[r]})}
  if(T.heroes.length){const h=T.heroes[T.heroes.length-1].name;
    opts.push({k:'hero',desc:`In memory of the hero ${h}.`,t:{human:[`The Saga of ${h}`],elf:[`The Song of ${h}`],dwarf:[`${h} the Unyielding`],orc:[`The Skull-Count of ${h}`]}[r]})}
  const o=pick(opts);return{name:pick(o.t),theme:o.k,desc:o.desc};
}
function makeArt(T){
  const forms=ART_FORMS[T.race];let spot=-1,f;
  if(T.monuments<5&&R()<.4){
    spot=sampleNear(T.cx,T.cy,Math.min(16,5+Math.sqrt(T.houses)*2),i=>canBuild(i,T.race,T.id),50);
    if(spot>=0)f=forms.find(x=>x.phys);
  }
  if(!f)f=pick(forms.filter(x=>!x.phys));
  const t=artTitle(T,f),maker=T.members.length?pick(T.members):null;
  const q=clamp(1+((R()*3)|0)+(T.values.some(v=>v.buff.art>=.3)?1:0)+(R()<.1?1:0),1,5);
  const art={name:t.name,form:f.n,theme:t.theme,desc:t.desc,creator:maker?maker.name:'an unknown artisan',year:year(),q,i:spot>=0?spot:null};
  if(spot>=0){bld[spot]=T.id;btype[spot]=4;T.monuments++;bDirty=true;ownDirty=true;clearAround(spot,T);markDirty(spot)}
  T.arts.unshift(art);T.renown+=q;T.devo=Math.min(100,T.devo+q*(t.theme==='deity'?1.5:.7));
  const at=spot>=0?spot:(T.hall>=0?T.hall:-1);
  log(`The ${T.title} unveiled the ${f.n.toLowerCase()} \u201c${art.name}\u201d.`,[240,208,110],!(q>=4||spot>=0),q>=4&&spot>=0?{x:spot%W+.5,y:((spot/W)|0)+.5,ic:'🗿',p:1}:null);
  if(at>=0){const x=at%W+.5,y=((at/W)|0)+.5;effects.push({type:'rite',x,y,c:[255,220,120],t:0,dur:50});sfx('unveil',x,y)}
}
function culturalTick(T){
  if(T.hall<0||T.pop<4||T.food<12||T.arts.length>=14||isNight())return;
  if(R()<.00035*(1+T.fx.art)*Math.min(3,T.pop/10))makeArt(T);
}

/* ---------- rites ---------- */
function festival(T){
  const d=T.rel.patron,at=T.templeAt>=0?T.templeAt:T.hall;
  T.devo=Math.min(100,T.devo+4);T.bless=step+700;T.food-=Math.min(T.food*.15,10)|0;
  switch(RB(T.race)){
    case'dwarf':T.mat+=6;break;
    case'elf':for(const m of T.members)m.hp=m.maxhp;
      for(let k=0,n=0;k<14&&n<8;k++){const t=sampleNear(T.cx,T.cy,12,i=>fertile(i)&&!tree[i]&&bld[i]===-1&&!nearBld(i),20);if(t>=0){tree[t]=1;markTile(t);n++}}break;
    case'human':T.stab=Math.min(100,T.stab+8);T.food+=4;break;
    case'orc':T.frenzy=step+700;break;
  }
  T.fx=computeFx(T);
  if(at>=0){const x=at%W+.5,y=((at/W)|0)+.5;effects.push({type:'rite',x,y,c:DOMAINS[d.sym].c,t:0,dur:90,big:true});sfx('rite',x,y,T.race)}
  T.fests=(T.fests||0)+1;
  log(`The ${T.title} celebrated the ${d.rite} in honor of ${d.name}.`,DOMAINS[d.sym].c,T.fests>1);
}
function omen(x,y){
  let n=0;
  for(const T of tribes){
    if(!T.alive||Math.hypot(T.cx-x,T.cy-y)>26)continue;
    const p=T.rel.patron.id;
    const rb=RB(T.race),dv=rb==='orc'?(p==='ash'?12:8):rb==='dwarf'?(p==='forge'?7:3):rb==='elf'?-8:-5;
    T.devo=clamp(T.devo+dv,0,100);
    if(n++<2)log(dv>0?`The ${T.title} hailed the falling star as a sign from ${T.rel.patron.name}.`
      :`The ${T.title} trembled at the omen: ${T.rel.patron.name} had turned a cold face to them.`,dv>0?DOMAINS[T.rel.patron.sym].c:[170,170,200]);
  }
}
function convert(T){
  let best=null,bd=70;
  for(const o of tribes){
    if(!o.alive||o===T||o.race!==T.race||o.rel===T.rel||!o.temple||o.devo<60||hostile(o.id,T.id))continue;
    const d=Math.hypot(o.cx-T.cx,o.cy-T.cy);if(d<bd){bd=d;best=o}
  }
  if(!best)return;
  const old=T.rel;T.rel=best.rel;T.devo=55;T.fx=computeFx(T);
  log(`Missionaries of the ${best.title} converted the ${T.title} from the ${old.name} to the ${best.rel.name}.`,DOMAINS[best.rel.patron.sym].c,false,newsAt(T,'📿',2));
}
/* when a kingdom has villages, unrest breaks one of them away whole: the village, its homes, works, people and herds
   become a new kingdom named after it. A kingdom with only its capital splits as a band of rebels instead */
function rebellion(T){
  if(tribes.filter(t=>t.alive).length>=36)return;
  let k=-1,bs=-1;
  for(let j=1;j<T.towns.length;j++){const H=T.towns[j];if(H.pop<4)continue;const s=Math.hypot(H.x-T.cx,H.y-T.cy)*(.5+R());if(s>bs){bs=s;k=j}}
  if(k>0){cityRevolt(T,k);return}
  const adults=T.members.filter(m=>adult(m)&&!m.inside);if(adults.length<8)return;
  const i=sampleNear(T.cx,T.cy,14,j=>fertile(j)&&farFrom(j,10)&&lineOK(T.cx,T.cy,j%W,(j/W)|0,walk),120);if(i<0)return;
  const x=i%W,y=(i/W)|0,NT=newTribe(T.race,x,y,T,{rebel:true});
  const movers=adults.sort(()=>R()-.5).slice(0,Math.max(4,(adults.length*.4)|0));
  NT.food=Math.floor(T.food*.3);T.food-=NT.food;
  for(const m of movers){m.tribe=NT.id;m.town=0;m.target=null;m.task=null;setT(m,i);m.cd=40}
  NT.pop=movers.length;NT.members=movers;T.pop-=movers.length;T.members=T.members.filter(m=>m.tribe===T.id);
  T.stab=Math.min(100,T.stab+25);NT.stab=45;
  wars.push({a:T.id,b:NT.id,until:year()+3+((R()*3)|0)});T.foes.push(NT.name);NT.foes.push(T.name);
  log(`Unrest tore through the ${T.title}: rebels led by ${movers[0].name} broke away to found the ${NT.title}, worshipping ${NT.rel.patron.name}.`,[210,110,60],false,newsAt(NT,'🔥',3));
}
function cityRevolt(T,k){
  const H=T.towns[k],NT=newTribe(T.race,H.x,H.y,T,{rebel:true});
  NT.name=H.name;NT.title=`${RACES[T.race].title} ${H.name}`;
  Object.assign(NT.towns[0],{name:H.name,founded:H.founded});
  /* homes and works nearest this village change hands; the capital keeps its hall and temple */
  for(let i=0;i<N;i++){
    if(bld[i]!==T.id||nearestTown(T,i%W,(i/W)|0)!==k||btype[i]===1||btype[i]===2)continue;
    bld[i]=NT.id;markDirty(i);
    if(btype[i]===4){T.monuments=Math.max(0,T.monuments-1);NT.monuments++}
    else if(btype[i]<5){T.houses=Math.max(0,T.houses-1);NT.houses++}
  }
  T.towns.splice(k,1);T.colonies=T.towns.length-1;
  let n=0;
  for(const u of units){
    if(u.k===0?u.tribe!==T.id:u.owner!==T.id)continue;
    const t=u.town|0;
    if(t===k){
      if(u.k===0){u.tribe=NT.id;u.target=null;u.task=null;u.cd=20;u.inside=false;n++}else u.owner=NT.id;
      u.town=0;
    }else if(t>k)u.town=t-1;
  }
  const share=n/Math.max(1,T.pop);
  NT.food=Math.floor(T.food*share);T.food-=NT.food;NT.mat=Math.floor(T.mat*share);T.mat-=NT.mat;
  for(const r in T.res){NT.res[r]=Math.floor(T.res[r]*share)}
  bDirty=true;ownDirty=true;census();
  T.stab=Math.min(100,T.stab+25);NT.stab=50;
  wars.push({a:T.id,b:NT.id,until:year()+3+((R()*3)|0)});T.foes.push(NT.name);NT.foes.push(T.name);
  log(`The city of ${H.name} rose against the ${T.title} and declared itself the ${NT.title}, worshipping ${NT.rel.patron.name}.`,[210,110,60],false,newsAt(NT,'🔥',3));
}
const REBEL_STAB=40,STAB_CALM=55;
function culturalYear(){
  const y=year();
  for(const T of tribes){
    if(!T.alive)continue;
    const warring=wars.some(w=>w.a===T.id||w.b===T.id);
    const target=36+(T.temple?14:0)+(T.rel.doc.zeal?6:0)+Math.min(10,T.renown*.3)-(warring&&T.race!=='orc'?8:0);
    T.devo=clamp(T.devo+(target-T.devo)*.15+(R()-.5)*3,0,100);
    /* big, sprawling realms are harder to hold together: crowding, a large share of the land and many villages */
    const crowd=Math.max(0,T.pop-22)*.7+Math.max(0,T.area/landTiles-.12)*50+Math.max(0,T.towns.length-3)*2;
    const st=clamp(38+T.fx.stab*100+(T.temple?5:0)+Math.min(10,T.renown*.4)-(warring?10:0)-crowd+(alliesOf(T).length?3:0),0,100);
    T.stab=clamp(T.stab+(st-T.stab)*.35+(R()-.5)*4,0,100);
    if(T.temple&&T.pop>=4&&y>=T.nextFest){festival(T);T.nextFest=y+4+((R()*3)|0)}
    if(T.stab<REBEL_STAB&&T.pop>=18&&R()<.035*(1-T.stab/REBEL_STAB))rebellion(T);
    if(T.devo<40&&R()<.08)convert(T);
  }
}

/* ---------- the storyteller: after a long quiet stretch, the world stirs ----------
   Quiet means no kingdom has risen or fallen. Wars come and go without changing the map, so they don't count. */
const STORY_QUIET=15,STORY_FROM=25,STORY_GAP=6;
const STORY={
  migration:{w:35,fire(){
    if(tribes.filter(T=>T.alive).length>=24)return false;
    const i=randomLand(j=>fertile(j)&&!tree[j]&&own[j]<0&&bld[j]===-1&&farFrom(j,14),400);if(i<0)return false;
    const r=wpick(RACE_KEYS.filter(k=>!RACES[k].uplift).map(k=>[k,1/(1+(cnt.race[k]||0))]));
    const x=i%W,y=(i/W)|0,NT=newTribe(r,x,y);NT.food=24;NT.mat=12;
    for(let k=0;k<6;k++)addPerson(NT,x,y);
    log(`Wanderers came over the horizon: a band of ${RACES[r].plural.toLowerCase()} settled the empty land and founded the ${NT.title}.`,NT.color,false,newsAt(NT,'🧭',2));
    return true;
  }},
  pretender:{w:25,fire(){
    const T=tribes.filter(t=>t.alive&&t.pop>=24).sort((a,b)=>b.pop-a.pop)[0];if(!T)return false;
    const n=tribes.length,st=T.stab;T.stab=Math.min(T.stab,30);rebellion(T);
    if(tribes.length>n)return true;
    T.stab=st;return false;
  }},
  sickness:{w:15,fire(){
    const pool=tribes.filter(t=>t.alive&&t.pop>=20);if(!pool.length)return false;
    const T=pick(pool);let n=0;
    for(const m of T.members)if(R()<.2){die(m);n++}
    if(!n)return false;
    T.stab=clamp(T.stab-8,0,100);
    log(`A sickness year: fever spread through the ${T.title} and ${n} of their people died.`,[130,190,70],false,newsAt(T,'🤒',2));
    return true;
  }},
  golden:{w:15,fire(){
    const T=tribes.filter(t=>t.alive&&t.stab>=50&&!(t.golden>step)).sort((a,b)=>b.renown-a.renown)[0];if(!T)return false;
    T.golden=step+8*YEAR;T.fx=computeFx(T);
    log(`A golden age dawned for the ${T.title}: full granaries, bold art and peace at home.`,[246,204,70],false,newsAt(T,'🌟',2));
    return true;
  }},
  border:{w:20,fire(){
    const alive=tribes.filter(t=>t.alive&&t.pop>=6);let best=null,bd=60;
    for(const a of alive)for(const b of alive){
      if(a.id>=b.id||hostile(a.id,b.id)||allied(a.id,b.id))continue;
      const d=Math.hypot(a.cx-b.cx,a.cy-b.cy)*(a.rel===b.rel?1.4:1);if(d<bd){bd=d;best=[a,b]}
    }
    if(!best)return false;
    const [a,b]=R()<.5?best:[best[1],best[0]];
    log(`A quarrel over the border between the ${a.title} and the ${b.title} turned to bloodshed.`,[194,65,45],true);
    declareWar(a,b);return true;
  }},
};
function storyYear(){
  const y=year(),sig=tribes.length*1000+tribes.filter(T=>T.alive).length;
  if(sig!==story.sig){story.sig=sig;story.last=y}
  if(y<STORY_FROM||y<story.next||y-story.last<STORY_QUIET)return;
  const left=Object.keys(STORY);
  while(left.length){
    const k=wpick(left.map(n=>[n,STORY[n].w]));left.splice(left.indexOf(k),1);
    if(STORY[k].fire()){story.next=y+STORY_GAP;story.last=y;story.fired.push({y,k});if(story.fired.length>20)story.fired.shift();return}
  }
  story.next=y+2;
}

/* ---------- diplomacy ---------- */
function declareWar(a,b){
  const y=year(),len=Math.max(1,3+((R()*5)|0)-Math.round((a.fx.dipl+b.fx.dipl)*3));
  wars.push({a:a.id,b:b.id,until:y+len});a.foes.push(b.name);b.foes.push(a.name);
  if(a.rel!==b.rel&&R()<.5)log(`Holy war! The ${a.title} march on the ${b.title} in the name of ${a.rel.patron.name}.`,[194,65,45],false,newsAt(b,'⚔️',3));
  else log(`War broke out between the ${a.title} and the ${b.title}.`,[194,65,45],false,newsAt(b,'⚔️',3));
  sfx('horn',null,null);
  for(const [side,foe] of [[a,b],[b,a]])for(const al of alliesOf(side)){
    if(al===foe||hostile(al.id,foe.id)||allied(al.id,foe.id)||R()>.55)continue;
    wars.push({a:al.id,b:foe.id,until:y+len});
    log(`The ${al.title} honored their alliance with the ${side.title} and joined the war against the ${foe.title}.`,[194,65,45],false,newsAt(al,'🛡️',1));
  }
}
function diplomacyYear(){
  const y=year(),alive=tribes.filter(T=>T.alive&&T.pop>0);
  alliances=alliances.filter(a=>y<a.until&&tribes[a.a].alive&&tribes[a.b].alive);
  if(alive.length<2)return;
  for(let k=0;k<2;k++){
    const a=pick(alive),b=pick(alive);
    if(a===b||hostile(a.id,b.id)||allied(a.id,b.id)||Math.hypot(a.cx-b.cx,a.cy-b.cy)>120)continue;
    const dp=a.fx.dipl+b.fx.dipl;
    const pa=.15*dp*(a.race===b.race?1.5:.6)*(a.rel===b.rel?1.5:1);
    if(R()<pa){
      alliances.push({a:a.id,b:b.id,until:y+8+((R()*8)|0)});
      log(`The ${a.title} and the ${b.title} sealed an alliance.`,[96,190,140],false,newsAt(a,'🤝',1));sfx('fanfare',null,null);continue;
    }
    let p=.14*(RACES[a.race].aggr+RACES[b.race].aggr);
    if(a.race!==b.race)p*=1.5;
    p*=a.rel===b.rel?.35:1.25;
    if(a.rel.doc.zeal||b.rel.doc.zeal)p*=1.3;
    const wd=id=>id==='war'||id==='ash';
    if(wd(a.rel.patron.id)||wd(b.rel.patron.id))p*=1.3;
    p*=1-clamp(dp/2,0,.7);
    if(R()<p)declareWar(a,b);
  }
}
const cultureName=T=>T.cultureName||`${T.values.map(v=>v.name).join(' & ')} culture`;
/* a newer people shares the pantheon, doctrines, tenets, values, art and legends of its base people */
function aliasRace(r){
  const b=RB(r);if(b===r)return;
  for(const tb of [PANTHEON,DOC_W,SECT_WORD,TENETS,VALUES,ART_FORMS,ART_WORDS,LEGENDS,LEGEND_SETTLER,LEGEND_REBEL])if(!tb[r])tb[r]=tb[b];
}
for(const r of RACE_KEYS)aliasRace(r);
