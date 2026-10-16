# The Biosphere Realm: project handoff

A WorldBox-style god-simulation sandbox that runs entirely in the browser. Plain HTML, CSS and JavaScript, no dependencies, no build step needed to play. Everything (pixel art, world, languages, music, sound effects) is generated in code. The art is original and must never copy WorldBox assets or names.

## Run, build, test

- Play: open `index.html`, or `python3 -m http.server 8000`.
- Bundle to one file: `python3 build.py` writes `dist/the-biosphere-realm.html` (git-ignored).
- Syntax check: `for f in src/*.js; do node --check $f; done`.
- Headless sim test: stub the DOM, load the bundled script, call `simStep()` thousands of times and print kingdom, faith and animal counts. Do this after every balance change. Run about 4000 steps per 20 years and check several worlds, because results vary a lot.
- Visual and performance test: Playwright with Chromium. Check 60fps at 9x speed, take screenshots of day, night and storm, and open the Realm Codex tabs.
- Dev mode (`index.html`) loads each `src/*.js` as a classic script, so all globals are reachable from `page.evaluate`. The bundled build wraps everything in one IIFE, so they are not.

## Architecture

Scripts share one global scope and load in this order (see `index.html`): `data, core, sim, culture, world, terrain, sprites, audio, render, codex, ui`. Function declarations are hoisted across files. Top-level `const`/`let` tables must only be read at runtime, never at load time by an earlier file.

| File | Role |
| --- | --- |
| `data.js` | Races, languages, holy-symbol glyphs (`DOMAINS`, keyed by deity symbol), traits, animal `SPECIES`, weather types |
| `core.js` | Constants (map 240x150, 8px tiles, `YEAR` = 200 steps, `DAY` = 2400), noise, terrain helpers, spatial grid for neighbour queries, shared state |
| `sim.js` | Fixed-step simulation: people, genetics, animals and livestock, kingdoms, boats, fire and lava, day/night and weather, world generation, god powers |
| `culture.js` | Pantheons, doctrines, values, rites, art, legends, omens, conversion, rebellion, alliances and wars |
| `world.js` | `BRUSHFN` (drag tools), `TAPS` (tap tools), explosions (`blast`), disasters, wonders, diplomacy powers (`DIP`), and `computeDomains` |
| `terrain.js` | Terrain drawn into 32x32-tile chunks with dirty-tile queue (edits stay cheap) |
| `sprites.js` | Procedural pixel-art: people, animals, buildings, monuments, boats. Cached by key with `spr()` |
| `audio.js` | Web Audio synthesis: generative music, a unique voice per species, babbling language per race, rites, ambience |
| `render.js` | Camera with eased zoom and inertia, interpolated drawing, lighting, weather overlays, spatial sound mixing |
| `codex.js` | Realm Codex panel (Overview, Faith, Culture and Art, History) |
| `ui.js` | Power tray (`TABS`), inspector, side panel, input, main loop |

## Key rules and gotchas

- **Fixed-rate sim, interpolated render.** The sim runs 20 steps/s at 1x. Every unit and boat keeps `px,py` (previous) and `x,y`; render lerps with `alpha`. Never move entities in `draw()`.
- **Smoothness is a hard requirement.** Avoid per-frame allocation, avoid uploading the whole terrain, and keep neighbour searches on the spatial grid (`nearest()`).
- **Tile data lives in typed arrays:** `hgt, tree, fire, lava, bld, btype, burnt, bm` (biome, `BM.*`), `ore` + `oreAmt` (deposit type `ORE.*` and amount left), `btier` (building age tier), `own` (domain owner, one per tile). `bld[i]` is a kingdom id, `-1` empty, `-2` ruin. `btype`: 0 house, 1 great hall, 2 temple, 3 ruin, 4 monument. Call `markTile(i)` or `markDirty(i)` after changing a tile so the terrain redraws.
- **Faith data model.** `rel = {patron, second, doc, name, tenets, deity, domain}`. `rel.domain` is the patron's symbol key into `DOMAINS`. `T.fx` holds the kingdom's computed buffs and is recomputed every 20 steps by `computeFx(T)`. Add a new buff by: adding the key to `zeroFx`, `BUFF_LABEL` and `fmtBuff`, then using `T.fx.<key>` where it should act.
- **History is automatic.** `log(msg, color, local)` copies the message into the history of any kingdom whose `title` appears in it. Use `local=true` for routine events so the global chronicle stays readable.
- **Audio.** `sfx(type, x, y, extra)` queues a sound event from the sim. `processSound()` in `render.js` only plays what is on screen, scaled by zoom, rate-limited by tokens and cooldowns. New effects go in `SFX`, new animal calls in `CALLS`.
- **Browser limits.** Browsers need a user gesture before audio starts (`audioInit()`). Do not use `localStorage`. Published pages cannot make network calls.
- **Accessibility.** Respect `prefers-reduced-motion`. Keep light and dark theme tokens in `style.css`.

## Biomes, ores, ages, domains and the tray (added later)

- **Adding a tool.** Add an item `[id, icon, name, description]` to a tab in `TABS` (`ui.js`). A tool that is dragged goes in `BRUSHFN` (`world.js`, `fn(p, radius, k)`); a tool that is tapped goes in `TAPS` (`fn(p)`). A creature tool is picked up automatically from `SPECIES`. Icons are an emoji, a function returning a baked sprite, `{sp}` or `{race}`.
- **Adding a species.** Add it to `SPECIES` (`data.js`) and a `case` in `animalSprite` (`sprites.js`), plus a call in `CALLS` (`audio.js`). Flags: `fly` (ignores terrain, drawn at `alt`), `amph` (walks shore and shallows), `monster` (hunts everything that is not a monster), `minor` (a predator that is not a threat to people), `nosl` (never butchered).
- **Adding a biome.** Add a `BM` key and a `BIOMES` entry in `data.js`, a tree in `TREES` and `BM_TREE` (`terrain.js`). Biome effects: `food` (forage multiplier), `spd`, `hp` (health lost per step, negative heals), `spread`. Special spawn rules live in `biomeLife` (`sim.js`).
- **Metallurgy.** `T.res` counts ore mined, `T.age` (0 to 5) rises through `AGE_REQ`/`checkAge` (`sim.js`) and feeds `computeFx` and `T.btier` for building sprites (`tierGrid` in `sprites.js`). `wantOre` picks which deposit a kingdom digs next.
- **Seasons.** `season()` honours `seasonLock` (-1 turns with the years). `terrain.js` repaints every tile as a random dissolve (`perm`, `tq`) when the season changes, `SEASON_WX` skews the weather.
- **Domains.** `computeDomains` (every 40 steps or when `ownDirty`) gives each tile to the building with the best normalised distance, so there is never an overlap. `canBuild(i, race, tid)` refuses foreign land unless at war. `render.js` caches the colour layer as a 4px-per-tile canvas (`buildOverlay`).
- **Jobs.** `u.job` (a key of `JOBS`, `data.js`) is assigned by `pickJob`/`setJob` when an adult has none; `jobWork` in `decide` gives job-specific tasks (`patrol` for soldiers). `T.jobs` is a census rebuilt every step, `rebalanceJobs` retires over-staffed jobs, and `computeFx` turns teachers and priests into kingdom buffs. Sprites take the job (`jobTool`, `jobHat`), and the sprite cache key includes it.
- **Immigrants.** `addPerson(T,x,y,pa,pb,race)` can put any race into any tribe; `u.race` is the person, `T.race` is the kingdom. Mixed parents give a child of either race.
- **Villages.** A kingdom is one tribe with several settlements in `T.towns` (index 0 is the capital, `T.cx,T.cy`). `settle`/`seaSettle` add a village (`addTown`) to the same tribe, so it keeps the kingdom's colour, stores and domain. People and livestock carry `u.town`; `townOf(u,T)` gives their village, and `decide`, `tryBuild`, `patrol` and sleeping work around it. Only the capital builds the great hall and temple. `computeDomains` recounts houses per village, `tendTowns` (yearly) abandons empty villages (re-indexing `u.town`) and sends families to struggling ones. When people change tribe (rebellion), reset `u.town=0`.
- **Registry and Chronicle.** `codex.js` also holds the Registry (`openRegistry`: kingdoms, villages, faiths and patron gods, cultures via `cultureName`, languages via `LANG`), where every name is an editable input applied by `applyName`, and the Chronicle (`openChron`, up to 240 `logs`). Only one of codex, registry and chronicle is open at a time. At far zoom (`cam.pz<1.25*dpr`) the Inspect tool opens the codex of the kingdom under the cursor (`tribeUnder`).
- **Village detail.** Tiles near buildings get a dirt yard (`dirt` in `pcol`), so call `markDirty(i)` when a building appears or goes. `decorTile` scatters tufts, bushes and boulders, and `withProp` gives each house a crate, hay bale or flower bed.
- **Peoples.** `RACES` entries with `base` (gnome→dwarf, goblin→orc, saurian→human, uplifted species) share the base people's pantheon, doctrines, tenets, values, art, legends and building style: `aliasRace` copies the culture tables, and `RB(race)` is used wherever a table is keyed by race. `RACE_KEYS` can grow at runtime, so never hard-code the four original races in counts.
- **Monolith and uplift.** `TAPS.monolith` places a slab in `monoliths`; `updateMonoliths` fires every 200 steps, and `upliftUnit` turns animals within 4.5 tiles into people of `makeUpliftRace(sp)` (generated names, language, look from `UPLIFT`), joining a nearby kingdom of their kind or founding one. `addRaceTile` gives the new people a Creatures tile. Uplifted sprites use the `L.beast` branch of `personSprite`.
- **Lasting chaos.** `wfx` (tornado, hole, storm, acid, delay) is updated in `updateWorldFx` (simulation) and drawn by `drawWorldFx` (render reads only). Creature effects use `u.frozen`, `u.shield`, `u.haste` (step numbers), `u.charm` (kingdom id) and odd traits on animals too (`u.traits` is created on demand).
- **Heralds (event callouts).** `log(msg, color, local, where)` takes an optional `where = {x, y, ic, p}` (use `newsAt(T, icon, priority)`; priority 1 minor to 3 major). Those events go into `news` and `tickHeralds` (`ui.js`) shows them as cards over the map with **Go there** (key `G` goes to the newest). At most 3 cards on desktop and 1 on phones, with the most important kept. Timers pause while the game is paused or the pointer rests on a card. `drawHeraldRings` (`render.js`) rings each spot on the map. Tag only events the sim causes, not ones the player triggers directly.
- **Wars on the map.** `drawWarArrows` draws a red arrow from `w.a` (attacker) to `w.b` for every war; kingdom banners show `pop/soldiers`.
- **Detail.** Biome edges are dithered per pixel (`bmAt`), trees are nudged and mirrored, and the domain layer picks each sub-pixel's owner from the four nearest tiles so borders run smoothly.
- **Layout.** The dashboard (`.tray`) is the left grid column on desktop and the bottom row on phones.
- The dev preview needs the page to be visible: `requestAnimationFrame` pauses in a background pane, so in headless checks call `draw(16)` in a loop.

## Balance knobs

- Faith strength: `computeFx` (devotion, temple 65% factor, doctrine multiplier, caps).
- Faith spread: schism chance in `newTribe` (0.4), reformation vs new patron in `newReligion` (0.25), conversion in `culturalYear` (0.08 when devotion is under 40).
- Unrest: stability formula in `culturalYear`, rebellion threshold (under 36).
- Art rate: `culturalTick`. Festival cadence: `T.nextFest` (every 4 to 6 years).
- Wildlife caps and breeding: `SPECIES` in `data.js`. Predators migrate back in yearly if they die out.

## Known issues and ideas

- Rebellions are rare. In tests there were often zero over 160 years. Tune stability or crowding.
- One kingdom per race at world start, so faith diversity comes only from schisms and rebellions. Consider more starting kingdoms or a world-size option.
- Ideas the player liked or asked about: trade and caravans, a way to follow a person's whole life story, race-specific music, mobile polish, save and load (needs serialisation of typed arrays and the `tribes` graph).
- The player wants WorldBox-level detail: visible units, animals and homes, so keep sprites readable at every zoom.
