# The Biosphere Realm: project log

This is my log of how The Biosphere Realm came to be: what I set out to build, what I asked Claude for, what I decided, and what I threw away. It is Artifact 2 for TCSS 490 (Generative AI & Software Development).

I rebuilt this log from three sources:
- the git history (65 commits, 51 of them non-merge, from 2026-10-12 to 2026-10-21);
- my own prompts in the Claude Code session transcripts for this repo;
- the notes Claude wrote along the way (`CLAUDE.md`, commit messages, `tools/chronicler/LOG.md`).

Quotes are my own prompts, typos included. Dates and times are Pacific time, matching the commit dates. Where I couldn't recover why a change was made, I describe the diff and say so instead of inventing a reason.

---

## 1. The idea

I wanted a **WorldBox-style god simulation that runs entirely in the browser**: a living world you shape and poke at while peoples, animals and kingdoms grow, pray, make art, fight and fall on their own. I also wanted it to be more than a sandbox. Each people should have its own faith, culture, language and history, so the world tells stories.

Constraints I held to from the start, written into `CLAUDE.md`:
- **Plain HTML, CSS and JavaScript.** No dependencies and no build step needed to play. `build.py` optionally bundles everything into one HTML file.
- **Everything generated in code.** That covers the pixel art, the map, the languages, the music and every sound. The art is original and must never copy WorldBox assets or names.
- **Smoothness is a hard requirement.** The sim runs at a fixed rate, the renderer interpolates, and there are no per-frame allocations.
- **It has to run as a static page** (GitHub Pages), so no network calls and no `localStorage`.

## 2. Brainstorm and the first version (before Claude Code)

I built and brainstormed the first version in an earlier Claude conversation, outside Claude Code. **I don't have those prompts in my Claude Code transcripts**, so this section comes from the code and docs that conversation handed over.

That conversation produced a git bundle (`the-biosphere-realm.bundle`) with 16 commits, authored as "Claude", all stamped 2026-10-12 14:23 PT:
- `.gitignore`, the README, `build.py` and `style.css`;
- `data.js`: races, languages, holy symbols, traits, animals and weather;
- `core.js`: constants, noise, terrain helpers and a spatial grid;
- `sim.js`: people, genetics, animals, kingdoms, boats, fire, time and weather;
- `culture.js`: pantheons, doctrines, rites, art, legends, diplomacy and unrest;
- `terrain.js`: a chunked terrain renderer with smooth coastlines;
- `sprites.js`: procedural pixel-art sprites;
- `audio.js`: synthesized music, creature voices, race languages and ambience;
- `render.js`: camera, interpolation, lighting, weather and spatial sound;
- `codex.js`: the Realm Codex, with faith, culture, art and history per kingdom;
- `ui.js`, plus the page shell;
- last, **`CLAUDE.md`: "project handoff for continuing in Claude Code"**.

What version 1 had, per its README:
- **Four peoples:** humans, elves, dwarves and orcs.
- **A pantheon for each people.** Dwarven stone gods, elven season spirits, human gods of order and trade, orcish war gods.
- **Faith mechanics:** sects with doctrines (Orthodox, Zealous, Contemplative, Syncretic), devotion, temples and festivals/rites.
- **Society:** stability and rebellion, alliances, holy wars, missionaries, omens, cultural values, works of art and per-kingdom history.

The handoff `CLAUDE.md` also kept a list of **ideas I had liked or asked about** that weren't built yet. That list became my brainstorm backlog:
- kingdom territory borders on the map;
- more creatures;
- plagues and disasters;
- race-specific music;
- trade and caravans;
- following one person's life story;
- mobile polish;
- save and load;
- and "WorldBox-level detail: visible units, animals and homes".

It also listed known problems: rebellions were rare, and there was only one kingdom per race at the start.

---

## 3. Timeline of builds

### Phase 0: Getting it onto GitHub (Oct 12)

I opened Claude Code and pasted the commands to clone `SudipKing/The-Biosphere-Realm` and pull the bundle into it.
- **The bundle wasn't on the PC yet.** Claude asked how to proceed, and I chose **"Push folder as new commit"**. It made a single "Initial commit" from the project folder.
- **Then I copied the bundle in:** "in the Fun Project folder, the bundle should be there now". Claude asked before force-pushing over its own single commit. I said **"Yes, force-push"**, so GitHub has the real 16-commit history instead of one squashed commit.
- **Decision:** I kept the original history rather than a clean single commit.

### Phase 1: The six-tab power tray, biomes, ores, ages and domains (Oct 12, `ed9d57c`)

My first real request, with a screenshot of the tray style I wanted:

> "utilize this section style. their is a separate tab for 1. landscaping/world shaping ... 2. animals, monster, creatures (includes sapient and non sapient beings, add birds, dragons, skeletons and zombies ... 3. diplomacy/noosephere. 4. Nature and diaster (include seeds for other biomes [savanna, birch, rocklands, jungle, crystal, candy, wasteland, lemon, flower, cloves, paradox] ... include ores like rocks, gold, silver ... like they start with wooden homes, then mine stone and upgrade the buildings. 5. Chaos - include meteor, bombs (sepeate kinds, like greande, bomb, molotov, antimatter ... nuke, tsar bomb. 6. random power/ stuff, surprise me"

In the same message:
- "i wanna be able to pause a season like i can keep it summer the whole time or winter";
- "give each kingdom a layer of color which shows how much of th emap is under their domain ... this should prevent overlap of 2 kingdoms in the same tile";
- "Just commit all changes directly to github."

What came out (1,269 lines added across 16 files):
- **The tray:** six tabs on a dark tray, keys 1–6 to switch, and hover descriptions.
- **World shaping:** soils, hills, mountains and three sea depths.
- **Creatures:** birds and pets, plus monsters (skeletons, zombies that convert their victims, dragons that burn villages, wraiths, spiders and ogres).
- **Biomes, ores and ages:** biome seeds with their own trees and buffs or curses, ores and metal ages that upgrade buildings.
- **Chaos:** a set of bombs.
- **Season lock** and a **kingdom domain overlay**.

I was switching between Sonnet and Opus with `/model` during this session.

### Phase 2: Dashboard back on the left, jobs, immigrants, colonies (Oct 14, `77e2afd`)

After playing it I pushed back on parts of the new layout:

> "keep the dashboard on the left handside like in the previous version. Also the season was also bette in the prev version. I dont like the bottom to top, it should feel natural. I should also be able to place sapients in other kingdoms, like an elf or human in orc kingdom. Allow kingdoms to expand and make new settlements. There should also be a job classes, like farmers, soldiers, miners, teachers. Make the game, land, homes, charcters all more detailed."

What changed:
- **Tray:** it went back to a left column.
- **Season changes:** the "bottom to top" effect turned out to be the map repainting in a sweep, so it now dissolves in randomly across the whole map instead.
- **Immigrants:** dropping a person of one race into another kingdom makes them join it.
- **Jobs and colonies:** job classes were added, and kingdoms send out colonies.

### Phase 3: Colonies stay in the kingdom; the Chronicle book; the editable registry (Oct 14, `f5fee63`)

The colonies in Phase 2 became separate kingdoms, which wasn't what I meant:

> "when they send a settlement out, it should still be part of the kingdom. If the kingdom;s color is yellow, that colony is still yellow. that colony is its own village but its still part of the kingdom. Also when i zoom al the way out and click on a kingdom it should give me info on that. Put a button with the image of a book, clicking that shows the Chronicle. ... add buttons that when i click it shows me all the kingdoms, all religion, culture, language. The names of all these should be editable"

Result:
- **Villages:** settlers now found a *village* that keeps the kingdom's colour, stores and territory, and only the capital builds the great hall and temple.
- **Codex at far zoom:** clicking a kingdom there opens its codex.
- **The Chronicle** got a 📖 button.
- **A registry** lists all kingdoms, religions, cultures and languages, with editable names.

### Phase 4: War arrows, pop/soldier banners and the monolith (Oct 14, `ec49a92`)

> "when kingdoms are fighting, make a red arrow pointed towards the nation thier attacking. kingdom should also show their numbers in this fashion: total population/the amount of soldiers. add more wonders and chaos items, make sure these items work on all beings, not just the sapient ones. Also add more types of sapient beings. Actually make a monolith that i can place anywhere. It releases a beam every 10 seconf ... ANy no-sapient being that gets hit by the beam becomes a new species and is sapient ... Also make everything more detailed rather than just blocks"

Result:
- **War arrows:** animated red arrows point from attacker to target.
- **Banners:** they read like `Evershire 23/1⚔`.
- **New peoples:** gnomes, goblins and saurians.
- **The monolith:** any animal or monster caught in its beam becomes a new "uplifted" sapient people (sheep become Woolfolk, wolves Wolfkin, dragons Drakari). Each gets its own look, language, kingdom and faith.
- More wonders and chaos.

### Phase 5: A design review, and event callouts I later threw away (Oct 16 morning, `af05486`)

I ran the `/frontend-design` skill: "do a through review of the game and find areas to improve or add to increas user retention and engagement". Claude played a world to year 125 and came back with a ranked list:
- **Layout bugs:** the map collapsed to 0px on short landscape phones, and on phone portrait it got only a third of the screen.
- **First-run problems:** no guidance for new players, and a one-click "New world" that wiped everything.
- **Big events were invisible**, listed only in the side log.
- **Following a person ended at their death.**
- **The mid-game went quiet:** ages froze around year 95, with no new kingdoms and no wars.
- **No save/load or seeds.**
- **Further ideas:** optional goals, a shareable world postcard, map presets.

My decisions and the process around them:
- **First pick:** "Build the on-map event callouts with a Go there button first." Big events became cards over the map with a button that flies the camera there.
- **The layout fix went to a separate side session.** I stopped it ("stop sub agwent") and told Claude: "Make sure all sub agents run on Sonnet, remeber that for every sub-agent in this enviroment." That became a standing rule for the rest of the project. I then had it "restart it on sonnet". That fix shipped inside `cf45c8b`.
- **Shipping:** I had Claude commit, fast-forward `main` and push.

The callouts were removed the same afternoon (see Phase 7).

### Phase 6: Smoothness, a storyteller, save/load and seeds (Oct 16, `cf45c8b`, `80fc075`)

I ran `/feature-dev`: "do a through review of Frontend Review chat, then the game and find areas to improve or add new feautures so the game runs smoothy and is visually and game-ically appealing to users".

Claude offered four bundles. **I picked all four:** Smoothness, Mid-game life, First-session polish, and Save/load + seeds. I also chose:
- **Storyteller:** "Gentle, always on" over a header toggle or a dramatic mode;
- **Other session's work:** build on top of the uncommitted mobile fix;
- **Plan:** "Build all four" in one go instead of stopping after each bundle.

Then I said "commit to main".

What `cf45c8b` added:
- **Smoothness:**
  - `computeDomains` went from 30 ms to about 3 ms.
  - The sim gets a frame-time budget.
  - Terrain and domain layers redraw in budgeted slices.
  - Sprites are pre-baked.
  - Result: a 9× frame went from ~30 ms (with 120 ms spikes) to ~16 ms.
- **Mid-game life:**
  - A domain cap and a land squeeze keep 15–25% of land free.
  - Rebellions were retuned to actually happen.
  - A storyteller steps in after 15 quiet years with a migration, pretender, sickness, golden age or border war.
- **First session:** a World panel with seed, save, load and a *confirmed* new world. Also:
  - a first-run card and a `?` help card;
  - following the dead person's child;
  - kingdoms visible at night.
- **Save and seeds:** seeded world generation (mulberry32, with a separate RNG for visuals) and gzipped `.biosphere` save files.

**Trade-off I accepted:** by about year 70, 9× really runs at 3–5× because each sim step got expensive. Claude chose smooth frames over raw speed, and I kept that.

Claude suggested two follow-ups, and I said "do both suggested task first". They ran as side sessions and became `80fc075`:
- **Ages stalled at year 80.** The root cause was that every ore vein on the map got mined out. The fix was a yearly `prospect()` that opens new veins when a metal runs low, plus a longer mining reach.
- **Sim cost and save drift:** sim steps got about 13% cheaper, and saves now carry borders and buffs, so a loaded world continues *exactly* like the original.

Then: "Commit the follow-up changes to main and push main to origin."

### Phase 7: The WorldBox pass: real combat, no pop-ups, village look, 26 creatures (Oct 16 afternoon)

I ran `/design` with a WorldBox screenshot:

> "Use the game WorldBox as a refrence point, add alot of the features and items they have. Also i dont like how the events pop up on the screen. get rid of that. ... when two kingdoms fight, they dont look like their fighting, like both troops walk up to each other and one will just disappear. Make the combat look like its an actual fight ... the user should be able to see that a unit died, like it slowly fades away. Sepearte the task to sub-agents to focus on diffrent aspect. Once its done u merge and commit everything."

Four sub-agents worked in parallel worktrees, and Claude merged them:

| Commit | What it added |
| --- | --- |
| `a44f297` | **Removed the event heralds/callouts from Phase 5.** Events now go to the Chronicle (with a Go there link) and a 3-line mini log in the tray. The interface was restyled with chunky pixel-art panels. |
| `2a23ac0` | Visible combat: lunges, slash arcs, hit flash, health bars, damage numbers, toppling and fading corpses, and a death sound. |
| `ee33a55` | Village look: kingdom-colour roofs, dirt roads, seasonal crop fields, bonfires that glow at night, and crisper water. |
| `bdf0db1` | 26 new creatures (`src/fauna.js`), including slimes that split, demons, sand worms and a walking tree, plus 11 new god powers. |

It was slow. At one point I wrote "can we speed it up, its been like 2 hours", and later "Max power, get everything done and commit as soon as you can" and "hurry".

Follow-ups in the same push:
- **`520408b`:** toned down the new giants (rhinos, grove guardians and crystal golems no longer get hunted by soldiers) and lowered the new species caps "so the sim stays fast".
- **`7f960ca`:** fauna broke exact save/load on one seed (s1). A side session bisected it: units chasing a target that had just died lost it on reload. Dead targets are now saved as "ghosts".
- **`f8bee39`:** the village agent had skipped new building types, so a second agent added forge, dock, watchtower and windmill.

Then: "Yes, push main to GitHub."

### Phase 8: Technology eras, generals and distinct race art (Oct 16, `d893876`)

> "Focus on making all units look more detailed. The user can clearly diffrentiate between all races without seeing a label. ... The design of the boats should also vary with different species. The hear it button on species does nothing. Implement a general unit, so soldiers gather and follow him around. when its war the general leads the troops to go attack. Also add a technological advancements ... from stone age to bronze, iron, to modern and technolgical look. ... the speed which they advance is diffrent for all spaient species."

Then: "create subagents to help break up the task and get it done faster."

Result (1,677 lines added):
- **Eight eras (Stone → Future):** driven by research and ore, at a different pace per race. Gnomes are fastest; elves and orcs are slowest.
- **Gear by era:** firearms from the Gunpowder Age, and farm fields that change with the era.
- **Art:** new `people.js` with a distinct silhouette per race, plus buildings and boats per race and era in `architecture.js`.
- **Generals:** they lead soldiers in formation and march on the enemy in war.
- **"Hear it" fix:** the inspector was rebuilding every half second, so clicks were lost.

### Phase 9: Day and weather locks, city revolts, falling bombs, the magnet (Oct 16, `777f6be`)

> "Just like how the seasons can be paused, do the same for the day and weather. Also when a city revolts, i should become its own kingdom. Like if kingdom A has city Ab Ac Ad, if Ac rebels it should be Kingdom B. Also make the domain color bolder when zoomed out since its hard to see ... Add more Chaotic & Wonder Items. Add more animals. Also for the bombs, instead of randomly spawing, it should fall out of the sky. Include a magnet in Wonders that allows the user to pick up any creatures, the bigger the brush size the wider the magnets radius. Commit and push"

Result:
- **Locks:** time-of-day and weather locks, saved with the world.
- **Revolts:** a revolting village breaks away whole as a new kingdom named after it.
- **Domain colours:** bold when zoomed out, fading when zoomed in.
- **Bombs:** they whistle down with a growing shadow.
- **New chaos:** sinkhole, lava fissure, locusts, gravity flip and others.
- **New wonders:** lifting magnet, rainbow, healing spring and others.
- **17 new animals.**

### Phase 10: Crash fixes, the Divine hand and "feel like a God" (Oct 16, `3c628f0`)

> "Repeated use of the hourglass caused the game to crash. I couldnt even make a new world and had to refresh the browser. ... Also the whole screen shakes and goes black for a second as i hover around the diffrent items. ... it should start all the way zoomed out. ... clicking around it should close the popup rather than clicking the x. I should be able to edit the names of anything ... filter thru by age, population, soldiers, size. Give the user more tools to interact and play around with ... The User should feel like a God when he plays the game."

Then: "use multi agents to make the task go faster" and "do a through check and review to make sure everything is smooth and overall improves user experience. Then commit and push after everything is done."

Result:
- **Hourglass:** it now queues a fast-forward that runs a slice per frame, instead of blocking the page.
- **Robustness:** the main loop can no longer die from one error, and lasting effects are capped.
- **Hover flicker:** the hint bar has a fixed height, so hovering no longer resizes the map.
- **Starting view:** new worlds open fully zoomed out.
- **Inspector:** tapping bare ground closes it.
- **Renaming:** every name can be edited in place.
- **Registry:** a full Registry with filters and sorting.
- **The Divine hand tab** (`divine.js`): smite, resurrect, crown, unite kingdoms, summon army, baby boom, prophet, awaken and more.

### Phase 11: The realm-overhaul branch: quakes, 3D-shaded props, great beasts, borders, boats, speed (Oct 16 night)

This was my biggest single request:

> "The speed buttons don't work usually after year 50. Sometimes every civilization and species/building disappear and nothing loads. But the chronicle keeps updating ... The earthquake should be in a different style and intensity ... It should also change the landscape (either lower or raise it) ... Always Summer and Always Autumn cause the top bar to extend to 2 space ... how is there so many trees ... why are they tinier than even crabs? The buildings ... are placed on top of the trees and resources. ... lets try making the pixels 3d. Add a bar below te year ... showing the months, use 1-12. ... The sandworm should be able to dig in the sand ... Some of the powerful beings like demon, spider, troll dont fight back and die with lie 2-3 hits. ... Use these as refence points ...: Dragon's Dogma, Dragon Age: Origin, The Elder Scrolls V: Skyrim, The Witcher 3: Wild Hunt. Kingdoms should feel threatend and send their military to defeat them ... Make sure al subagents are on sonnet"

**Five Sonnet agents** worked in their own worktrees on a new `realm-overhaul` branch:
- **`d8002ef`:** fixed the frozen picture. The domain overlay kept a stale colour table, so a newly founded kingdom made `draw()` throw every frame while the sim kept logging. That explains why "the chronicle keeps updating".
- **`ffdb952`:** a lasting earthquake with a fault scarp that raises one side and sinks the other, plus shockwaves, fissures, dust, camera shake and rumble.
- **`de49e41`:** a fixed-height header and a month 1–12 progress bar.
- **`af130ba`:** bigger, 3D-shaded trees, rocks and ore as y-sorted sprites, with clumpy forests, no building on trees or ore, and shadows.
- **`94135f1`:** "great beasts". Bosses get real HP, armour, signature moves, and a sand worm that burrows away to heal. Kingdoms now raise general-led hunts against them.

Related decisions:
- **Watching the agents.** I asked: "can you show the work the subagents are doing? like i should be able to see their chat as well in the sidebar". They were background agents, so they couldn't appear there. I answered: let them finish, but **"In the future, show the sessions, i dont need to talk to them rather just so im aware"**. The next batch of work ran as visible sidebar sessions.
- **Rendering engine.** I suggested: "Something to consider is using something like Babylon.js or Three.js or Phaser to render the games better." **I decided against it.** Three and Babylon are 3D engines and would mean rebuilding the art. Phaser wants to own the game loop. All three add a large dependency to a project that has none. The plan instead: measure first, then try a small hand-written WebGL sprite batcher if needed.
- **Branching.** "Keep it on the realm-overhaul branch for now; I'll play-test first."

After play-testing I asked for:
- "half the size of the rocks/ores, or make varied sizes so they get different amount of ores depending on the size. also animals spawn too fast and too many, like why are penguins spawing in the desert?"
- "or camels and cows in the jungle? also fix the border for kingdoms, draw a solid outline of the whole kingdom but if zoomed in a little it shows which land is by which vilaage ... the boats dont look like boats at all. Like in 1 run, by year 60 theres only 200 people but over a 1K animals."

That turned into four visible Sonnet sessions, each on its own branch, plus fixes on the main branch:

| Commit | Branch / session | What it did |
| --- | --- | --- |
| `63fe652` (+`6c39128`) | `units-draw-speed` | Hand-written **WebGL batch** for units, buildings and boats at far zoom, sharing one sprite atlas. Whole-map frames went from ~56 ms to ~17 ms. This was the "small batcher instead of an engine" plan. |
| `0ed6965` | `seasons-in-year` | The four seasons now pass *within* each year (months 1–3 spring, and so on). Before, one season lasted a whole year, which made "Month 5" sometimes spring and sometimes autumn. |
| `84dcaa4` | `claude/kingdom-borders-e4af82` | A solid outline around each kingdom, with village tints and divider lines when zoomed in. |
| `b374aa6` | `claude/boat-sprites-831ed0` | Side-view hulls for every era, from dugout canoe to container ship, with kingdom-colour sails and bow wake. |
| `edca8a1` | realm-overhaul | Ore rocks halved and sized by amount. Animals kept to their habitats and under a budget scaled to the number of people. |
| `c5db1d0` | realm-overhaul | The full title fits in the header at 1280px, with Domains shown as an icon. |

I then asked Claude to "Merge ... into realm-overhaul, then test everything together." The merge exposed one crash, which became `c4f12eb`: borders read village owners before the first domain pass had set them.

Measured after the merge:
- **Frame rate:** whole-map ~16 fps → ~56 fps at 1×.
- **Save/load:** still identical, including with a burrowed sand worm and a beast hunt in progress.

Then: "is everything done? if so commit", "merge" and "Push. are the subagents done with their tasks?" `main` landed at `c4f12eb`.

### Phase 12: Claude inside the game: the Chronicler and the Ruler (Oct 19–21)

This phase was done for the **next** assignment (Artifact 3, "AI Inside It"), but it lives in this repo and changed the game, so I'm logging it here. Its own detailed build log is `tools/chronicler/LOG.md`.

I pasted the Artifact 3 brief and asked "what does this mean", then: **"My Artifact 2 is The Biosphere Realm, how can you be part of that"**. Claude gave four options:
1. an AI chronicler;
2. an MCP "god you can talk to";
3. a `/balance-check` slash command;
4. a fourth option, cut off in the transcript.

The binding constraint was that the game is a static page and the API costs money, so Claude has to sit *next to* the game, talking through save files. I said "start building".

- **`85e7694`, the Chronicler (Oct 20):** `tools/chronicler` turns a `.biosphere` save into a fact sheet per kingdom and asks `claude -p` for a short chronicle in that people's voice, citing event IDs. Code then validates every name, year, citation and length, retries with the errors, and writes the passing chronicles into the save. **The split I chose: the model writes the prose, and the code decides what's true.** I merged it via PR #1. When Claude reminded me about turning it in, I said: "dont worry about the turn in, focus on the project itself. Push the code and commit and ill run the game to test it."
- **`ae25ee0`, chronicles on GitHub Pages (Oct 21):** "make this usuable when i run it from the github page". A static page can't run `claude -p`, so the History tab now has a copy-prompt, paste-reply flow. The prompt, fact sheet and validator moved into `src/chronicle.js`, shared by the game and the Node tool so the two can never disagree.
- **`c69d290`, Claude rules a kingdom (Oct 21):** "Can you act as a civilization or be part of the game itself thru an api call". Claude offered two routes, the paid API from the browser or a free local `claude -p` bridge. I said **"do 2"**.
  - Every 3 in-game years, a kingdom set to "👑 Let Claude rule" sends a situation report to `tools/ruler-bridge` on 127.0.0.1.
  - Claude picks one of 7 moves and writes a decree.
  - `src/ruler.js` checks legality twice: against the report, then against the live world, which may have moved while Claude thought.
  - The bridge only accepts situation reports and only from localhost or my Pages origin.

Then I had Claude "merge ai-chronicler into main and push so it goes live on GitHub Pages."

---

## 4. Decisions I made along the way

- **Kept the original bundle history** instead of a squashed "Initial commit" (force-push, with my OK).
- **Stayed dependency-free and static.** That's why there is no Three.js, Babylon or Phaser. When drawing got slow, I took a ~120-line hand-written WebGL batcher instead.
- **Smooth frames over raw speed:** 9× slows down in big late-game worlds rather than dropping frames.
- **Colonies are villages of the same kingdom,** not new kingdoms. Revolts break a *village* off as a new kingdom.
- **Seasons pass within each year,** and season, day and weather can each be locked.
- **Exact save/load is a rule:** save, run 300 steps; load, run 300 steps; the results must be identical. This rule caught real bugs twice (border state, then dead targets).
- **World randomness vs visual randomness:** `R()` is seeded for the world, and `RC()` is cosmetic, so visuals never change the simulation.
- **All sub-agents run on Sonnet.** I said so on Oct 16 and asked Claude to remember it. I also wanted helper work visible as sidebar sessions from then on.
- **Branch for risky work:** the night-of-Oct-16 overhaul stayed on `realm-overhaul` until I'd play-tested it.
- **Beasts should be scary:** stone-age armies usually lose to a troll or dragon, and from the gun era on armies mostly win. I kept that as intended.
- **For AI inside the game, Claude decides and the code checks.** I used the free local `claude -p` route rather than a paid API key.

## 5. What I abandoned or changed my mind on

- **On-map event callouts ("heralds"), built and then removed.** Claude built them in the morning of Oct 16 (`af05486`) as the top idea from the retention review. By that afternoon I'd decided "i dont like how the events pop up on the screen. get rid of that", and `a44f297` replaced them with Chronicle "Go there" links and a mini log.
- **The bottom-to-top season repaint.** I didn't like it ("it should feel natural"), so it became a random dissolve. Later the one-season-per-year model itself was replaced by four seasons per year.
- **Colonies as separate kingdoms** (Phase 2). I reversed this in Phase 3.
- **The right-side/bottom dashboard layout.** I moved it back to the left.
- **Big 3D/game engines** (Three.js, Babylon.js, Phaser). I considered them and rejected them for a custom WebGL batcher.
- **Restarting background agents as sidebar sessions mid-task.** I declined that for the running batch and asked for it in future instead.
- **The paid Claude API route for the ruler.** I took the free local bridge.
- **Other Artifact 3 shapes I didn't build:** the MCP "god you can talk to" and the `/balance-check` command.
- **Ideas from the retention review that never got built:** a "director" camera, optional goals/feats, a shareable world postcard, map presets and world size. I found no code for them.
- **Things that got scaled back after play-testing:**
  - new giants hunted by soldiers (toned down in `520408b`);
  - house-sized ore rocks (halved in `edca8a1`);
  - animals spawning everywhere: penguins in the desert, camels in the jungle, and over 1,000 animals to 200 people (now habitat-bound and budgeted).

## 6. How I worked with Claude

- **Long, multi-part prompts.** I usually wrote one prompt listing everything I'd noticed while play-testing, often with screenshots. Then I asked Claude to split the work across sub-agents ("Sepearte the task to sub-agents", "use multi agents to make the task go faster").
- **Review skills to find work, then I chose.** I used `/frontend-design`, `/feature-dev` and `/design` to get reviews and plans. Then I picked from the options Claude gave (all four bundles, the gentle storyteller, route 2, and so on).
- **Claude merged the parallel work.** Sub-agent and side-session work landed on worktree branches, and Claude merged and re-tested it: syntax checks, multi-seed headless 60–160-year runs, the save/load parity test, and browser frame-rate checks.
- **Claude kept the docs current.** It updated `CLAUDE.md` as rules emerged, for example "fields starting with `_` are render caches and never saved".

## 7. Where it stands and what's next

**State as of 2026-10-21 (`c69d290`; `main` and `ai-chronicler` match on GitHub):**
- 21 source files in `src/`, about 9,750 lines of JS. There are still no dependencies.
- **Seven starting peoples** (humans, elves, dwarves, orcs, gnomes, goblins, saurians), plus monolith-uplifted animal peoples.
- **Simulation:** eight tech eras, generals, villages, revolts, great beasts with kingdom hunts, the storyteller, and seeded worlds with exact save/load.
- **God tools:** six power tabs plus the Divine hand.
- **AI:** chronicles from Claude, available headless or on the live page, and a kingdom that Claude can rule through a local bridge.

**Known gaps:**
- At 9× in late-game worlds the sim runs below its nominal speed, and mid zoom is about 35 fps at 9×.
- In seeded tests, rebellions came out slightly above the 1–3 per 160 years target.
- The ruler bridge was only tested from the local server. The browser's local-network permission prompt on the GitHub Pages site was never checked.
- Leftover worktree branches (`worktree-agent-*`, `seasons-in-year` and others) are merged but not deleted.
- The "Next" section of `tools/chronicler/LOG.md` is still empty.

**Ideas still open from the original backlog and the review:**
- race-specific music;
- a fuller trade and caravan system;
- following a person's whole life story (so far it only follows the child after a death);
- more starting kingdoms or a world-size option;
- goals/feats;
- a world postcard.
