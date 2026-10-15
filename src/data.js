"use strict";
/* ============ Races, languages, faiths, animals ============ */
const RACES={
  human:{name:'Human',plural:'Humans',icon:'🧑',spd:.11,hp:30,dmg:5,life:60,fert:1.1,aggr:.5,cost:6,range:1.2,
    skins:[[242,204,164],[222,172,126],[176,122,82],[118,78,52]],hairs:[[96,62,36],[40,30,28],[222,186,96],[170,74,40]],
    hairNames:['brown','black','blond','red'],skinNames:['fair','tan','olive','deep brown'],
    pants:[86,64,46],title:'Kingdom of',stock:['cow','sheep','chicken','horse','dog','cat'],voice:{f:165,type:'sawtooth'},
    p1:["Al","Bran","Ced","Ed","Gar","Hal","Mar","Ros","Wil","Ash","Lin","Stan","North","Ever","Brook"],
    p2:["mere","ford","wick","ton","ham","bury","dale","gate","field","haven","shire","wood"],
    n1:["Al","Bren","Cor","Ed","Mar","Ro","Tom","Wil","El","Jo","Ann","Mae","Hen","Ger","Is"],
    n2:["ric","da","win","bert","an","eth","a","ly","ry","old","ora","mund"],
    ph:["ha","we","lo","ar","en","ma","to","ri","der","wen","so","el"],
    faiths:['Sun','Sea','Ancestors','Sun','War'],
    lore:'Adaptable farmers and builders. They breed quickly, keep every kind of livestock, and settle anywhere green.'},
  elf:{name:'Elf',plural:'Elves',icon:'🧝',spd:.12,hp:26,dmg:5,life:200,fert:.55,aggr:.3,cost:5,range:3.4,
    skins:[[252,228,206],[240,214,186],[226,206,178]],hairs:[[236,228,190],[214,176,92],[200,206,216],[150,70,44]],
    hairNames:['silver-gold','golden','moonsilver','copper'],skinNames:['pale','ivory','fawn'],
    pants:[62,96,66],title:'Realm of',stock:['horse','sheep','horse','cat','cat'],voice:{f:290,type:'triangle'},
    p1:["Ael","Syl","Lae","Thal","Ely","Fae","Ith","Cael","Lu","Nim","Ara","Ser"],
    p2:["varan","ithil","lorien","anor","duil","wen","riel","thas","mir","andor"],
    n1:["Ae","Lir","Thra","Ely","Fin","Gal","Ili","Nae","Syl","Tau","Ere"],
    n2:["wen","dil","riel","las","ion","ara","nor","eth","ith","wyn"],
    ph:["ae","li","thi","el","na","va","ri","ys","lo","mae","ith","sul"],
    faiths:['Moon','Forest','Moon','Sea'],
    lore:'Long-lived archers who live in the trees. They plant forests instead of cutting them, and breed fine horses.'},
  dwarf:{name:'Dwarf',plural:'Dwarves',icon:'⛏️',spd:.09,hp:38,dmg:6,life:140,fert:.6,aggr:.45,cost:7,range:1.2,
    skins:[[238,196,160],[214,160,120],[190,136,100]],hairs:[[188,84,40],[110,70,40],[46,36,32],[170,168,164]],
    hairNames:['ginger','chestnut','coal-black','iron-grey'],skinNames:['ruddy','weathered','bronze'],
    pants:[88,70,52],title:'Hold of',stock:['pig','chicken','cow','dog'],voice:{f:112,type:'sawtooth'},
    p1:["Dur","Bar","Thor","Kaz","Gim","Bal","Dwal","Mor","Grun","Tor","Khaz","Ere"],
    p2:["halm","dun","grim","rak","dor","bad","heim","ak","gar","zul"],
    n1:["Bal","Dor","Gim","Thr","Bof","Dwa","Fun","Gro","Kil","Nor","Ori","Thra"],
    n2:["in","li","ar","ur","dain","rik","grim","nar","bur","ok"],
    ph:["kha","dum","bar","ul","gor","az","rim","dok","zu","ha","kar","bin"],
    faiths:['Stone','Flame','Ancestors','Stone'],
    lore:'Stout miners of the highlands. They build in stone, dig ore from the mountains and keep pigs in the hold.'},
  orc:{name:'Orc',plural:'Orcs',icon:'👹',spd:.12,hp:40,dmg:7,life:40,fert:1.25,aggr:.9,cost:4,range:1.2,
    skins:[[110,154,74],[90,130,62],[128,142,72],[96,116,92]],hairs:[[34,30,28],[70,44,30],[60,60,56]],
    hairNames:['black','dark brown','ash'],skinNames:['moss green','deep green','olive','grey-green'],
    pants:[72,54,40],title:'Horde of',stock:['pig','pig','chicken','dog'],voice:{f:88,type:'sawtooth',growl:true},
    p1:["Grak","Mog","Urz","Thrak","Gor","Bol","Zug","Krag","Dur","Nar","Skar","Vor"],
    p2:["thul","gash","mok","ruk","dak","zog","gor","nak","bar","goth"],
    n1:["Gro","Mor","Ug","Thra","Zug","Kar","Bol","Lug","Snag","Gash","Ruk"],
    n2:["mash","nak","grub","dush","zog","lok","bag","rot","gul","ak"],
    ph:["gra","ug","kha","zo","ruk","mu","dak","th","gor","nak","ub","za"],
    faiths:['War','Flame','War','Ancestors'],
    lore:'Fierce hunters and raiders. Short lives, big families, pig pens, and always ready for war.'},
};
const RACE_KEYS=['human','elf','dwarf','orc'];
const DOMAINS={
  stone:{c:[196,196,206],sym:["..#..",".#.#.","#...#","#####","....."]},
  forge:{c:[255,146,40],sym:["#####","#####",".###.","..#..",".###."]},
  gem:{c:[120,220,230],sym:["..#..",".###.","#####",".###.","..#.."]},
  deep:{c:[240,236,220],sym:[".###.","#####","#.#.#","#####",".#.#."]},
  spring:{c:[118,206,92],sym:["##.##","#####",".###.","..#..","..#.."]},
  summer:{c:[250,206,70],sym:["#.#.#",".###.","#####",".###.","#.#.#"]},
  autumn:{c:[226,140,50],sym:["..###",".####","####.","###..","#...."]},
  winter:{c:[190,215,255],sym:[".###.","##...","#....","##...",".###."]},
  storm:{c:[120,180,230],sym:["####.","....#","###.#","#...#",".###."]},
  order:{c:[200,200,236],sym:["#####",".#.#.",".#.#.",".#.#.","#####"]},
  law:{c:[240,230,180],sym:["..#..","#####","#.#.#","#.#.#",".#.#."]},
  ambition:{c:[200,120,255],sym:["#.#.#","#####","#####","#####","....."]},
  fortune:{c:[250,210,80],sym:[".###.","#.#.#","#####","#.#.#",".###."]},
  war:{c:[226,64,50],sym:["#...#",".#.#.","..#..",".#.#.","#...#"]},
  ash:{c:[255,130,40],sym:["..#..",".##..",".###.","#####",".###."]},
  blood:{c:[200,30,50],sym:["..#..","..#..",".###.","#####",".###."]},
  chaos:{c:[170,60,220],sym:["#.#.#",".###.","##.##",".###.","#.#.#"]},
};
const TRAITS={Strong:'Hits 30% harder',Tough:'30% more health',Swift:'Moves 15% faster','Long-lived':'Lives 30% longer',
  Fertile:'More likely to have children',Wise:'Gathers twice the food',Brave:'Charges enemies from afar'};
const TRAIT_KEYS=Object.keys(TRAITS);
/* oddities only the player can hand out */
const ODD_TRAITS={Cursed:'Slowly wastes away',Blessed:'Heals steadily',Immortal:'Never grows old',Berserk:'Attacks anyone nearby, hits 50% harder',
  Giant:'Towering: triple health, 50% harder hits',Tiny:'Small and quick, but fragile'};
const TRAIT_INFO=Object.assign({},TRAITS,ODD_TRAITS);
const KCOL=[[206,58,52],[52,104,206],[230,178,36],[146,76,196],[36,164,154],[232,116,36],[214,86,156],
  [110,180,52],[236,236,236],[70,70,84],[150,100,60],[90,200,222],[180,40,90],[40,120,80]];

/* dom = can be kept as livestock; pred = hunts other animals */
const SPECIES={
  sheep:{name:'Sheep',icon:'🐑',dom:1,hp:10,spd:.05,flee:.13,life:12,cap:80,breed:.0012,food:8,
    desc:'Woolly grazers. Kept by humans and elves, hunted by wolves.'},
  cow:{name:'Cow',icon:'🐄',dom:1,hp:24,spd:.035,flee:.09,life:18,cap:50,breed:.0008,food:16,
    desc:'Slow and gentle. One cow feeds a whole family.'},
  pig:{name:'Pig',icon:'🐖',dom:1,hp:14,spd:.045,flee:.11,life:12,cap:50,breed:.0014,food:10,
    desc:'Eats anything, breeds fast. Orcs and dwarves love them.'},
  chicken:{name:'Chicken',icon:'🐔',dom:1,hp:4,spd:.055,flee:.12,life:7,cap:80,breed:.002,food:3,
    desc:'Pecks around the village all day. Foxes adore them.'},
  horse:{name:'Horse',icon:'🐎',dom:1,hp:28,spd:.06,flee:.2,life:25,cap:50,breed:.0007,food:12,
    desc:'Fast and proud. Tame horses wear their kingdom’s saddle.'},
  deer:{name:'Deer',icon:'🦌',wild:1,hp:14,spd:.055,flee:.2,life:15,cap:60,breed:.001,food:10,
    desc:'Skittish forest browsers. Bucks grow antlers.'},
  rabbit:{name:'Rabbit',icon:'🐇',wild:1,hp:3,spd:.06,flee:.17,life:6,cap:90,breed:.0025,food:2,
    desc:'Breeds like, well, rabbits. Dinner for foxes.'},
  wolf:{name:'Wolf',icon:'🐺',wild:1,pred:1,hp:24,dmg:6,spd:.07,chase:.14,life:14,cap:34,breed:.0015,food:6,
    prey:['sheep','deer','rabbit','chicken','pig','cow'],people:1300,desc:'Pack hunters. Bolder at night, and they howl at the moon.'},
  bear:{name:'Bear',icon:'🐻',wild:1,pred:1,hp:70,dmg:12,spd:.045,chase:.11,life:30,cap:12,breed:.0006,food:20,
    prey:['deer','sheep','pig','cow','rabbit'],people:900,territorial:1,desc:'Huge and territorial. Wanders too close and it charges.'},
  fox:{name:'Fox',icon:'🦊',wild:1,pred:1,hp:8,dmg:3,spd:.075,chase:.15,life:10,cap:28,breed:.0015,food:3,
    prey:['rabbit','chicken'],minor:1,desc:'Sly hunter of rabbits and hens.'},
  buffalo:{name:'Buffalo',icon:'🦬',wild:1,hp:55,spd:.04,flee:.1,life:20,cap:40,breed:.0008,food:24,
    desc:'Heavy grazers that roam in herds. A whole village could eat for a week.'},
  dog:{name:'Dog',icon:'🐕',dom:1,nosl:1,hp:14,spd:.07,flee:.15,life:14,cap:40,breed:.001,food:4,
    desc:'Loyal companions that trot after the village. They are never eaten.'},
  cat:{name:'Cat',icon:'🐈',dom:1,nosl:1,hp:8,spd:.08,flee:.16,life:15,cap:40,breed:.001,food:2,
    desc:'Naps in the sun, naps in the shade. Elves are especially fond of them.'},
  rat:{name:'Rat',icon:'🐀',wild:1,hp:3,spd:.07,flee:.15,life:3,cap:60,breed:.003,food:1,
    desc:'Scurries wherever people live. Eagles notice.'},
  crab:{name:'Crab',icon:'🦀',wild:1,amph:1,hp:6,spd:.035,flee:.08,life:5,cap:40,breed:.0015,food:3,
    desc:'Scuttles along beaches and shallows.'},
  turtle:{name:'Turtle',icon:'🐢',wild:1,amph:1,hp:30,spd:.02,flee:.04,life:60,cap:25,breed:.0005,food:12,
    desc:'Slow, patient and very old. Walks between shore and shallows.'},
  crow:{name:'Crow',icon:'🐦‍⬛',wild:1,fly:1,alt:5,hp:4,spd:.12,flee:.2,life:8,cap:40,breed:.0012,food:1,
    desc:'Glossy black scavengers. They fly over land and sea alike.'},
  eagle:{name:'Eagle',icon:'🦅',wild:1,fly:1,alt:7,pred:1,minor:1,hp:14,dmg:5,spd:.11,chase:.17,life:20,cap:10,breed:.0006,food:4,
    prey:['rabbit','rat','chicken','crab'],desc:'Sharp-eyed hunter of the skies. Takes rabbits, rats and unwary hens.'},
  skeleton:{name:'Skeleton',icon:'💀',monster:1,hp:20,dmg:5,spd:.06,chase:.09,life:5,cap:40,breed:0,food:0,sight:10,
    desc:'Rattling bones that remember only hunger. They attack every living thing.'},
  zombie:{name:'Zombie',icon:'🧟',monster:1,hp:34,dmg:4,spd:.035,chase:.05,life:3,cap:40,breed:0,food:0,sight:8,
    desc:'Slow but relentless. Whoever it kills rises to join it.'},
  dragon:{name:'Dragon',icon:'🐉',monster:1,fly:1,alt:9,hp:170,dmg:18,spd:.09,chase:.15,life:60,cap:3,breed:0,food:0,sight:16,
    desc:'Lord of the sky. Breathes fire on villages, forests and anyone who stands in its way.'},
  wraith:{name:'Wraith',icon:'👻',monster:1,fly:1,alt:3,hp:24,dmg:6,spd:.08,chase:.1,life:4,cap:20,breed:0,food:0,sight:12,
    desc:'A restless spirit that drifts over land and water, hunting the living.'},
  spider:{name:'Giant spider',icon:'🕷️',monster:1,hp:18,dmg:6,spd:.08,chase:.12,life:6,cap:30,breed:0,food:0,sight:9,
    desc:'Fast, venomous and everywhere in the jungle.'},
  ogre:{name:'Ogre',icon:'🧌',monster:1,hp:110,dmg:14,spd:.045,chase:.07,life:20,cap:10,breed:0,food:0,sight:9,
    desc:'A hulking brute with a club. It smashes first and never asks questions.'},
};
const SPECIES_KEYS=Object.keys(SPECIES);
/* monsters hunt every living thing that is not a monster */
for(const k of SPECIES_KEYS)if(SPECIES[k].monster){SPECIES[k].pred=1;SPECIES[k].prey=SPECIES_KEYS.filter(j=>!SPECIES[j].monster)}
const isMon=u=>u.k===1&&!!SPECIES[u.sp].monster;

/* ---------- biomes: bm[i] ---------- */
const BM={TEMP:0,FOREST:1,SAV:2,BIRCH:3,ROCK:4,JUNGLE:5,CRYS:6,CANDY:7,WASTE:8,LEMON:9,FLOWER:10,CLOVER:11,PARA:12,CORRUPT:13};
/* c = grass colour, sp = speckle colours, trees = chance a seeded tile gets a tree, food = forage multiplier, spd = walking speed multiplier,
   hp = health lost per step by anyone standing there (negative heals), spread = chance to creep onto neighbouring grass */
const BIOMES=[
  {k:'temp',name:'Temperate',icon:'🌱'},
  {k:'forest',name:'Forest soil',icon:'🌲',c:[56,110,50],sp:[[40,88,40]],trees:.55,food:1,hp:0,spread:.01,
    desc:'Dark loamy soil. Trees grow thick and fast here.'},
  {k:'sav',name:'Savanna',icon:'🦁',c:[198,172,84],sp:[[150,126,58],[226,204,120]],trees:.05,food:1.5,hp:0,spread:.015,
    desc:'Golden grass and flat-topped acacias. Grazing herds thrive and foragers find more food.'},
  {k:'birch',name:'Birch grove',icon:'🌳',c:[132,180,96],sp:[[250,250,240]],trees:.4,food:1.1,hp:.02,spread:.015,
    desc:'Pale trees and light-green grass. Woodcutters get extra timber and everyone heals slowly.'},
  {k:'rock',name:'Rocklands',icon:'🪨',c:[122,118,110],sp:[[162,158,150],[92,88,84]],trees:.04,food:.4,hp:0,spread:0,
    desc:'Bare grey stone with rich ore veins. Miners dig faster, but little grows.'},
  {k:'jungle',name:'Jungle',icon:'🌴',c:[34,126,54],sp:[[250,92,110],[250,200,60]],trees:.75,food:1.5,hp:0,spread:.04,spd:.9,
    desc:'Dense, hungry green. Food is plentiful, but giant spiders crawl out of the undergrowth.'},
  {k:'crystal',name:'Crystal fields',icon:'💎',c:[92,120,172],sp:[[190,240,255],[226,200,255]],trees:.25,food:.8,hp:-.08,spread:0,gems:.05,
    desc:'Glittering blue-violet ground studded with gems. Anyone standing here heals fast.'},
  {k:'candy',name:'Candy land',icon:'🍭',c:[244,160,200],sp:[[255,255,255],[140,232,212],[255,230,120]],trees:.3,food:2.2,hp:0,spd:1.25,spread:0,
    desc:'Sugary pink meadows. Food is everywhere and sugar-rushed feet run 25% faster.'},
  {k:'waste',name:'Wasteland',icon:'☢️',c:[128,116,96],sp:[[72,64,54],[168,152,120]],trees:.03,food:0,hp:.02,spd:.85,spread:.02,
    desc:'Ashen, barren and poisoned. Nothing farms here and the dust wears down anyone who lingers.'},
  {k:'lemon',name:'Lemon grove',icon:'🍋',c:[192,208,92],sp:[[255,232,60]],trees:.45,food:1.6,hp:-.02,spread:.008,
    desc:'Sunny yellow-green orchards. Rich in food and gently restoring.'},
  {k:'flower',name:'Flower meadow',icon:'🌸',c:[112,192,102],sp:[[250,120,170],[250,236,110],[250,250,246],[170,140,250]],trees:.1,food:1.3,hp:-.02,spread:.02,
    desc:'A carpet of blossoms. Animals breed more and people born here are happier.'},
  {k:'clover',name:'Clover fields',icon:'🍀',c:[66,170,76],sp:[[30,122,52],[190,240,170]],trees:.08,food:1.25,hp:0,spread:.015,
    desc:'Lucky ground. Fighters here hit 20% harder and foragers find a little more.'},
  {k:'para',name:'Paradox',icon:'🌀',c:[160,110,200],sp:[[255,255,255]],trees:.2,food:1,hp:0,spread:.02,
    desc:'Reality bends. Every colour shifts, and things standing here are sometimes teleported, healed or wounded at random.'},
  {k:'corrupt',name:'Corruption',icon:'🕸️',c:[66,38,88],sp:[[170,60,204],[30,16,44]],trees:.2,food:.5,hp:.03,spread:.03,
    desc:'A purple blight. Skeletons and zombies crawl from the ground, the living wither, and it creeps onward. Temples purify it.'},
];

/* ---------- ores: ore[i] (type) and oreAmt[i] (what is left) ---------- */
const ORE={STONE:1,COPPER:2,IRON:3,COAL:4,SILVER:5,GOLD:6,GEMS:7};
const ORES=[
  null,
  {k:'stone',name:'Stone',icon:'🪨',c:[156,152,146],hi:[198,194,186],desc:'Quarry stone. Kingdoms that dig enough move out of wooden homes.'},
  {k:'copper',name:'Copper',icon:'🟠',c:[208,118,66],hi:[240,170,110],desc:'Soft red metal. Opens the Bronze Age.'},
  {k:'iron',name:'Iron',icon:'⛓️',c:[118,126,140],hi:[190,150,130],desc:'Hard grey ore. Opens the Iron Age.'},
  {k:'coal',name:'Coal',icon:'⚫',c:[36,34,42],hi:[90,90,104],desc:'Black fuel. With iron it makes steel.'},
  {k:'silver',name:'Silver',icon:'⚪',c:[214,222,238],hi:[255,255,255],desc:'Bright and precious. Needed for the Golden Age.'},
  {k:'gold',name:'Gold',icon:'🟡',c:[246,200,56],hi:[255,244,160],desc:'Heavy yellow wealth. Needed for the Golden Age.'},
  {k:'gems',name:'Gems',icon:'💠',c:[84,228,232],hi:[220,255,255],desc:'Cut stones that sharpen a kingdom’s magic.'},
];
const AGE_NAME=['Wooden Age','Stone Age','Bronze Age','Iron Age','Steel Age','Golden Age'];
const AGE_WHY=['Homes are timber and thatch.','Stone walls rise.','Bronze fittings and better tools.','Iron-bound halls and sharper blades.','Steel plate and towering walls.','Gilded halls, wealth and splendor.'];
const TIER_MAT=['wooden','stone','bronze-fitted','iron-bound','steel','gilded'];

const WTYPES={
  clear:{w:.34,ic:'☀️',name:'Clear',t:{}},
  cloudy:{w:.2,ic:'⛅',name:'Cloudy',t:{cloud:.6}},
  rain:{w:.2,ic:'🌧️',name:'Rain',t:{cloud:.85,rain:.7}},
  storm:{w:.08,ic:'⛈️',name:'Storm',t:{cloud:1,rain:1,storm:1}},
  fog:{w:.1,ic:'🌫️',name:'Fog',t:{fog:.85,cloud:.2}},
  snow:{w:.08,ic:'🌨️',name:'Snow',t:{cloud:.7,snow:.85}},
};
const WT_KEYS=Object.keys(WTYPES);
/* weather odds shift with the season: spring, summer, autumn, winter */
const SEASON_WX=[
  {rain:1.6,snow:0,fog:1.3,cloudy:1.1},
  {clear:1.7,cloudy:.8,rain:.6,storm:1.6,snow:0,fog:.4},
  {rain:1.4,fog:1.7,cloudy:1.3,snow:.15},
  {snow:5,clear:.8,rain:.15,storm:.25,fog:1.2},
];

/* job classes: adults take the work their kingdom needs */
const JOBS={
  farmer:{n:'Farmer',ic:'🌾',d:'Works the fields: +50% food from foraging.'},
  miner:{n:'Miner',ic:'⛏️',d:'Digs ore and stone: +40% yield, a little tougher.'},
  woodcutter:{n:'Woodcutter',ic:'🪓',d:'Fells trees for timber.'},
  builder:{n:'Builder',ic:'🔨',d:'Raises homes and halls.'},
  hunter:{n:'Hunter',ic:'🏹',d:'Brings in meat from the wild.'},
  soldier:{n:'Soldier',ic:'⚔️',d:'Patrols, trains and fights: +20% damage, +15% health. Many more in wartime.'},
  teacher:{n:'Teacher',ic:'📖',d:'Teaches at the hall: better crafting, art and mining for the whole kingdom.'},
  priest:{n:'Priest',ic:'🙏',d:'Prays at the temple, raising devotion and calm.'},
};
const JOB_KEYS=Object.keys(JOBS);
/* each people speaks its own tongue; the names can be changed in the registry */
const LANG={human:'Common Tongue',elf:'Elvish',dwarf:'Dwarvish',orc:'Orcish'};
