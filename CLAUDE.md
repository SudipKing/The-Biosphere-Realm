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

Scripts share one global scope and load in this order (see `index.html`): `data, core, sim, culture, terrain, sprites, audio, render, codex, ui`. Function declarations are hoisted across files. Top-level `const`/`let` tables must only be read at runtime, never at load time by an earlier file.

| File | Role |
| --- | --- |
| `data.js` | Races, languages, holy-symbol glyphs (`DOMAINS`, keyed by deity symbol), traits, animal `SPECIES`, weather types |
| `core.js` | Constants (map 240x150, 8px tiles, `YEAR` = 200 steps, `DAY` = 2400), noise, terrain helpers, spatial grid for neighbour queries, shared state |
| `sim.js` | Fixed-step simulation: people, genetics, animals and livestock, kingdoms, boats, fire and lava, day/night and weather, world generation, god powers |
| `culture.js` | Pantheons, doctrines, values, rites, art, legends, omens, conversion, rebellion, alliances and wars |
| `terrain.js` | Terrain drawn into 32x32-tile chunks with dirty-tile queue (edits stay cheap) |
| `sprites.js` | Procedural pixel-art: people, animals, buildings, monuments, boats. Cached by key with `spr()` |
| `audio.js` | Web Audio synthesis: generative music, a unique voice per species, babbling language per race, rites, ambience |
| `render.js` | Camera with eased zoom and inertia, interpolated drawing, lighting, weather overlays, spatial sound mixing |
| `codex.js` | Realm Codex panel (Overview, Faith, Culture and Art, History) |
| `ui.js` | Tools, inspector, side panel, input, main loop |

## Key rules and gotchas

- **Fixed-rate sim, interpolated render.** The sim runs 20 steps/s at 1x. Every unit and boat keeps `px,py` (previous) and `x,y`; render lerps with `alpha`. Never move entities in `draw()`.
- **Smoothness is a hard requirement.** Avoid per-frame allocation, avoid uploading the whole terrain, and keep neighbour searches on the spatial grid (`nearest()`).
- **Tile data lives in typed arrays:** `hgt, tree, fire, lava, bld, btype, burnt`. `bld[i]` is a kingdom id, `-1` empty, `-2` ruin. `btype`: 0 house, 1 great hall, 2 temple, 3 ruin, 4 monument. Call `markTile(i)` or `markDirty(i)` after changing a tile so the terrain redraws.
- **Faith data model.** `rel = {patron, second, doc, name, tenets, deity, domain}`. `rel.domain` is the patron's symbol key into `DOMAINS`. `T.fx` holds the kingdom's computed buffs and is recomputed every 20 steps by `computeFx(T)`. Add a new buff by: adding the key to `zeroFx`, `BUFF_LABEL` and `fmtBuff`, then using `T.fx.<key>` where it should act.
- **History is automatic.** `log(msg, color, local)` copies the message into the history of any kingdom whose `title` appears in it. Use `local=true` for routine events so the global chronicle stays readable.
- **Audio.** `sfx(type, x, y, extra)` queues a sound event from the sim. `processSound()` in `render.js` only plays what is on screen, scaled by zoom, rate-limited by tokens and cooldowns. New effects go in `SFX`, new animal calls in `CALLS`.
- **Browser limits.** Browsers need a user gesture before audio starts (`audioInit()`). Do not use `localStorage`. Published pages cannot make network calls.
- **Accessibility.** Respect `prefers-reduced-motion`. Keep light and dark theme tokens in `style.css`.

## Balance knobs

- Faith strength: `computeFx` (devotion, temple 65% factor, doctrine multiplier, caps).
- Faith spread: schism chance in `newTribe` (0.4), reformation vs new patron in `newReligion` (0.25), conversion in `culturalYear` (0.08 when devotion is under 40).
- Unrest: stability formula in `culturalYear`, rebellion threshold (under 36).
- Art rate: `culturalTick`. Festival cadence: `T.nextFest` (every 4 to 6 years).
- Wildlife caps and breeding: `SPECIES` in `data.js`. Predators migrate back in yearly if they die out.

## Known issues and ideas

- Rebellions are rare. In tests there were often zero over 160 years. Tune stability or crowding.
- One kingdom per race at world start, so faith diversity comes only from schisms and rebellions. Consider more starting kingdoms or a world-size option.
- Ideas the player liked or asked about: kingdom territory borders on the map, more creatures (dragons, bears already in), plagues and disasters, race-specific music, trade and caravans, a way to follow a person's whole life story, mobile polish, save and load (needs serialisation of typed arrays and the `tribes` graph).
- The player wants WorldBox-level detail: visible units, animals and homes, so keep sprites readable at every zoom.
