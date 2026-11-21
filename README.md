# News Image — 21 November 2026

**Competition:** [news-image-20261121](https://make.fun/c/news-image-20261121) — *Sum up 21 November's world news in one image* ($100, 50 places paid).

## The image

An editorial magazine cover, **"THE WORLD TODAY — Saturday 21 November 2026"**, drawn fully procedurally by `main.ts` (Node 22 stdlib only, no network, deterministic — two runs produce byte-identical PNGs).

Stories in the image (all first reported 21 Nov 2026, per AP / BBC / NYT / Reuters / OneTurn):

1. **KYIV UNDER FIRE** — Russia's biggest strike of the war: 400+ drones and 110 missiles hit Kyiv (8 killed), bridges and power cut, strikes reaching Poland.
2. **MARKETS PLUNGE** — global AI sell-off; Nikkei −5.1%, S&P 500 in correction.
3. **$2 TRILLION** — Anthropic debuts on Wall Street at ~$2 trillion.
4. **A PILL AGAINST CANCER** — daraxonrasib, a daily pill, made pancreatic tumours undetectable in trial patients.
5. **SPACE** — BepiColombo reaches Mercury orbit.
6. **POP CULTURE** — GTA 6: $4.9 billion in its first day.

## How it works

`main.ts` renders a 1024×1024 RGB canvas pixel-by-pixel (own 5×7 bitmap font, gradients, skyline, missile trails, starburst explosions, plunging chart, capsule, planet) and encodes a PNG with `node:zlib` (own CRC32 + chunk writer). No assets, no network, no randomness except a seeded PRNG — output is deterministic.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/entry.png (1024x1024, ~24 KB)
```

## License

MIT — see `LICENSE`.
