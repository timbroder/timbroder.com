/**
 * Proposes clean slugs for posts whose URL is untidy.
 *
 *   node scripts/slugs/propose.ts
 *
 * Writes slug-cleanup.csv: one row per post that would change, with its old
 * URL and the proposed new slug. Edit the `new_slug` column by hand where a
 * proposal reads badly; the apply step in stage 3 uses whatever the file
 * says.
 */
import { writeFileSync } from 'node:fs';
import { loadPages } from '../../tests/lib/baseline.ts';
import { cleanSlug, isCleanSlug } from '../../src/lib/slug.ts';

const posts = loadPages().filter((p) => p.type === 'post');
const taken = new Map<string, string>(); // new URL -> old URL
const rows: string[][] = [];
const problems: string[] = [];

const csv = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

for (const post of posts) {
  const m = post.url.match(/^\/(\d{4}\/\d{2})\/(.+)\/$/);
  if (!m) continue;
  const [, month, slug] = m;
  const newSlug = isCleanSlug(slug) ? slug : cleanSlug(slug);
  const newUrl = `/${month}/${newSlug}/`;

  const clash = taken.get(newUrl);
  if (clash) problems.push(`${post.url} and ${clash} both become ${newUrl}`);
  taken.set(newUrl, post.url);

  if (newSlug !== slug) {
    rows.push([post.url, newSlug, newUrl, post.chrome.heading ?? '']);
  }
}

rows.sort((a, b) => a[0].localeCompare(b[0]));
const header = ['old_url', 'new_slug', 'new_url', 'title'];
writeFileSync(
  'slug-cleanup.csv',
  `${[header, ...rows].map((row) => row.map(csv).join(',')).join('\n')}\n`,
);

console.log(`${rows.length} of ${posts.length} posts would get a new slug`);
console.log('wrote slug-cleanup.csv');
if (problems.length) {
  console.error(`\n${problems.length} clashes:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
