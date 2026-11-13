/**
 * The colours of code blocks.
 *
 * This is Shiki's Monokai, the closest theme to the Prism Okaidia theme the
 * Gatsby site used, with five of its colours lightened. Those five were too
 * faint against the dark background to meet WCAG AA (4.5:1). Each one is
 * lightened only as far as it needs to pass, so the look barely changes.
 */
import monokai from 'shiki/themes/monokai.mjs';

/** The background of a code block. src/styles/global.css sets the same. */
export const CODE_BACKGROUND = '#272822';

/** Original colour to replacement. Keys are lower case: Shiki looks them up that way. */
export const COLOR_REPLACEMENTS = {
  // Keywords and tags (pink): 3.9:1 before.
  '#f92672': '#fa4f8d',
  // Comments: 3.9:1 before.
  '#88846f': '#94907d',
  // Diff headers and markdown quotes, in the comment colour: 3.0:1 before.
  '#75715e': '#94907d',
  // Invalid code (red): 4.1:1 before.
  '#f44747': '#f55b5b',
  // Debug tokens (purple): 4.2:1 before.
  '#b267e6': '#b772e8',
  // A half-transparent purple, made solid.
  '#ae81ffa0': '#ae81ff',
};

export const codeTheme = {
  ...monokai,
  name: 'monokai-aa',
  colorReplacements: COLOR_REPLACEMENTS,
};
