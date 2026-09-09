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
  hero/egypt-hero-<width>.<hash>.webp
  destinations/<slug>-hero-<width>.<hash>.webp …
  experiences/<name>-<width>.<hash>.webp
  journeys/<slug>-<width>.<hash>.webp
```

Every filename carries a hash of its own bytes, which is what makes the
year-long immutable cache header safe: replacing a photograph changes its URL,
so no browser can keep serving the old one. Nothing references these files by
convention; `src/generated/images.ts` holds the real URLs, and the build script
also rewrites the hero preload header in `vercel.json`.

To change a photograph, edit its entry in `sources.json`, delete the matching
file in `.cache/images`, and run the script again. Attribution is required for
the CC BY and CC BY-SA images and is rendered on hero images by `SmartImage`.
