import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

/**
 * Keeps the Arabic side of the content out of the main bundle.
 *
 * Every content file is written once, with `{ en, ar }` pairs, and stays
 * that way: the seed script and the API read the source as it is. For the
 * browser this plugin rewrites each pair into a call that keeps the English
 * string inline and reads the Arabic one from a table that ships as a chunk
 * of its own (`virtual:content-ar`), fetched with the Arabic locale before the
 * first paint for an Arabic visitor and on the first switch for anyone
 * else. An English visitor never downloads a word of Arabic, and a pair
 * read before its table arrives falls back to the English string rather
 * than to nothing.
 *
 * The table and the getters index the pairs in source order, and both are
 * produced by the same walk over the same file, so they cannot drift.
 */

const CONTENT_DIR = fileURLToPath(new URL("../content/", import.meta.url));
const FILES = ["accommodation", "brand", "currencies", "destinations", "experiences", "faqs", "journeys", "reviews", "transport"];
const VIRTUAL_ID = "virtual:content-ar";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

type Text = string | string[];

interface Pair {
  start: number;
  end: number;
  /** The `en` value exactly as written, so escapes and quotes survive. */
  enSource: string;
  ar: Text;
}

function literalText(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function literalValue(node: ts.Expression): Text | null {
  const single = literalText(node);
  if (single !== null) return single;
  if (ts.isArrayLiteralExpression(node)) {
    const items = node.elements.map(literalText);
    if (items.every((item) => item !== null)) return items as string[];
  }
  return null;
}

function property(node: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | undefined {
  return node.properties.find(
    (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === name,
  );
}

/** Every `{ en: literal, ar: literal }` in the file, in source order. */
export function extractPairs(source: string, fileName: string): Pair[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const pairs: Pair[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node) && node.properties.length === 2) {
      const en = property(node, "en");
      const ar = property(node, "ar");
      if (en && ar) {
        const enValue = literalValue(en.initializer);
        const arValue = literalValue(ar.initializer);
        if (enValue !== null && arValue !== null && Array.isArray(enValue) === Array.isArray(arValue)) {
          pairs.push({ start: node.getStart(file), end: node.getEnd(), enSource: en.initializer.getText(file), ar: arValue });
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return pairs;
}

function contentKey(id: string): string | null {
  const match = /[\\/]content[\\/]([a-z-]+)\.ts(?:\?.*)?$/.exec(id);
  return match && FILES.includes(match[1]) ? match[1] : null;
}

export function contentSplit(): Plugin {
  return {
    name: "wanderlush-content-split",
    enforce: "pre",
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const table: Record<string, Text[]> = {};
      for (const key of FILES) {
        const path = join(CONTENT_DIR, `${key}.ts`);
        table[key] = extractPairs(readFileSync(path, "utf8"), path).map((pair) => pair.ar);
      }
      return `export default ${JSON.stringify(table)};`;
    },
    transform(code, id) {
      const key = contentKey(id);
      if (!key) return;
      const pairs = extractPairs(code, id);
      if (pairs.length === 0) return;
      let out = "";
      let cursor = 0;
      pairs.forEach((pair, index) => {
        out += code.slice(cursor, pair.start);
        out += `__wlPair(${pair.enSource}, ${index})`;
        cursor = pair.end;
      });
      out += code.slice(cursor);
      const prelude = `import { pairsOf as __wlPairs } from "./ar-text";\nconst __wlPair = __wlPairs(${JSON.stringify(key)});\n`;
      return { code: prelude + out, map: null };
    },
    handleHotUpdate({ file, server }) {
      // The getters index into the table by position, so an edited content
      // file needs a fresh table and a page that reads it from the start.
      if (!contentKey(file)) return;
      const table = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (table) server.moduleGraph.invalidateModule(table);
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
