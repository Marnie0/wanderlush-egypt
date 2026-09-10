# Fonts embedded in the trip PDF

Static instances of the site's four families, served by Google Fonts and
embedded in the downloadable trip summary (`src/pdf/TripDocument.tsx`). All
four are published under the SIL Open Font License 1.1, which permits
embedding in documents.

| File | Family | Designer / publisher |
| --- | --- | --- |
| `fraunces-400.woff` | Fraunces Regular | Undercase Type |
| `inter-400/500/600.woff` | Inter | Rasmus Andersson |
| `amiri-400/700.woff` | Amiri | Khaled Hosny |
| `plex-arabic-400/500/600.woff` | IBM Plex Sans Arabic | IBM |

The Arabic files carry Latin letters and digits as well, because the
renderer cannot fall back from one family to another glyph by glyph.
