/**
 * Compares rendered post bodies in a build against the baseline.
 *
 *   node scripts/spike/compare-bodies.ts dist [--show N] [--only field]
 *
 * Used in stage 2 to choose a markdown processor (plan proof P2). Stage 5
 * turns this comparison into a real test.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPages } from '../../tests/lib/baseline.ts';
import { extractPage, type BodyFacts } from '../../tests/lib/extract.ts';

const args = process.argv.slice(2);
const dist = args[0] ?? 'dist';
const show = Number(args[args.indexOf('--show') + 1] || 0) || 3;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

type Field = 'text' | 'headings' | 'links' | 'images' | 'code' | 'counts';
const FIELDS: Field[] = ['text', 'headings', 'links', 'images', 'code', 'counts'];

const baseline = loadPages().filter((p) => p.post);
const diffs: Record<Field, { url: string; a: string; b: string }[]> = {
  text: [], headings: [], links: [], images: [], code: [], counts: [],
};
const missing: string[] = [];
let same = 0;

function firstDifference(a: string, b: string): [string, string] {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 40);
  return [a.slice(from, i + 80), b.slice(from, i + 80)];
}

for (const page of baseline) {
  const file = join(dist, page.url, 'index.html');
  if (!existsSync(file)) {
    missing.push(page.url);
    continue;
  }
  const built = extractPage(page.url, readFileSync(file, 'utf8')).post;
  if (!built) {
    missing.push(`${page.url} (no article body)`);
    continue;
  }
  const a: BodyFacts = page.post!.body;
  const b: BodyFacts = built.body;
  let equal = true;
  for (const field of FIELDS) {
    const left = field === 'text' ? a.text : JSON.stringify(a[field]);
    const right = field === 'text' ? b.text : JSON.stringify(b[field]);
    if (left !== right) {
      equal = false;
      const [x, y] = firstDifference(left, right);
      diffs[field].push({ url: page.url, a: x, b: y });
    }
  }
  if (equal) same++;
}

console.log(`build: ${dist}`);
console.log(`pages with a body in the baseline: ${baseline.length}`);
console.log(`missing from the build: ${missing.length}`);
for (const url of missing.slice(0, 10)) console.log(`  ${url}`);
console.log(`identical in every field: ${same}`);
for (const field of FIELDS) {
  if (only && only !== field) continue;
  console.log(`\n${field}: ${diffs[field].length} differ`);
  for (const d of diffs[field].slice(0, show)) {
    console.log(`  ${d.url}`);
    console.log(`    live : ${JSON.stringify(d.a)}`);
    console.log(`    built: ${JSON.stringify(d.b)}`);
  }
}
