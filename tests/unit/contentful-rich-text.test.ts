/** Contentful rich text becomes the same kind of HTML that markdown does. */
import type { Document } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_WIDTH,
  imageAddress,
  renderRichText,
  type RichTextContext,
} from '../../src/lib/contentful/rich-text.ts';
import type { Asset, Entry } from '../../src/lib/contentful/types.ts';
import { ContentError } from '../../src/lib/post-model.ts';

type Mark = 'bold' | 'italic' | 'underline' | 'code' | 'superscript' | 'subscript' | 'strikethrough';

const text = (value: string, ...marks: string[]) => ({
  nodeType: 'text',
  value,
  marks: marks.map((type) => ({ type })),
  data: {},
});
const node = (nodeType: string, content: unknown[] = [], data: object = {}) => ({
  nodeType,
  data,
  content,
});
const p = (...content: unknown[]) =>
  node('paragraph', content.map((child) => (typeof child === 'string' ? text(child) : child)));
const li = (...content: unknown[]) => node('list-item', content);
const target = (linkType: string, id: string) => ({
  target: { sys: { type: 'Link', linkType, id } },
});

const codeBlock = (id: string, fields: Record<string, unknown>): Entry => ({
  sys: { id, type: 'Entry', contentType: { sys: { id: 'codeBlock' } } },
  fields,
});

const picture = (id: string, over: Partial<Asset['fields']> = {}): Asset => ({
  sys: { id, type: 'Asset' },
  fields: {
    title: 'A kettle',
    file: {
      url: `//images.ctfassets.net/space/${id}/hash/kettle.jpg`,
      contentType: 'image/jpeg',
      fileName: 'kettle.jpg',
      details: { size: 1000, image: { width: 800, height: 600 } },
    },
    ...over,
  },
});

const context = (over: Partial<RichTextContext> = {}): RichTextContext => ({
  entries: new Map(),
  assets: new Map(),
  postUrl: () => undefined,
  ...over,
});

const render = (content: unknown[], over: Partial<RichTextContext> = {}) =>
  renderRichText({ nodeType: 'document', data: {}, content } as unknown as Document, context(over));

describe('text', () => {
  it('renders paragraphs and headings as markdown would', async () => {
    expect(
      await render([
        node('heading-2', [text('Why')]),
        p('Because.'),
        node('heading-3', [text('How')]),
        node('hr'),
      ]),
    ).toBe('<h2>Why</h2>\n<p>Because.</p>\n<h3>How</h3>\n<hr>');
  });

  it.each<[Mark, string]>([
    ['bold', '<strong>x</strong>'],
    ['italic', '<em>x</em>'],
    ['underline', '<u>x</u>'],
    ['code', '<code>x</code>'],
    ['superscript', '<sup>x</sup>'],
    ['subscript', '<sub>x</sub>'],
    // The same element markdown uses for ~~struck~~ text.
    ['strikethrough', '<del>x</del>'],
  ])('renders %s', async (mark, html) => {
    expect(await render([p(text('x', mark))])).toBe(`<p>${html}</p>`);
  });

  it('nests several styles the same way whatever order they come in', async () => {
    const expected = '<p><strong><em><code>x</code></em></strong></p>';
    expect(await render([p(text('x', 'bold', 'italic', 'code'))])).toBe(expected);
    expect(await render([p(text('x', 'code', 'italic', 'bold'))])).toBe(expected);
  });

  it('escapes what would otherwise be read as HTML', async () => {
    expect(await render([p('a <b> & "c"')])).toBe('<p>a &lt;b&gt; &amp; "c"</p>');
  });

  it('keeps a line break typed with shift and enter', async () => {
    expect(await render([p('one\ntwo')])).toBe('<p>one<br>two</p>');
  });

  it('drops the empty paragraphs the editor leaves behind', async () => {
    expect(await render([p('one'), p(''), p('  '), p('two'), p('')])).toBe('<p>one</p>\n<p>two</p>');
  });
});

describe('links', () => {
  it('renders a link', async () => {
    const link = node('hyperlink', [text('here')], { uri: 'https://example.com/?a=1&b="2"' });
    expect(await render([p('See ', link, '.')])).toBe(
      '<p>See <a href="https://example.com/?a=1&amp;b=&quot;2&quot;">here</a>.</p>',
    );
  });

  it('links to another post by its address on this site', async () => {
    const link = node('entry-hyperlink', [text('that post')], target('Entry', 'other'));
    const postUrl = (id: string) => (id === 'other' ? '/2026/02/other/' : undefined);
    expect(await render([p(link)], { postUrl })).toBe('<p><a href="/2026/02/other/">that post</a></p>');
  });

  it('refuses a link to an entry that is not a published post', async () => {
    const link = node('entry-hyperlink', [text('that post')], target('Entry', 'draft'));
    await expect(render([p(link)])).rejects.toThrow(
      /links to an entry that is not a published post \(draft\)/,
    );
  });

  it('links to a file', async () => {
    const link = node('asset-hyperlink', [text('the slides')], target('Asset', 'slides'));
    const slides = picture('slides', {
      file: { url: '//assets.ctfassets.net/space/slides/hash/slides.pdf', contentType: 'application/pdf' },
    });
    expect(await render([p(link)], { assets: new Map([['slides', slides]]) })).toBe(
      '<p><a href="https://assets.ctfassets.net/space/slides/hash/slides.pdf">the slides</a></p>',
    );
  });

  it('refuses a link with no address', async () => {
    await expect(render([p(node('hyperlink', [text('here')], {}))])).rejects.toThrow(
      /has a link with no address/,
    );
  });
});

describe('lists, quotes and tables', () => {
  it('renders list items without a paragraph around them, as markdown does', async () => {
    expect(await render([node('unordered-list', [li(p('one')), li(p('two'))])])).toBe(
      '<ul>\n<li>one</li>\n<li>two</li>\n</ul>',
    );
    expect(await render([node('ordered-list', [li(p('one'))])])).toBe('<ol>\n<li>one</li>\n</ol>');
  });

  it('renders a list inside a list item', async () => {
    const inner = node('unordered-list', [li(p('inner'))]);
    expect(await render([node('unordered-list', [li(p('outer'), inner)])])).toBe(
      '<ul>\n<li>outer\n<ul>\n<li>inner</li>\n</ul>\n</li>\n</ul>',
    );
  });

  it('keeps the paragraphs of an item that has several', async () => {
    expect(await render([node('unordered-list', [li(p('one'), p('two'))])])).toBe(
      '<ul>\n<li>\n<p>one</p>\n<p>two</p>\n</li>\n</ul>',
    );
  });

  it('renders a quote', async () => {
    expect(await render([node('blockquote', [p('one'), p('two')])])).toBe(
      '<blockquote>\n<p>one</p>\n<p>two</p>\n</blockquote>',
    );
  });

  it('renders a table, with its rows of header cells as the head', async () => {
    const cell = (type: string, value: string, data: object = {}) => node(type, [p(value)], data);
    const table = node('table', [
      node('table-row', [cell('table-header-cell', 'Tool'), cell('table-header-cell', 'Use')]),
      node('table-row', [cell('table-cell', 'AeroPress', { colspan: 2 })]),
    ]);
    expect(await render([table])).toBe(
      '<table>\n<thead>\n<tr><th>Tool</th><th>Use</th></tr>\n</thead>\n' +
        '<tbody>\n<tr><td colspan="2">AeroPress</td></tr>\n</tbody>\n</table>',
    );
  });
});

describe('pictures and files', () => {
  const embed = (id: string) => node('embedded-asset-block', [], target('Asset', id));

  it('shows a picture with its title as alt text and its size, so the page does not jump', async () => {
    const html = await render([embed('pic')], { assets: new Map([['pic', picture('pic')]]) });
    expect(html).toBe(
      '<figure>\n<img src="https://images.ctfassets.net/space/pic/hash/kettle.jpg" alt="A kettle" ' +
        'width="800" height="600" loading="lazy">\n</figure>',
    );
  });

  it('shows the description as a caption', async () => {
    const asset = picture('pic', { description: 'Heating up <slowly> & steadily' });
    const html = await render([embed('pic')], { assets: new Map([['pic', asset]]) });
    expect(html).toContain('alt="A kettle"');
    expect(html).toContain('<figcaption>Heating up &lt;slowly&gt; &amp; steadily</figcaption>');
  });

  it('escapes the alt text', async () => {
    const asset = picture('pic', { title: 'A "kettle" <on> the stove' });
    const html = await render([embed('pic')], { assets: new Map([['pic', asset]]) });
    expect(html).toContain('alt="A &quot;kettle&quot; &lt;on&gt; the stove"');
  });

  it('asks for a large picture at a sensible width', () => {
    const file = {
      url: '//images.ctfassets.net/space/pic/hash/big.jpg',
      contentType: 'image/jpeg',
      details: { image: { width: 4000, height: 3000 } },
    };
    expect(imageAddress(file)).toEqual({
      src: `https://images.ctfassets.net/space/pic/hash/big.jpg?w=${MAX_IMAGE_WIDTH}`,
      width: MAX_IMAGE_WIDTH,
      height: 1200,
    });
  });

  it('leaves alone the pictures that cannot be resized', () => {
    const details = { image: { width: 4000, height: 3000 } };
    // An animation would lose its movement, and a drawing has no pixels to drop.
    for (const contentType of ['image/gif', 'image/svg+xml']) {
      const file = { url: '//images.ctfassets.net/space/pic/hash/big', contentType, details };
      expect(imageAddress(file)).toEqual({
        src: 'https://images.ctfassets.net/space/pic/hash/big',
        width: 4000,
        height: 3000,
      });
    }
    // Not on Contentful's image server.
    const elsewhere = { url: '/images/big.jpg', contentType: 'image/jpeg', details };
    expect(imageAddress(elsewhere).src).toBe('/images/big.jpg');
  });

  it('links to a file that is not a picture', async () => {
    const pdf = picture('pdf', {
      title: 'Slides from the talk',
      file: { url: '//assets.ctfassets.net/space/pdf/hash/talk.pdf', contentType: 'application/pdf' },
    });
    expect(await render([embed('pdf')], { assets: new Map([['pdf', pdf]]) })).toBe(
      '<p><a href="https://assets.ctfassets.net/space/pdf/hash/talk.pdf">Slides from the talk</a></p>',
    );
  });

  it('refuses a picture that is not published', async () => {
    await expect(render([embed('gone')])).rejects.toThrow(
      /uses a picture or file that is not published \(gone\)/,
    );
  });

  it('refuses an asset with no file', async () => {
    const empty: Asset = { sys: { id: 'empty', type: 'Asset' }, fields: { title: 'Empty' } };
    await expect(render([embed('empty')], { assets: new Map([['empty', empty]]) })).rejects.toThrow(
      /uses the asset "Empty", which has no file/,
    );
  });
});

describe('code blocks', () => {
  const embed = (id: string) => node('embedded-entry-block', [], target('Entry', id));
  const entries = (entry: Entry) => ({ entries: new Map([[entry.sys.id, entry]]) });

  it('highlights a code block the way a markdown code block is', async () => {
    const block = codeBlock('code', { language: 'python', code: 'x = 1\nprint(x)\n' });
    const html = await render([embed('code')], entries(block));
    expect(html).toMatch(
      /^<pre class="astro-code monokai-aa" style="background-color:#272822;color:#F8F8F2; overflow-x: auto;" tabindex="0" data-language="python"><code>/,
    );
    // One span per line, which is what the line numbers count.
    expect(html.match(/<span class="line">/g)?.length).toBe(2);
    // Highlighted: more than one colour.
    expect(new Set(html.match(/color:#[0-9a-fA-F]{6}/g)).size).toBeGreaterThan(2);
  });

  it('accepts a language name in any case', async () => {
    const block = codeBlock('code', { language: 'Bash', code: 'echo hi' });
    expect(await render([embed('code')], entries(block))).toContain('data-language="bash"');
  });

  it('shows a language it does not know, or none, as plain text', async () => {
    for (const language of ['klingon', '', undefined]) {
      const block = codeBlock('code', { language, code: 'a < b' });
      const html = await render([embed('code')], entries(block));
      expect(html).toContain('data-language="plaintext"');
      expect(html).toContain('a &#x3C; b');
    }
  });

  it('leaves the line numbers out when the entry says so', async () => {
    const block = codeBlock('code', { language: 'python', code: 'x = 1', showLineNumbers: false });
    expect(await render([embed('code')], entries(block))).toContain(
      'class="astro-code monokai-aa no-line-numbers"',
    );
  });

  it('shows a code block placed inside a sentence as inline code', async () => {
    const block = codeBlock('code', { code: 'a < b' });
    const inline = node('embedded-entry-inline', [], target('Entry', 'code'));
    expect(await render([p('Use ', inline, '.')], entries(block))).toBe(
      '<p>Use <code>a &lt; b</code>.</p>',
    );
  });

  it('refuses a code block with no code', async () => {
    const block = codeBlock('code', { language: 'python' });
    await expect(render([embed('code')], entries(block))).rejects.toThrow(
      /embeds a code block with no code in it \(code\)/,
    );
  });
});

describe('what the site cannot show', () => {
  const failure = (content: unknown[], over: Partial<RichTextContext> = {}) =>
    render(content, over).catch((error: Error) => error);

  it('refuses an embedded entry that is not published', async () => {
    const error = await failure([node('embedded-entry-block', [], target('Entry', 'gone'))]);
    expect(error).toBeInstanceOf(ContentError);
    expect((error as Error).message).toMatch(/embeds an entry that is not published \(gone\)/);
  });

  it('refuses an embedded entry of a type it does not know', async () => {
    const other: Entry = {
      sys: { id: 'gallery', type: 'Entry', contentType: { sys: { id: 'photoGallery' } } },
      fields: {},
    };
    const error = await failure([node('embedded-entry-block', [], target('Entry', 'gallery'))], {
      entries: new Map([['gallery', other]]),
    });
    expect((error as Error).message).toMatch(
      /embeds an entry of the type "photoGallery", which this site cannot show/,
    );
  });

  it('refuses a kind of block or style that did not exist when this was written', async () => {
    expect(((await failure([node('embedded-resource-block')])) as Error).message).toMatch(
      /contains "embedded-resource-block", which this site cannot show yet/,
    );
    expect(((await failure([p(node('resource-hyperlink', [text('x')]))])) as Error).message).toMatch(
      /contains "resource-hyperlink"/,
    );
    expect(((await failure([p(text('x', 'sparkles'))])) as Error).message).toMatch(
      /uses the text style "sparkles"/,
    );
  });

  it('refuses a field that is not rich text', async () => {
    await expect(
      renderRichText('just a string' as unknown as Document, context()),
    ).rejects.toThrow(/has content that is not rich text/);
  });
});
