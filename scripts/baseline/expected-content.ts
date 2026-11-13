/**
 * Writes tests/lib/expected-content.json: the posts in which raw markdown
 * now renders, and the posts in which wrapped lines stay in their list item
 * or quote.
 *
 *   npm run build && node scripts/baseline/expected-content.ts
 *
 * It records what the build does; it does not judge it. Read what it says
 * has changed before committing the file. Differences of any other kind
 * are printed and are for a person to resolve: fix the post, or add it to
 * REPAIRED_BODIES in tests/lib/expected-content.ts with the reason.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadPages } from '../../tests/lib/baseline.ts';
import { compareBodies, type ImageChanges } from '../../tests/lib/compare-body.ts';
import { newUrlOf, readPage } from '../../tests/lib/dist.ts';
import { loadImageSources } from '../../tests/lib/image-sources.ts';

const FILE = 'tests/lib/expected-content.json';
// Read as text, so this works before the file exists.
const repaired = [
  ...readFileSync('tests/lib/expected-content.ts', 'utf8').matchAll(/^  '([^']+\/)':\s*$/gm),
].map((match) => match[1]);

const sources = loadImageSources();
const images: ImageChanges = {
  removed: new Set(sources.filter((s) => s.source === 'removed').map((s) => s.original)),
  removedLinks: new Set(sources.flatMap((s) => s.links ?? [])),
  replaced: new Set(sources.filter((s) => s.local).map((s) => s.original)),
};

const nowRendered: string[] = [];
const wrappedLines: Record<string, number> = {};
let problems = 0;
for (const page of loadPages().filter((p) => p.post)) {
  if (repaired.some((ending) => page.url.endsWith(ending))) continue;
  const url = newUrlOf(page.url);
  const now = url ? readPage(url).post?.body : undefined;
  if (!now) {
    console.log(`${page.url}\n    missing from the build`);
    problems += 1;
    continue;
  }
  const result = compareBodies(page.post!.body, now, images);
  if (result.problems.length) {
    console.log(`${page.url}\n    ${result.problems.join('\n    ')}`);
    problems += 1;
  }
  if (result.nowRendered) nowRendered.push(page.url);
  else if (result.wrappedLines) wrappedLines[page.url] = result.wrappedLines;
}

const before = existsSync(FILE) ? readFileSync(FILE, 'utf8') : '';
const after = `${JSON.stringify({ nowRendered: nowRendered.sort(), wrappedLines }, null, 1)}\n`;
writeFileSync(FILE, after);
console.log(
  `\n${nowRendered.length} posts where raw markdown now renders; ` +
    `${Object.keys(wrappedLines).length} posts with wrapped lines kept in place. ` +
    `${FILE} ${before === after ? 'is unchanged' : 'was rewritten'}.`,
);
if (problems) {
  console.log(`${problems} posts differ in some other way (listed above).`);
  process.exitCode = 1;
}
