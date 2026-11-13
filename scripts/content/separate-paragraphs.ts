/**
 * Puts a blank line before a paragraph that directly follows a list item or
 * a quote, where the two were written on consecutive lines.
 *
 *   node scripts/content/separate-paragraphs.ts          apply
 *   node scripts/content/separate-paragraphs.ts --list   only show what would change
 *
 * Why: the old posts were exported from Blogger and WordPress with lines
 * like these:
 *
 *     * you can make "shows" to show off your photos
 *     Cons
 *
 * The Gatsby site started a new paragraph at "Cons". Markdown as it is
 * defined today (CommonMark) reads "Cons" as more of the list item. A blank
 * line makes the source mean what the live site shows.
 *
 * The same exports also wrap long lines, so most lines that follow a list
 * item are simply the rest of its sentence:
 *
 *     * Unread count is now 1,000+ rather then 100+ (this is going to be good for
 *     me when I get back)
 *
 * Those are left alone: the new site shows the sentence whole, where the
 * live site broke it in two. The two cases are told apart by whether the
 * line had to wrap (a first line shorter than the wrap width was ended on
 * purpose) and whether the break falls between sentences. Lines the rule
 * cannot settle are printed by --list as "kept?", to be read and decided.
 *
 * Running it again changes nothing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { contentFiles, maskCode } from '../images/lib.ts';

/** The exports wrap at 78 characters. */
const WRAP = 78;
const LIST_ITEM = /^(\s*)([*+-]|\d+[.)])\s+/;
const QUOTE = /^\s*>/;

/**
 * Lines the rule gets wrong, decided by reading them.
 * "file:line text start" -> true to separate, false to leave.
 */
const DECIDED: Record<string, boolean> = {
  // Wrapped, but a new paragraph: commentary after the last item of a list.
  'blog/2009-04-17-how-to-manage-podcasts-in-winamp-screw.md:That last point is the most im': true,
};

const listOnly = process.argv.includes('--list');
let changed = 0;
let separated = 0;
let kept = 0;

for (const file of contentFiles()) {
  const raw = readFileSync(file, 'utf8');
  const bodyStart = raw.indexOf('\n---', 3) + 4;
  const lines = raw.slice(bodyStart).split('\n');
  const masked = maskCode(raw.slice(bodyStart)).split('\n');

  const insertBefore: number[] = [];
  // What the previous line belongs to: a list item, a quote, an indented
  // code block, or nothing that a following line could join.
  let container: 'list' | 'quote' | 'code' | null = null;
  let contentIndent = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const line = masked[i];
    const indent = line.replace(/\t/g, '    ').match(/^ */)![0].length;
    if (line.trim() === '') {
      if (container !== 'code') container = null;
      continue;
    }
    if (container === 'code') {
      if (indent >= 4) continue;
      container = null;
    }
    if (container === null && indent >= 4) {
      container = 'code';
      continue;
    }
    const item = line.match(LIST_ITEM);
    if (item) {
      // An item with no text yet has no sentence for the next line to join.
      container = line.slice(item[0].length).trim() ? 'list' : null;
      contentIndent = item[0].length;
      continue;
    }
    if (QUOTE.test(line)) {
      container = line.replace(/^[\s>]+/, '').trim() ? 'quote' : null;
      continue;
    }
    if (!container) continue;
    if (container === 'list' && indent >= contentIndent) continue;

    // This line follows a list item or quote with no blank line and no
    // indent: the parser reads it as part of the item or quote.
    const previous = masked[i - 1];
    const length = previous.trimEnd().length;
    const firstWord = line.trim().split(/\s+/)[0];
    const hadToWrap = length <= WRAP + 2 && length + 1 + firstWord.length > WRAP;
    const endsSentence = /[.!?:;"”)\]*_]$/.test(previous.trimEnd());
    const startsFresh = /^[A-Z0-9!\[`|<*#(“"]/.test(line.trim());

    // A line that had to wrap is the rest of a sentence. So is one that
    // was broken on purpose but neither ends nor starts a sentence, as in
    // a quote pasted with its line breaks.
    let separate = !hadToWrap && (endsSentence || startsFresh);
    const ambiguous = hadToWrap && endsSentence && startsFresh;
    const key = `${file.replace('content/', '')}:${lines[i].trim().slice(0, 30)}`;
    if (key in DECIDED) separate = DECIDED[key];

    if (separate) {
      insertBefore.push(i);
      separated += 1;
      container = null;
    } else {
      kept += 1;
    }
    if (listOnly && (separate || ambiguous)) {
      const what = separate ? 'separate' : 'kept?   ';
      console.log(`${what}  ${key}\n          after: …${previous.trimEnd().slice(-50)}`);
    }
  }

  if (insertBefore.length === 0) continue;
  changed += 1;
  if (listOnly) continue;
  for (const index of insertBefore.reverse()) lines.splice(index, 0, '');
  writeFileSync(file, raw.slice(0, bodyStart) + lines.join('\n'));
}

console.log(
  `${separated} paragraphs separated in ${changed} files; ${kept} wrapped lines left as they are.`,
);
