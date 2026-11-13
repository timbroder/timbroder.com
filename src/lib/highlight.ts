/**
 * Highlights code outside markdown, with the same markup the markdown
 * processor gives a fenced code block: the same theme, classes and
 * attributes, so one set of styles covers both.
 *
 * Contentful posts use this. A build test compares its output with a
 * markdown code block, in case Astro changes what it produces.
 */
import { createHighlighter, isSpecialLang, type BundledLanguage, type Highlighter } from 'shiki';
import { codeTheme } from './code-theme.ts';

let highlighter: Promise<Highlighter> | undefined;

export interface HighlightOptions {
  /** Set to false to leave the line numbers out. */
  lineNumbers?: boolean;
}

/**
 * The HTML of a highlighted code block. A language the highlighter does not
 * know is shown as plain text, as in markdown.
 */
export async function highlightCode(
  code: string,
  language?: string,
  { lineNumbers = true }: HighlightOptions = {},
): Promise<string> {
  highlighter ??= createHighlighter({ langs: [], themes: [codeTheme] });
  const shiki = await highlighter;

  let lang = language?.trim().toLowerCase() || 'plaintext';
  if (!isSpecialLang(lang) && !shiki.getLoadedLanguages().includes(lang)) {
    try {
      await shiki.loadLanguage(lang as BundledLanguage);
    } catch {
      lang = 'plaintext';
    }
  }

  return shiki.codeToHtml(code.replace(/(?:\r\n|\r|\n)$/, ''), {
    lang,
    theme: codeTheme.name,
    transformers: [
      {
        pre(node) {
          const classes = String(node.properties.class ?? '').replace(/shiki/g, 'astro-code');
          node.properties.class = lineNumbers ? classes : `${classes} no-line-numbers`;
          node.properties.style = `${String(node.properties.style ?? '')}; overflow-x: auto;`;
          node.properties.dataLanguage = lang;
        },
      },
    ],
  });
}
