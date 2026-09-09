# Photography

Images are generated, not hand-placed. The curated selection lives in
`scripts/images/sources.json`, one Wikimedia Commons file per slot with its
photographer and licence.

```bash
node scripts/images/build.mjs
```

This downloads each original into `.cache/images` (gitignored), writes the
responsive WebP variants in this directory, refreshes `CREDITS.md`, and
regenerates `src/generated/images.ts`.

```
public/images/
  hero/egypt-hero-{640,1024,1600,2400}.webp
  destinations/<slug>-hero-*.webp, <slug>-01-*.webp …
  experiences/<name>-{480,800,1200}.webp
  journeys/<slug>-{480,800,1200}.webp
```

To change a photograph, edit its entry in `sources.json`, delete the matching
file in `.cache/images`, and run the script again. Attribution is required for
the CC BY and CC BY-SA images and is rendered on hero images by `SmartImage`.
