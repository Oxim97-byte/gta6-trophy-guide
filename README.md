# Leonida Trophy Guide — GTA VI · All 55 PS5 Trophies

[![GTA 6 trophy guide bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Oxim97-byte/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Oxim97-byte/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies on PlayStation 5** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden. Built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Tracker** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Roadmap to the Platinum** — six stages in order, from the story to the 100% checklist, with the warnings that matter (including the one possibly missable trophy in Chapter 1).
- **Missable flags** — Positive Mental Attitude is flagged, with the exact Chapter 1 step that may be missable.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, by text search, and hide-earned.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until they are earned.
- **Cited guides** — every trophy has a guide written for this page, in our own words, naming its sources beside it. Official trophy names and descriptions are shown as PlayStation publishes them. No Rockstar Games logo, artwork or game screenshot is used anywhere.

## Run it

Static files, no build step, no network use:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its root.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the official 55 trophies (name, description, grade) plus our guides, kinds, missable flags, roadmap stages and sources.
- `app/data/roadmap.json` — the six roadmap stages and the 35-item 100% checklist.
- `screenshots/` — 4 screenshots of the guide running in a browser (see `shots.json`).
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
