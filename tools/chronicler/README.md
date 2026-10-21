# The Chronicler

Claude writes a short chronicle for each kingdom in a saved world. Plain code decides what Claude gets to see and whether its reply goes into the save. The game then shows the chronicle in the kingdom's Realm Codex, on the History tab.

It runs Claude Code headless (`claude -p`) as one step in a pipeline, so it uses Claude Code access and no paid API key.

```
save.biosphere ──► facts.js ──► claude -p ──► validate.js ──► save-chronicled.biosphere ──► game (Codex › History)
                   (code)       (model)       (code)  │
                                   ▲                  │ rejected: errors go back to the model (up to 3 tries)
                                   └──────────────────┘
```

## Who is responsible for what

| Step | Done by | Responsibility |
| --- | --- | --- |
| Read the save, pick kingdoms with at least 3 recorded events | code (`facts.js`) | Only real data goes in. Each event gets an id (`E1`, `E2`…) so it can be cited. |
| Write the chronicle | **model** (`claude -p`, Sonnet, no tools) | Pick the events that matter, tell them as a story in the people's own voice, and cite the event ids each verse rests on. That is the model's only job. |
| Check the reply | code (`validate.js`) | JSON shape; 3–6 verses of 40–700 characters; plain text only; every verse cites real event ids; verses run oldest to newest; **every name** (a capitalised word that does not start a sentence) appears somewhere in the facts; **every year** (`year 42`, `the year forty-two`, `the forty-second year`) is a year in the facts; at least 3 different events cited. |
| Retry or give up | code (`chronicle.js`) | A rejected reply goes back to the model with the exact list of problems, up to 3 attempts. After that the kingdom is left out, never written half-checked. |
| Store and show | code (`chronicle.js`, `src/save.js`, `src/codex.js`) | Store the chronicle as `T.chronicle` in a copy of the save. The game checks its shape again when it loads and drops a malformed one. It escapes the text and shows it with the year it was written. |

When a chronicle looks wrong, the log tells you whose fault it is. Every attempt is written to `runs/<time>.jsonl` with the raw reply and the validator's verdict. If the reply broke a rule and the validator caught it, the system worked. If the reply was fine and the validator rejected it, the bug is in the code. If the reply was wrong and passed anyway, the validator is missing a check.

What the validator can't catch: a verse that uses only real names and years but gets the meaning wrong (for example, calling a lost war a victory). Catching that would need a second model or a person, which is out of scope.

## Use

```sh
# make a test world without a browser (60 years takes about a minute)
node tools/chronicler/make-save.js myseed 60 world.biosphere

# or save one from the game: World › Save

# write the chronicles (needs Claude Code installed and logged in)
node tools/chronicler/chronicle.js world.biosphere
```

Then load `world-chronicled.biosphere` from the World panel and open any kingdom's **History** tab.

Options: `--kingdom <name|id>` (repeatable), `--fallen` to include fallen kingdoms, `--model <name>` (default `sonnet`), `--out <file>`, `--claude <path>` or `CLAUDE_BIN` when `claude` is not on your PATH, and `--dry-run` to print the prompt without calling the model.

Run the validator tests (no model needed):

```sh
node --test tools/chronicler/validate.test.js
```

## Files

- `chronicle.js`: the pipeline (prompt, `claude -p` call, retry loop, pool of 3 parallel calls, log, write)
- `facts.js`: save to fact sheet, plus the vocabulary used for the name check
- `validate.js`: every rule the model's reply must pass
- `validate.test.js`: offline tests for the validator
- `make-save.js`: grows a world headlessly and writes a `.biosphere` file
- `runs/`: one JSONL log per run (git-ignored)
