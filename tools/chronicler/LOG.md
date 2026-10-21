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

## Next

- (your notes here)
