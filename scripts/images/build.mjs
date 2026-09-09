/**
 * Image pipeline.
 *
 *   node scripts/images/build.mjs
 *
 * Reads the curated selection in `sources.json`, downloads each original from
 * Wikimedia Commons into a local cache, and writes:
 *
 *   public/images/<slot>-<width>.<hash>.webp   responsive variants
 *   public/images/CREDITS.md                  attribution for every photograph
 *   src/generated/images.ts                   manifest, LQIP and credits
 *
 * Filenames carry a hash of their own bytes. That is what makes the year-long
 * immutable cache header safe: swapping a photograph changes its URL, so no
 * browser can hold on to the old one.
 *
 * The download cache means re-running is cheap; delete `.cache/images` to
 * refetch the originals.
 */
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sources = JSON.parse(readFileSync(join(root, "scripts/images/sources.json"), "utf8"));
const cacheDir = join(root, ".cache/images");
const outDir = join(root, "public/images");
const UA = "WanderlushEgypt-portfolio/1.0 (portfolio project)";

/** Heroes are shown full-bleed; everything else tops out at card width. */
const HERO = /(^hero\/|-hero$)/;
const HERO_WIDTHS = [640, 1024, 1600, 2400];
const CARD_WIDTHS = [480, 800, 1200];

mkdirSync(cacheDir, { recursive: true });

// Rendered output is disposable and hashed, so it is rebuilt from scratch
// into a staging directory and swapped in only once every slot has rendered.
// Clearing first would leave the site without pictures if one download of a
// hundred and thirty failed halfway.
const stageDir = join(root, ".cache/images-stage");
rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(slot, urls) {
  const file = join(cacheDir, slot.replaceAll("/", "__") + ".src");
  if (existsSync(file)) return file;
  // Commons only serves a fixed set of thumbnail widths per file, so fall
  // back through smaller renders and finally the original upload. It also
  // rate-limits a cold cache fetching a hundred files, so back off on 429
  // rather than losing the whole run to one refusal.
  let lastError;
  for (const url of urls) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (res.status === 429) throw Object.assign(new Error("429"), { retry: true });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        writeFileSync(file, Buffer.from(await res.arrayBuffer()));
        await sleep(250);
        return file;
      } catch (error) {
        lastError = error;
        if (!error.retry) break;
        await sleep(3000 * (attempt + 1));
      }
    }
  }
  throw new Error(`${slot}: ${lastError?.message ?? "download failed"}`);
}

const manifest = {};
const credits = [];
const entries = Object.entries(sources);

for (const [slot, meta] of entries) {
  const src = await download(meta.alias_of ?? slot, meta.download);
  const image = sharp(src, { failOn: "none" }).rotate();
  const { width: srcW, height: srcH } = await image.metadata();
  const widths = (HERO.test(slot) ? HERO_WIDTHS : CARD_WIDTHS).filter((w) => w <= srcW);
  if (widths.length === 0) widths.push(srcW);

  mkdirSync(join(stageDir, dirname(slot)), { recursive: true });
  const variants = [];
  for (const w of widths) {
    const buffer = await sharp(src, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: w >= 2000 ? 66 : w >= 1600 ? 72 : 78, effort: 5 })
      .toBuffer();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
    const file = `${slot}-${w}.${hash}.webp`;
    writeFileSync(join(stageDir, file), buffer);
    variants.push({ width: w, url: `/images/${file}` });
  }

  // 20px wide blurred placeholder, inlined as a data URI in the manifest.
  const lqipBuf = await sharp(src, { failOn: "none" })
    .rotate()
    .resize({ width: 20 })
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer();

  manifest[`/images/${slot}.webp`] = {
    sources: variants,
    width: srcW,
    height: srcH,
    lqip: `data:image/webp;base64,${lqipBuf.toString("base64")}`,
    credit: {
      artist: meta.artist,
      license: meta.license,
      source: meta.source,
    },
  };

  credits.push(
    `| ${slot} | [${meta.title.replace("File:", "")}](${meta.source}) | ${meta.artist} | ${meta.license} |`,
  );
  process.stdout.write(`${slot} (${widths.join("/")})\n`);
}

for (const dir of ["hero", "destinations", "experiences", "journeys"]) {
  rmSync(join(outDir, dir), { recursive: true, force: true });
  if (existsSync(join(stageDir, dir))) renameSync(join(stageDir, dir), join(outDir, dir));
}
rmSync(stageDir, { recursive: true, force: true });

const header = `# Photography credits

Every photograph on this site comes from Wikimedia Commons and is used under the
licence shown. Attribution is required for the CC BY and CC BY-SA images.

| Slot | File | Photographer | Licence |
| --- | --- | --- | --- |`;
writeFileSync(join(outDir, "CREDITS.md"), `${header}\n${credits.sort().join("\n")}\n`);

mkdirSync(join(root, "src/generated"), { recursive: true });
writeFileSync(
  join(root, "src/generated/images.ts"),
  `// Generated by scripts/images/build.mjs. Do not edit by hand.\n\n` +
    `export interface ImageManifestEntry {\n` +
    `  /** Rendered variants, ascending by width, with hashed URLs. */\n` +
    `  sources: { width: number; url: string }[];\n` +
    `  /** Intrinsic size of the source, used to reserve layout space. */\n` +
    `  width: number;\n  height: number;\n` +
    `  /** 20px blurred placeholder shown until the real file decodes. */\n  lqip: string;\n` +
    `  /** Attribution, required by the CC BY and CC BY-SA licences. */\n` +
    `  credit: { artist: string; license: string; source: string };\n}\n\n` +
    `export const imageManifest: Record<string, ImageManifestEntry> = ${JSON.stringify(manifest, null, 2)};\n`,
);

// The homepage preload header in vercel.json names the hero by URL, so it has
// to be rewritten whenever the hash changes.
const heroSources = manifest["/images/hero/egypt-hero.webp"]?.sources ?? [];
if (heroSources.length > 0) {
  const vercelPath = join(root, "vercel.json");
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const header = vercel.headers?.find((h) => h.source === "/");
  if (header) {
    const srcset = heroSources.map((s) => `${s.url} ${s.width}w`).join(", ");
    const fallback = heroSources.find((s) => s.width === 1600) ?? heroSources.at(-1);
    header.headers = [{
      key: "Link",
      value: `<${fallback.url}>; rel=preload; as=image; imagesrcset="${srcset}"; imagesizes="100vw"`,
    }];
    writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
    console.log("vercel.json hero preload updated");
  }
}

console.log(`\n${entries.length} images, manifest written`);
