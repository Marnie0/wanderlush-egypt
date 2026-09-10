/**
 * The Arabic side of every content string, loaded on demand.
 *
 * `scripts/vite-content-split.ts` rewrites each `{ en, ar }` pair in the
 * content files into a `pairsOf` call whose `ar` reads from here, and emits
 * the Arabic strings as a chunk of their own. `loadArabicContent` fetches that
 * chunk; `src/i18n` calls it alongside the Arabic locale, before anything
 * renders in Arabic. Until the table is here a pair answers with its
 * English string, never with nothing.
 *
 * Outside Vite (the seed script, the API) the content files are untouched
 * and this module is never imported.
 */

type Text = string | string[];

let table: Record<string, Text[]> | null = null;

/**
 * A pair factory for one content file. The object it returns is a plain
 * `{ en, ar }` with `ar` as a getter, so spreading, JSON and `pick` all see
 * both languages once the table is loaded.
 */
export function pairsOf(file: string) {
  return <T extends Text>(en: T, index: number): { en: T; readonly ar: T } => ({
    en,
    get ar() {
      return (table?.[file]?.[index] as T | undefined) ?? en;
    },
  });
}

export async function loadArabicContent(): Promise<void> {
  if (table) return;
  table = (await import("virtual:content-ar")).default;
}
