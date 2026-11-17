import { describe, expect, it } from 'vitest';
import {
  isContentOnly,
  isContentPath,
} from '../../scripts/ci/classify-changes.ts';

describe('isContentPath', () => {
  it.each([
    'content/blog/2026-11-11-kobo-audiobook-sync.md',
    'content/pages/talks.markdown',
    'content/blog/images/2015/03/5.jpeg',
    'public/images/remote/example.png',
  ])('%s is content', (path) => {
    expect(isContentPath(path)).toBe(true);
  });

  it.each([
    'src/components/PostCard.astro',
    'package.json',
    'tests/fixtures/cutover.json',
    'public/robots.txt',
    'contentful/loader.ts',
    'MIGRATION_PLAN.md',
    '.github/workflows/ci.yml',
  ])('%s is code', (path) => {
    expect(isContentPath(path)).toBe(false);
  });
});

describe('isContentOnly', () => {
  it('is true when every path is content', () => {
    expect(
      isContentOnly([
        'content/blog/new-post.md',
        'public/images/new-post/photo.jpg',
      ]),
    ).toBe(true);
  });

  it('is false when any path is code', () => {
    expect(isContentOnly(['content/blog/new-post.md', 'package.json'])).toBe(
      false,
    );
  });

  it('ignores blank lines', () => {
    expect(isContentOnly(['content/blog/new-post.md', '', '  '])).toBe(true);
  });

  it('treats an empty change list as code, so tests still run', () => {
    expect(isContentOnly([])).toBe(false);
    expect(isContentOnly([''])).toBe(false);
  });
});
