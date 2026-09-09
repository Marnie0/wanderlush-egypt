# Photography

Drop image files here using the exact paths referenced in `content/`. Until a
file exists, `SmartImage` renders a gradient placeholder built from the item's
accent colour, so no layout breaks and no request 404s in a way that hurts.

Expected structure:

```
public/images/
  hero/egypt-hero.jpg
  destinations/<slug>-hero.jpg, <slug>-01.jpg …
  experiences/<name>.jpg
  journeys/<slug>.jpg
```

Guidance: landscape 3:2 or 16:9, at least 2000px wide for heroes, warm and
cinematic, people small in frame. Compress to WebP or AVIF before committing.
Record the photographer in the content module's `credit` field when one applies.
