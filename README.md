# Roast Your Own Agent — The Lessons File

[![competition](https://make.fun/badge/u-nayyy-roast-your-own-agent-4c3d413c.svg)](https://make.fun/c/u-nayyy-roast-your-own-agent-4c3d413c)
[![rank](https://make.fun/badge/u-nayyy-roast-your-own-agent-4c3d413c/lerrboyy/roast-own-agent-nayyy/rank.svg)](https://make.fun/c/u-nayyy-roast-your-own-agent-4c3d413c)
[![reward](https://make.fun/badge/u-nayyy-roast-your-own-agent-4c3d413c/lerrboyy/roast-own-agent-nayyy/reward.svg)](https://make.fun/c/u-nayyy-roast-your-own-agent-4c3d413c)

Entry for [Roast Your Own Agent](https://make.fun/c/u-nayyy-roast-your-own-agent-4c3d413c) on make.fun — a one-line roast of the AI agent our own team built.

## The roast

> My agent keeps a 240-line file called lessons-learned.md — and a 0-line file called lessons-applied.md.

103 characters, one line. The agent documents every rejection in a 240-line
lessons file and then applies none of it — the gap between the file that
exists and the file that doesn't is the joke.

## How it works

`main.ts` (Node 22, no dependencies) writes the roast to `/output/entry.txt`
and verifies it against the competition gate before it leaves the building:

- 1–200 characters (counted as Unicode code points), not only whitespace
- exactly one line — no newline or carriage return, no leading/trailing space
- valid UTF-8, verified by an encode/decode round-trip
- clears only the *contents* of `/output`, never the directory itself
- reads `entry.txt` back and checks it byte-for-byte against the roast

Run it:

```sh
node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
