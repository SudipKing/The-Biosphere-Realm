# Claude on the throne

Hand any kingdom to Claude and it rules that kingdom while the world runs. Every 3 in-game years the kingdom sends Claude a situation report. Claude picks **one** move from a fixed menu and writes a royal decree. Plain code checks the move is legal and applies it with the game's own diplomacy.

The browser can't run Claude, so a tiny bridge on your computer does: it wraps `claude -p` and uses your Claude Code login, with no API key and no extra cost.

```
game (any kingdom with "Let Claude rule" on)
  │  every 3 years: situation report  ──POST /decide──►  bridge (127.0.0.1:8787) ──► claude -p
  │                                                        builds the prompt itself from src/ruler.js
  ◄──────────────── Claude's raw answer ───────────────────┘
  │  code: parse → check against the report → re-check against the world NOW → apply → log the decree
  └─ refused? the reasons go back to Claude once; still wrong, or too late → the kingdom waits this turn
```

## Run it

```sh
node tools/ruler-bridge/bridge.js
```

Then open the game (locally or on GitHub Pages), open a kingdom's **Realm Codex**, and press **👑 Let Claude rule** on the Overview tab. **Ask now** skips the wait for the next turn. Claude's last decrees appear under the button, and every proclamation also goes into the Chronicle and the kingdom's history. Press the button again to take the crown back.

If `claude` isn't on your PATH, set `CLAUDE_BIN` to it or pass `--claude <path>`. Other options: `--model <name>` (default `sonnet`), `--port <n>`, `--allow-origin <url>` to allow another site, and `--allow-file` to allow `index.html` opened straight from disk.

## Who is responsible for what

| Step | Done by | Responsibility |
| --- | --- | --- |
| Situation report | code (`RULER.situation`, `src/ruler.js`) | Population, soldiers, food, stability, villages, every neighbor within reach (war, alliance, faith, strength), the last 8 events and Claude's own last 4 decrees, so it remembers. |
| Prompt | code (bridge + `RULER.prompt`) | The bridge accepts only a situation report and builds the prompt itself, so no page can use it to run other prompts. Only `localhost` and `https://sudipking.github.io` may call it, and it listens on 127.0.0.1 only. |
| Choose a move and write the decree | **model** (`claude -p`, Sonnet, no tools) | One of: `wait`, `declare_war`, `make_peace`, `form_alliance`, `break_alliance`, `found_village`, `patronize_arts`, plus a decree of at most 240 characters in the people's voice. That is the model's only job. |
| Check the move | code (`RULER.checkDecision`) | A real move; a target that is an actual neighbor; no war on an ally or a current enemy; no peace without a war; no alliance with an enemy; no village without people to spare; a plain-text decree that names only kingdoms, gods and people in the report (the same name check as the chronicles). |
| Check again, then act | code (`RULER.turn`, `RULER.apply`) | The world keeps moving while Claude thinks, so the move is checked again against the world as it is right then. It's applied with the game's own `declareWar`, `settle`, `makeArt` and alliance lists, and the decree is logged. |
| Fail safely | code | No bridge, a timeout or a broken answer means the kingdom waits this turn. The game says why, and the simulation never stops. A Claude kingdom does not start random wars or alliances on its own, but other kingdoms can still turn on it. |

Every call the bridge makes is logged to `tools/ruler-bridge/runs/<time>.jsonl` (git-ignored). Refused moves are kept with their reason in the kingdom's decree list, so you can tell a bad move by Claude from a bad check in the code.

## Files

- `../../src/ruler.js`: the menu, prompt, situation report, checks and moves (the game loads it, and the bridge requires its pure half)
- `bridge.js`: the local HTTP bridge (`/health`, `/decide`), with one `claude -p` call at a time
- `../claude.js`: the headless `claude -p` call shared with the chronicler
- `ruler.test.js`: offline tests for the checks (`node --test tools/ruler-bridge/ruler.test.js`)
