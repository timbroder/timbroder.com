/**
 * Where a post body is meant to differ from the live site (R6).
 *
 * Stage 5 repaired the old posts' markdown, and the new parser reads some
 * of it differently. Every post that renders differently from the live site
 * is in one of three lists here. The first two are mechanical: the test
 * checks that the difference is exactly of that kind and nothing more.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Generated {
  nowRendered: string[];
  wrappedLines: Record<string, number>;
}

/**
 * The two mechanical lists live in expected-content.json, which
 * `node scripts/baseline/expected-content.ts` writes from the current build.
 * Run it only after reading the difference it reports: it records what the
 * build does, it does not judge it.
 */
const generated = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'expected-content.json'), 'utf8'),
) as Generated;

/**
 * Posts where the live site shows a link or a picture as raw markdown,
 * "[here](http://example.com/a- b)", and the new site shows the link or the
 * picture. The old export had split the address across two lines; the
 * address is now whole. Keyed by the post's URL on the live site.
 */
export const NOW_RENDERED = new Set(generated.nowRendered);

/**
 * Posts where the live site broke a wrapped line out of its list item or
 * quote into a paragraph of its own, and the new site keeps it in. The
 * number is how many lines. Keyed by the post's URL on the live site.
 *
 * Which lines are sentences that wrapped, and which start a paragraph of
 * their own and were given a blank line, was decided in stage 5
 * (scripts/content/separate-paragraphs.ts).
 */
export const WRAPPED_LINES: Record<string, number> = generated.wrappedLines;

/**
 * Posts repaired by hand, or that differ in a way of their own. They are
 * left out of the comparison, so each has to say why. Matched by the end of
 * the live URL.
 */
export const REPAIRED_BODIES: Record<string, string> = {
  '/games-i-was-addicted-to-in-2014/':
    'Its frontmatter was never read, so the live site shows the frontmatter as the start of the post.',
  '/2007/07/howto-post-code/':
    'The live site shows the "```html" fence lines as part of the code. Each code block now sits in its numbered step.',
  '/2007/08/howto-yui-tabview/':
    'The last code block ended with "```HTML", which does not close a block, so the live site shows that line as code. It is closed properly.',
  '/2007/09/using-blogger-and-feedburner-sitemaps/':
    'The third screenshot was indented with a tab, which made it a code block showing "![](...)". It is a picture in its step now.',
  '/2009/12/share-google-reader-folders-with/':
    'The screenshots were indented with a tab, which made them code blocks showing "![](...)". They are pictures now, each in its step.',
  '/2012/04/developing-with-multiple-versions-of-django-on-windows/':
    'The code was indented with a tab, so the live site shows the "```" lines and breaks the numbered list around them. Each block now sits in its step.',
  '/2012/07/improve-your-magento-workflow-use-git-or-mercurial/':
    'A closing "```" was on the same line as the code, so the rest of the post was one code block. It is text again.',
  '/2014/07/using-ponydebugger-on-a-device/':
    'The language name was run together with the code ("```bashponyd serve"), and the last block never closed. The three blocks are restored.',
  '/2009/05/diggnation-nyc-june-4th/':
    'A link started in a heading and ended on the next line, so it never worked. The sentence is on one line.',
  '/2011/04/skynet/':
    'The heading carried a wiki\'s "edit this section" button, shown as raw markdown. It is removed.',
  '/2011/04/new-digg-reverse-paywall-coming/':
    'Italics that ran over a wrapped line in a quote show as "_" on the live site. They are italics now.',
  '/2014/03/avspeechsynthesizers-queue-doesnt-work/':
    'Bold text that ran over a wrapped line in a quote shows as "**" on the live site. It is bold now.',
};

export const isRepairedBody = (liveUrl: string) =>
  Object.keys(REPAIRED_BODIES).some((ending) => liveUrl.endsWith(ending));
