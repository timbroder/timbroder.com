/**
 * Applies slug-cleanup.csv to the posts.
 *
 *   node scripts/slugs/apply.ts
 *
 * For each row it finds the post whose Gatsby URL is `old_url`, sets `slug:`
 * to `new_slug` and records `old_url` under `redirect_from:`. It only edits
 * those lines, so the rest of each file is untouched, and it can be run
 * again after editing the CSV.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { legacyPostPath } from '../../src/lib/legacy-url.ts';
import { isCleanSlug } from '../../src/lib/slug.ts';

const DIR = 'content/blog';
// Undated posts were filed under the month of the Gatsby build that the
// baseline captured.
const UNDATED_MONTH = process.env.LEGACY_UNDATED_MONTH ?? '2026/11';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

interface Source {
  file: string;
  text: string;
  /** Start and end of the frontmatter block's content. */
  start: number;
  end: number;
  data: Record<string, unknown>;
}

function load(file: string): Source | null {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/);
  if (!m) return null;
  const start = text.indexOf('\n') + 1;
  return {
    file,
    text,
    start,
    end: start + m[1].length,
    data: (parseYaml(m[1]) as Record<string, unknown>) ?? {},
  };
}

const [header, ...rows] = parseCsv(readFileSync('slug-cleanup.csv', 'utf8'));
const col = (name: string) => header.indexOf(name);
const wanted = new Map(rows.map((r) => [r[col('old_url')], r[col('new_slug')]]));

for (const [oldUrl, slug] of wanted) {
  if (!isCleanSlug(slug)) {
    console.error(`"${slug}" (for ${oldUrl}) is not a clean slug.`);
    process.exit(1);
  }
}

let changed = 0;
const found = new Set<string>();

for (const name of readdirSync(DIR).filter((n) => n.endsWith('.md')).sort()) {
  const source = load(join(DIR, name));
  if (!source) continue;

  // A post that already has redirect_from is found by that; otherwise by the
  // URL Gatsby gave it.
  const recorded = Array.isArray(source.data.redirect_from)
    ? (source.data.redirect_from as string[])
    : [];
  const legacy = legacyPostPath(
    { slug: source.data.slug, date: source.data.date, filePath: name },
    UNDATED_MONTH,
  );
  const oldUrl = recorded.find((url) => wanted.has(url)) ?? (wanted.has(legacy) ? legacy : null);
  if (!oldUrl) continue;
  found.add(oldUrl);

  const slug = wanted.get(oldUrl)!;
  let frontmatter = source.text.slice(source.start, source.end);

  // slug: replace the line, or add one after the title.
  if (/^slug:.*$/m.test(frontmatter)) {
    frontmatter = frontmatter.replace(/^slug:.*$/m, `slug: ${slug}`);
  } else if (/^title:.*$/m.test(frontmatter)) {
    frontmatter = frontmatter.replace(/^(title:.*)$/m, `$1\nslug: ${slug}`);
  } else {
    frontmatter = `slug: ${slug}\n${frontmatter}`;
  }

  // redirect_from: add the old URL once. JSON quoting is valid YAML and
  // copes with every character these URLs contain.
  if (!recorded.includes(oldUrl)) {
    const item = `  - ${JSON.stringify(oldUrl)}`;
    frontmatter = /^redirect_from:[ \t]*$/m.test(frontmatter)
      ? frontmatter.replace(/^redirect_from:[ \t]*$/m, `redirect_from:\n${item}`)
      : `${frontmatter}\nredirect_from:\n${item}`;
  }

  const next = source.text.slice(0, source.start) + frontmatter + source.text.slice(source.end);
  if (next !== source.text) {
    writeFileSync(source.file, next);
    changed++;
  }
}

const missing = [...wanted.keys()].filter((url) => !found.has(url));
console.log(`${found.size} of ${wanted.size} rows matched a post; ${changed} files changed`);
if (missing.length) {
  console.error(`No post found for:\n${missing.map((u) => `  ${u}`).join('\n')}`);
  process.exit(1);
}
