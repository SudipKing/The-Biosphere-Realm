# Artifact 3 build log: The Chronicler

Notes kept while building. Newest at the bottom. Raw logs of every model call are in `runs/`.

## 2026-10-20

- **Shape chosen:** a headless `claude -p` step in a pipeline. The game is a static page with no network calls, and the API costs money, so the model runs beside the game and talks to it through save files.
- **Model's job, kept small:** given one kingdom's fact sheet, write 3–6 verses and cite the event ids each verse uses. Everything else is code.
- **Headless world:** `make-save.js` loads the sim scripts into a Node `vm` with the DOM stubbed. Its first two runs crashed: `$` was used before it was defined, and the `fld`/`road` arrays were missing. Both were fixed by putting stubs in a prelude that runs before the game files. A 60-year world takes about a minute.
- **Lean calls:** a plain `claude -p` loaded about 27k tokens of context (this repo's CLAUDE.md and the tools). Running it from the temp folder with `--tools ""`, `--setting-sources ""`, `--strict-mcp-config` and a custom system prompt brought that down to about 800 tokens.
- **Run 1 (Sonnet, 8 kingdoms, year 60):** 8 of 8 written. 2 were rejected once: one used the name "Markets" (the facts only say "Great Market") and one used an all-caps "IT". Both passed on retry. *Model problem, caught by code.*
- **Gap found in my code:** the human chronicle wrote years as words ("the year forty-two"), which my `year N` check could not read. *Code problem.* I added a number-word parser and tests, and the prompt now asks for digits.
- **Prose was a list:** the first version retold every event in order. I added "choose the events that matter most… do not list every event" to the prompt, and run 2 reads like a story.
- **Run 2:** 8 of 8 written. 1 retry, for "Ghorak'". That was *my code's fault*: the name check normalised `Ghorak's` but not `Ghorak'`. Fixed, with a test.
- **In game:** the chronicle shows on the Codex History tab, survives a re-save from the game, and a malformed chronicle in a save is dropped on load instead of breaking it.

## 2026-10-21

- **Goal:** make it usable from the GitHub Pages build. A static page can't run `claude -p` or call an API, so the browser version keeps the model step with the player: copy the prompt into Claude, paste the reply back.
- **One set of rules:** moved the prompt, fact sheet and validator into `src/chronicle.js`. The game loads it as a script and Node requires it, so the in-game check and the pipeline check can never disagree. All 13 tests still pass on the shared code.
- **Frozen facts:** the world keeps running while you're off in Claude, and new events would renumber the event ids. So the game freezes the fact sheet when you press Ask, and checks the reply against that frozen copy.
- **Tested in the browser:** a reply with an invented queen, a fake year and a bogus citation was rejected with 4 readable errors, and the copy button switched to a retry prompt. A real Claude reply from run 2 passed, was kept, and survived save and load. The single-file build loads with no errors.

## 2026-10-21 (later): Claude rules a kingdom

- **Shape:** Claude now plays a part in the game itself. A local bridge (`tools/ruler-bridge`) wraps `claude -p`. Every 3 years a kingdom set to "Let Claude rule" sends a situation report, and Claude picks one move and writes a decree. I chose this over the paid API because it uses my Claude Code access.
- **Kept small:** the model only picks from 7 moves and writes up to 240 characters. The code builds the report, checks legality twice (against the report, then against the live world, because the world moves while Claude thinks), applies the move with the game's own functions, and logs it.
- **Security:** a server on localhost could be called by any website, so the bridge only accepts situation reports (it builds the prompt itself), allows only localhost and my GitHub Pages origin, and listens on 127.0.0.1. Tested: another origin gets 403, and a free-form prompt is rejected.
- **Live test:** Faeithil (elves, contemplative faith, just out of a war) chose `patronize_arts` with an elvish decree, and the code made a new poem right away. Mukden (goblins at war with Northhaven, full granaries) chose `found_village`, then `patronize_arts`. Both moves suit their situations. With the bridge stopped, the Codex says to start it and the game carries on.
- 11 offline tests cover the checks (illegal war, peace or alliance moves, unknown targets, invented names in decrees, and the bridge refusing non-reports).

## Next

- (your notes here)
