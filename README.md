# The Biosphere Realm

A living god-simulation sandbox for the browser. Shape continents, seed seven peoples (humans, elves, dwarves, orcs, gnomes, goblins and saurians), awaken new ones with the monolith, release animals, and watch kingdoms grow, pray, create art, sail, ally, feud and fall through day, night, seasons and weather.

Everything is generated in code: the pixel art, the world, the languages, the music and every sound. There are no asset files and no dependencies.

## Play

Open `index.html` in a browser, or serve the folder with any static server:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

To publish with GitHub Pages, enable Pages for the repository and point it at the root of the main branch.

### Single-file build

```sh
python3 build.py
```

This writes `dist/the-biosphere-realm.html`, a self-contained copy you can share or drop anywhere.

## AI chronicles

The Chronicler (`tools/chronicler`) has Claude write each kingdom's history from a saved world. Plain code checks every name and year against the save before it is stored, and the chronicle then appears on the kingdom's History tab. See [tools/chronicler/README.md](tools/chronicler/README.md).

## Faith, culture and history

Every people has its own pantheon, and each kingdom follows its own sect of it. **Click any kingdom in the side panel (or open its great hall) to read its Realm Codex**: overview, faith, culture and art, and a full history.

### Pantheons

| People | Gods | Character | Blessings |
| --- | --- | --- | --- |
| **Dwarves** | Khazrum the Stonefather, Vurna Emberforge, Gorim Gemheart, the Deep Ancestors | Underground gods of mining, craft, gems and clan halls | Mining yield, cheaper construction, resistance, artistry |
| **Elves** | Sylvaen (Spring), Aelthar (Summer Flame), Mirelle (Harvest), Yssa (Winter Moon), Zephrael (Storm) | Nature spirits of the seasons and elements | Forest growth, healing, spell and arrow damage, births. Each spirit is strongest in its own season |
| **Humans** | Aurelan (Order), Veritas (Law), Caspian (Ambition), Mercanta (Fortune) | Gods of order, law, ambition and trade | Stability, diplomacy, alliances, expansion |
| **Orcs** | Ghorak the Skullfather, Zhulka Mother of Ash, Brogmar Bloodtide, Krukka the Chaos-Drum | Chaotic gods of war and destruction | Battle damage, healing on kill, razing enemy buildings, frenzy |

### How it works

- **Sects and doctrines.** A kingdom's faith is a patron god plus a doctrine: *Orthodox*, *Zealous* (stronger blessings, less stability, quicker holy wars), *Contemplative* (calm, artistic) or *Syncretic* (shares a second god's gift).
- **Devotion and temples.** Blessings scale with a kingdom's devotion, and are only 65% effective until it builds a temple.
- **Rites.** Each god has a festival (the Delving Rite, Awakening Dance, Day of Judgement, Blood Moot...) with its own effect: dwarves gain stone, elves heal and wake new trees, humans feast and calm unrest, orcs enter a war-frenzy.
- **Stability and unrest.** Crowding and war erode stability; unstable realms can split in rebellion and found a rival faith.
- **Diplomacy.** Diplomatic faiths form alliances and call allies into wars. Different sects fight holy wars. Missionaries convert devout neighbors. Prophets cause schisms.
- **Omens.** Meteors are glorious signs to orcs and dwarves, and terrible omens to elves and humans.
- **Culture.** Each kingdom has two cultural values with small bonuses (Craftsmanship, Blood-Oath, Harmony, Commerce...).
- **Art.** Kingdoms create works of art inspired by their gods, wars, heroes and homeland. Physical works (statues, living sculptures, rune-pillars, skull totems) stand on the map.
- **History.** Each kingdom has an origin legend and a chronicle of its own events.

## The power tray

The dashboard on the left has seven tabs (keys `1` to `7`), the last being the Divine hand. **Inspect** and **Move** stay pinned at the top. On a phone it moves to the bottom.

| Tab | What is in it |
| --- | --- |
| 🏔️ **World shaping** | Raise and lower land, mountains, hills, snow peaks, plain soil, forest soil, trees, sand, shallow sea, sea and deep ocean |
| 🐾 **Creatures** | The four peoples, farm and wild animals, crabs and turtles, crows and eagles, and monsters: skeletons, zombies, dragons, wraiths, giant spiders and ogres |
| 🕊️ **Diplomacy & Noosphere** | Declare war, make peace, forge or break alliances, inspire art, enlighten a kingdom to the next age, bless, curse, spark a revolt, send missionaries, gift supplies, send settlers |
| 🌿 **Nature & Disasters** | Biome seeds, ore deposits, rain, lightning, fire, earthquake, volcano, flood, plague |
| 💥 **Chaos** | Meteor, grenade, bomb, molotov, orbital laser, nuke, Tsar Bomba, antimatter, tornado, black hole, cluster bomb, meteor shower, thunderstorm, acid rain |
| ✨ **Wonders & Oddities** | The monolith, freeze, divine shield, haste, age blast, cloning, charm, wishing star (a surprise), elixir of life, giant potion, shrink mushroom, halo, hex, madness, hero's mantle, fountain of youth, love potion, mutation, portal, Midas touch, garden blessing, treasure chest, feast, hourglass |
| 👑 **Divine hand** | Command any group to march where you point, smite, resurrect the fallen, crown a general, let a person found a kingdom, unite two kingdoms, summon an army, baby boom, golden age, a prophet with a new faith, awaken an animal, and ten years in a rush |

Inspect anyone or anything and the same acts of god appear as buttons under it. Every name you see (people, pets, villages, kingdoms, faiths, gods, cultures, languages, works of art) is a field you can type over, right where it is shown. The Registry (Diplomacy tab) lists every kingdom, faith, culture and language with full details, and can be searched, filtered by people or war, and sorted by population, soldiers, size, era or age.

### The monolith and new peoples

Place a **monolith** anywhere from the Wonders tab. Every 10 seconds it fires a beam, and any animal or monster within a few tiles becomes a new sapient people: wolves become Wolfkin, sheep become Woolfolk, dragons become Drakari, and so on. Each awakened people gets its own look, invented language, names, kingdom, villages and faith, and its own tile in the Creatures tab so you can place more of them. Tap a monolith again to remove it.

Wonders and chaos touch every being: animals and monsters can be frozen, shielded, hastened, cloned, cursed, made giant or driven mad, and every blast, tornado and acid rain hurts them too.

### War and numbers

Every war shows a red arrow on the map from the attacker toward the kingdom it is attacking. Each kingdom's banner reads its total population and its soldiers (for example 23/4⚔).

### Biomes

Eleven seedable biomes plus forest soil. Each has its own grass and trees, and several have a buff or a curse.

| Biome | Effect |
| --- | --- |
| Savanna | Acacias, golden grass, better foraging, grazers thrive |
| Birch grove | Extra timber, slow healing |
| Rocklands | Rich ore veins and faster mining, little grows |
| Jungle | Lots of food, spreads quickly, spawns giant spiders |
| Crystal fields | Gems in the ground, fast healing |
| Candy land | Huge food yield, sugar-rushed speed |
| Wasteland | Nothing farms, anyone standing there withers (also left by nukes) |
| Lemon grove | Food and gentle healing |
| Flower meadow | Animals and people breed more |
| Clover fields | Lucky: fighters hit 20% harder |
| Paradox | Colours shift, creatures are teleported, healed or wounded at random |
| Corruption | Spawns skeletons and zombies, drains the living, creeps outward. Temples purify it |

### Ores and the eras of technology

Kingdoms research (more people, teachers and a great hall make it faster) and dig stone, copper, iron, coal, silver, gold and gems. Together they carry a kingdom through eight eras: **Stone, Bronze, Iron, Medieval, Gunpowder, Industrial, Modern, Future**. Each people learns at its own pace: gnomes very quickly, humans and dwarves quickly, saurians and goblins steadily, elves and orcs slowly. Every era changes how a kingdom looks and fights: huts become brick towns, factories and glass spires; spears become swords, muskets, rifles and lasers; canoes become galleons, steamships and hovercraft; farmers trade hoes for tractors and hydroponic beds. From the Gunpowder Age soldiers shoot from range.

### People and jobs

- **Job classes.** Every adult takes the work their kingdom needs: **farmers** (+50% food), **miners** (+40% ore, tougher), **woodcutters**, **builders**, **hunters**, **soldiers** (+20% damage, +15% health, they patrol, train and fight, and there are far more of them in wartime), a **general** (the most seasoned soldier: the army gathers around them and follows in ranks, and in war the general marches it on the nearest enemy settlement; generals ride a chariot, horse, jeep or hover bike as the eras pass), **teachers** (better crafting, art and mining for the whole kingdom) and **priests** (raise devotion and calm). Each job has its own hat and tool on the sprite, and the inspector and codex show who does what.
- **Immigrants.** Tap inside another people's kingdom with a people tool to send settlers to live among them (an elf in an orc horde). They keep their race, work in the kingdom and can have mixed children.
- **Villages.** Growing kingdoms send settlers overland or by ship to found new villages. A village is its own settlement with its own name, homes and people, but it stays part of the kingdom: same colour, same stores, same domain. Only the capital has the great hall and temple. Empty villages are abandoned, and the capital sends families to villages that are struggling.

### More powers and creatures

- **Bombs fall from the sky.** Every bomb whistles down from above, its shadow growing on the ground, before it explodes. New: carpet bombing.
- **New chaos:** sinkhole, lava fissure, locust swarm, firestorm, rain of frogs, decay wave, gravity flip.
- **New wonders:** the lifting magnet (drag to pick up any creature or person; a bigger brush means a wider reach; let go to drop them), rainbow, golden harvest, healing spring, forest bloom, beacon, aurora, crystal bloom, ancient tree.
- **New animals:** yak, camel and duck livestock; gazelle, reindeer and capybara; otter, hippo, lion, tiger, lynx and mongoose; seagulls and parrots; and the troll, the basilisk (its stare freezes) and the thunderbird (it rides storms and calls lightning).
- **Revolts.** When a kingdom with villages revolts, one village breaks away whole and becomes a kingdom of its own, named after it.

### Seasons and domains

- The **Seasons** button in the header holds the world in one season, or lets them turn. The 🔓 lock beside the clock holds the time of day (tap the clock to pick another), and the lock beside the weather holds the weather. The four seasons pass within each year (months 1-3 spring, 4-6 summer, 7-9 autumn, 10-12 winter). Each change of season dissolves across the whole map, recoloring land, trees and sea, and shifting the weather.
- The **Domains** button shows a colour layer for each kingdom with crisp borders, bold when zoomed out and fading as you zoom in. Every tile has exactly one owner, a kingdom cannot found itself or build on another kingdom's land (unless the two are at war), and the side panel shows each kingdom's share of the world.

## Panels

- **Chronicle.** The book button next to Inspect and Move (or the `C` key) opens the Chronicle of the whole world.
- **Registry.** The first four tiles of the Diplomacy & Noosphere tab open lists of all kingdoms (with their villages), religions (with their patron gods), cultures and languages. Every name is a text box: type a new one and press Enter.
- **Kingdom info.** Zoomed all the way out, tap a kingdom with Inspect to open its codex.

## Controls

| Action | Input |
| --- | --- |
| Pan | Drag with the Move tool, right-drag, or WASD / arrow keys |
| Zoom | Scroll wheel, pinch, or `+` / `-` (`0` shows the whole world) |
| Pause | Space |
| Inspect | Tap any person, animal, boat or building |
| Tray tabs | `1` to `6` |
| Chronicle | `C` |
| Close panels | Escape |

## Project layout

| File | What it does |
| --- | --- |
| `src/data.js` | Races, languages, holy symbols, traits, animal species, weather types |
| `src/core.js` | Constants, noise, terrain helpers, spatial grid |
| `src/sim.js` | The simulation: people, genetics, animals, kingdoms, boats, fire, weather, day and night |
| `src/culture.js` | Pantheons, doctrines, rites, values, art, legends, diplomacy and unrest |
| `src/world.js` | Brushes, biome seeds, ores, bombs and disasters, wonders, diplomacy powers, kingdom domains |
| `src/terrain.js` | Terrain renderer, drawn into chunks so edits stay cheap |
| `src/sprites.js` | Procedural pixel-art sprites for every creature, building, monument and boat |
| `src/audio.js` | Synthesized music, creature voices, race languages, rites and ambience (Web Audio) |
| `src/render.js` | Camera, interpolated drawing, lighting, weather effects, spatial sound |
| `src/codex.js` | The Realm Codex: faith, culture, art and history of each kingdom |
| `src/ui.js` | Tools, inspector, side panel, input and the main loop |

The simulation runs at a fixed rate (20 steps per second at 1x) and the renderer interpolates between steps, so movement stays smooth at any frame rate.
