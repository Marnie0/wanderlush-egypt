/**
 * Keeps the two locale files honest with each other.
 *
 *   node scripts/check-locales.mjs
 *
 * Every English key must exist in Arabic and vice versa (plural families are
 * compared by their stem, so `days_one` in English matches `days_two` in
 * Arabic). Every Arabic plural family must carry all six CLDR categories, a
 * placeholder used in Arabic must exist in English, and no Arabic string may
 * be identical to its English one unless it is a name or a symbol.
 */
import { readFileSync } from "node:fs";

const load = (file) => JSON.parse(readFileSync(new URL(`../src/i18n/locales/${file}`, import.meta.url), "utf8"));
const flat = (node, prefix = "") =>
  Object.entries(node).flatMap(([key, value]) =>
    typeof value === "object" ? flat(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]],
  );

const CATEGORIES = ["zero", "one", "two", "few", "many", "other"];
const PLURAL = /_(zero|one|two|few|many|other)$/;
const stem = (key) => key.replace(PLURAL, "");
const params = (text) => new Set([...text.matchAll(/{{(\w+)}}/g)].map((m) => m[1]));
// Strings that are legitimately the same in both languages.
const SAME_OK = new Set(["language.english", "language.arabic", "common.listSeparator", "booking.summary.dates"]);

const en = new Map(flat(load("en.json")));
const ar = new Map(flat(load("ar.json")));
const problems = [];

const enStems = new Set([...en.keys()].map(stem));
const arStems = new Set([...ar.keys()].map(stem));
for (const key of enStems) if (!arStems.has(key)) problems.push(`missing in ar: ${key}`);
for (const key of arStems) if (!enStems.has(key)) problems.push(`extra in ar: ${key}`);

const arFamilies = new Map();
for (const key of ar.keys()) {
  const match = PLURAL.exec(key);
  if (match) arFamilies.set(stem(key), [...(arFamilies.get(stem(key)) ?? []), match[1]]);
}
for (const [family, present] of arFamilies) {
  const missing = CATEGORIES.filter((c) => !present.includes(c));
  if (missing.length) problems.push(`ar plural ${family} lacks ${missing.join(", ")}`);
}

const enParams = new Map();
for (const [key, text] of en) {
  const set = enParams.get(stem(key)) ?? new Set();
  for (const p of params(text)) set.add(p);
  enParams.set(stem(key), set);
}
for (const [key, text] of ar) {
  const allowed = enParams.get(stem(key)) ?? new Set();
  for (const p of params(text)) {
    if (p !== "count" && !allowed.has(p)) problems.push(`ar ${key} uses {{${p}}}, which English never passes`);
  }
  const twin = en.get(key) ?? en.get(`${stem(key)}_other`) ?? en.get(`${stem(key)}_one`);
  if (twin !== undefined && twin === text && !SAME_OK.has(key) && /[a-z]{3,}/i.test(text)) {
    problems.push(`ar ${key} is still English: ${text}`);
  }
}

if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log(`locales in step: ${en.size} English strings, ${ar.size} Arabic strings, ${arFamilies.size} Arabic plural families complete`);
