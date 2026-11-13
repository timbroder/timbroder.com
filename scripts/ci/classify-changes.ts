/**
 * Decides whether a change touches code or only content.
 *
 * Content-only changes (a new post, an image) skip the test suite in CI; the
 * site build itself still validates them.
 *
 *   git diff --name-only BASE HEAD | node scripts/ci/classify-changes.ts
 *
 * Prints `code=true` or `code=false`, ready for $GITHUB_OUTPUT.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Paths that count as content. Everything else is code. */
export const CONTENT_PREFIXES = ['content/', 'public/images/'];

export function isContentPath(path: string): boolean {
  return CONTENT_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * True when every changed path is content. An empty list is treated as a
 * code change, so a diff we failed to compute never skips the tests.
 */
export function isContentOnly(paths: string[]): boolean {
  const changed = paths.map((p) => p.trim()).filter(Boolean);
  return changed.length > 0 && changed.every(isContentPath);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = readFileSync(0, 'utf8').split('\n');
  console.log(`code=${!isContentOnly(paths)}`);
}
