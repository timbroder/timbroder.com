import { describe, expect, it } from 'vitest';
import { excerpt, plainText, prune } from '../../src/lib/excerpt.ts';

describe('plainText', () => {
  it('joins paragraphs with a single space', () => {
    expect(plainText('<p>One.</p>\n<p>Two.</p>')).toBe('One. Two.');
  });

  it('keeps the text of links and emphasis', () => {
    expect(plainText('<p>Use <a href="/x">this <em>link</em></a> now.</p>')).toBe(
      'Use this link now.',
    );
  });

  it('leaves out inline code', () => {
    expect(plainText('<p>Run <code>npm test</code> first.</p>')).toBe('Run  first.');
  });

  it('leaves out code blocks', () => {
    expect(plainText('<p>Before</p>\n<pre><code>const a = 1</code></pre>\n<p>After</p>')).toBe(
      'Before After',
    );
  });

  it('uses the alt text of an image hosted elsewhere, but not of a local one', () => {
    expect(
      plainText('<p><img src="https://example.com/a.png" alt="A chart"> shows it.</p>'),
    ).toBe('A chart shows it.');
    expect(plainText('<p><img src="/images/a.png" alt="A chart"> shows it.</p>')).toBe(
      'shows it.',
    );
  });

  it('treats an old image copied from another host as it did when it was remote', () => {
    expect(
      plainText('<p><img src="/images/remote/2008-06-20-social-badges/picasa.png" alt="Picasa"> x</p>'),
    ).toBe('Picasa x');
    expect(plainText('<p><img src="/images/missing-image.svg" alt="A chart"> x</p>')).toBe(
      'A chart x',
    );
  });

  it('counts headings, table cells and line breaks as separators', () => {
    expect(plainText('<h2>Title</h2>\n<p>a<br>b</p>')).toBe('Title a b');
    expect(plainText('<table><tr><td>x</td><td>y</td></tr></table>')).toBe('x y');
  });

  it('separates list items, with or without paragraphs inside', () => {
    expect(plainText('<ul>\n<li>one</li>\n<li>two</li>\n</ul>')).toBe('one two');
    expect(plainText('<ul>\n<li>\n<p>one</p>\n</li>\n<li>\n<p>two</p>\n</li>\n</ul>')).toBe(
      'one two',
    );
  });

  it('separates a list item from the text before it even when it holds a nested list', () => {
    const text = plainText(
      '<p>All set.</p>\n<ul>\n<li><a href="/x">First</a> item\n<ul>\n<li>nested</li>\n</ul>\n</li>\n</ul>',
    );
    expect(text.replace(/\s+/g, ' ')).toBe('All set. First item nested');
  });

  it('leaves out a block of raw HTML but keeps the text of an inline tag', () => {
    expect(plainText('<p>Watch:</p>\n<div class="video">embed text</div>\n<p>Done.</p>')).toBe(
      'Watch: Done.',
    );
    expect(plainText('<p>A <b>bold</b> claim.</p>')).toBe('A bold claim.');
  });

  it('leaves out scripts', () => {
    expect(plainText('<p>Hi</p><script>alert(1)</script>')).toBe('Hi');
  });
});

describe('prune', () => {
  it('returns short text unchanged', () => {
    expect(prune('Hello, world', 50)).toBe('Hello, world');
  });

  it('cuts at a word boundary and adds an ellipsis', () => {
    expect(prune('Hello, world', 5)).toBe('Hello…');
    expect(prune('Hello, world', 8)).toBe('Hello…');
    expect(prune('Hello, cruel world', 15)).toBe('Hello, cruel…');
  });

  it('gives up when the cut text would be no shorter', () => {
    expect(prune('Hello, world', 5, ' (read a lot more)')).toBe('Hello, world');
  });
});

describe('excerpt', () => {
  it('cuts long posts to about 512 characters', () => {
    const html = `<p>${'word '.repeat(200)}</p>`;
    const text = excerpt(html);
    expect(text.length).toBeLessThanOrEqual(513);
    expect(text.endsWith('word…')).toBe(true);
  });
});
