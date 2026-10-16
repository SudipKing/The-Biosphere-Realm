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

Scripts share one global scope and load in this order (see `index.html`): `data, core, sim, culture, world, terrain, sprites, audio, fauna, render, codex, ui, save`. Function declarations are hoisted across files. Top-level `const`/`let` tables must only be read at runtime, never at load time by an earlier file.

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
| `fauna.js` | WorldBox-style creatures added later: sprites, calls, special behaviours (`act`), biome spawns, and their powers (`FAUNA_ITEMS`, `WFX2`) |
| `render.js` | Camera with eased zoom and inertia, interpolated drawing, lighting, weather overlays, spatial sound mixing |
| `codex.js` | Realm Codex panel (Overview, Faith, Culture and Art, History) |
| `ui.js` | Power tray (`TABS`), inspector, side panel, World panel, help and first-run card, input, main loop |
| `save.js` | Save the world to a gzipped `.biosphere` file and load it back (`saveWorld`, `buildWorld`, `applyWorld`) |

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
- **Metallurgy.** `T.res` counts ore mined, `T.age` (0 to 5) rises through `AGE_REQ`/`checkAge` (`sim.js`) and feeds `computeFx` and `T.btier` for building sprites (`tierGrid` in `sprites.js`). `wantOre` picks which deposit a kingdom digs next. Ore runs out, so `prospect()` (yearly) opens a new vein when a metal falls below its floor, and `getOre` looks up to 40 tiles for the wanted ore.
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
- **Events.** There are no on-map pop-ups. `log(msg, color, local, where)` stores `where` on the log entry, and the Chronicle and the tray mini-log (`#miniLog`) offer Go there for it.
- **Combat visuals.** `hit()` and `die()` push to `HITQ`/`DEATHQ` (visual only, never read by the sim); `render.js` drains them into slash arcs, hit flashes, damage numbers and fading corpses. Lunge and knockback are draw offsets from `u._atkAt`/`u._hitAt`.
- **Village look.** `computeRoads()` (terrain.js) derives `road` and `fld` from buildings after `computeDomains` and on load; they are never saved.
- **Wars on the map.** `drawWarArrows` draws a red arrow from `w.a` (attacker) to `w.b` for every war; kingdom banners show `pop/soldiers`.
- **Detail.** Biome edges are dithered per pixel (`bmAt`), trees are nudged and mirrored, and the domain layer picks each sub-pixel's owner from the four nearest tiles so borders run smoothly.
- **Layout.** The dashboard (`.tray`) is the left grid column on desktop and the bottom row on phones.
- The dev preview needs the page to be visible: `requestAnimationFrame` pauses in a background pane, so in headless checks call `draw(16)` in a loop.

## Seeds, saves, the storyteller and frame budgets (added later)

- **Randomness.** `R()` (core.js) is a seeded mulberry32 that drives the world; `genWorld(seedText)` seeds it from `worldSeed` (`seedValue` hashes any text). Visual and audio randomness must use `RC()` (Math.random), so effects never change the world. A seed reproduces the generated map, not the later history, and any change to the order of `R()` calls inside `genWorld` changes what a seed produces.
- **Save and load.** `saveWorld()` returns plain data: typed arrays as base64, `T.rel` as an index into `religions`, faith gods as indices into `PANTHEON[race]`, unit `target` as an id (a target that already died is kept in `ghosts`, because its hunter only drops it, and resets its task, on its next turn), boat passengers in full (they are not in `units`), uplifted races in full. Unit fields starting with `_` are render caches and are never saved. `own`, `T.fx`, `lastDomains` and `landTiles` are saved too, so a loaded world carries on exactly as the original would. `buildWorld` validates and builds everything before `applyWorld` swaps it in, then rebuilds derived state (`census`, `initTerrain`, `syncRaceTiles`). **New world state must be added to both `saveWorld` and `buildWorld`/`applyWorld`.** Check: save, run 300 steps; load that save, run 300 steps; the two results must be identical.
- **World panel.** The header World button opens `#worldPop`: seed, Save, Load, and the only way to start a new world (with a seed field). `afterWorld()` is the shared tail for a new or loaded world.
- **Storyteller.** `storyYear()` (culture.js, called from `yearly`) acts only after `STORY_QUIET` years in which no kingdom rose or fell (`story.sig` counts kingdoms), never before `STORY_FROM`, at most every `STORY_GAP` years. Events are in `STORY` (migration, pretender, sickness, golden age, border war), each `fire()` returns whether it happened. `story` is plain data and is saved. A golden age is `T.golden` (a step number) read in `computeFx`.
- **Open land.** `domainRadius` is capped at `DOM_RMAX`, and every domain shrinks once more than `DOM_FULL` of the land is held, so migrants and villages always find a frontier.
- **Frame budgets.** The main loop gives the sim `SIM_BUDGET` ms per frame (it predicts from the average step cost), terrain repainting gets `TERRAIN_MS`, chunks upload only their dirty rectangle, and the domain colour layer redraws only the box of tiles whose owner changed (`ovBox`). `computeDomains` runs at most every 10 steps when buildings change. Units cache their two sprite frames in `u._sp`. Every unit is created from `blankUnit()` so all units share one object shape (faster property access); add new unit fields there.
- **Follow a life.** People store parent ids (`u.pa`, `u.pb`). When a followed person dies, the inspector offers their oldest living child (`heirOf`), or someone from the same kingdom.

## Balance knobs

- Faith strength: `computeFx` (devotion, temple 65% factor, doctrine multiplier, caps).
- Faith spread: schism chance in `newTribe` (0.4), reformation vs new patron in `newReligion` (0.25), conversion in `culturalYear` (0.08 when devotion is under 40).
- Unrest: stability formula in `culturalYear` (crowding, share of the land and number of villages lower it), rebellion below `REBEL_STAB` (40) with a yearly chance of 3.5% scaled by how far below.
- Storyteller: `STORY_QUIET`, `STORY_FROM`, `STORY_GAP` and the weights in `STORY` (culture.js).
- Open land: `DOM_RMAX` and `DOM_FULL` (world.js).
- Art rate: `culturalTick`. Festival cadence: `T.nextFest` (every 4 to 6 years).
- Wildlife caps and breeding: `SPECIES` in `data.js`. Predators migrate back in yearly if they die out.

## Known issues and ideas

- One kingdom per race at world start, so faith diversity comes only from schisms and rebellions. Consider more starting kingdoms or a world-size option.
- Ideas the player liked or asked about: trade and caravans, race-specific music, mobile polish, optional goals or feats, a shareable world postcard image, map presets and world size.
- The player wants WorldBox-level detail: visible units, animals and homes, so keep sprites readable at every zoom.
