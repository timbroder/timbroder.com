import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CODE_BACKGROUND, COLOR_REPLACEMENTS, codeTheme } from '../../src/lib/code-theme.ts';
import { contrastRatio } from '../lib/contrast.ts';

/** WCAG AA for normal-size text. */
const AA = 4.5;

const replacements: Record<string, string> = COLOR_REPLACEMENTS;

/** Every text colour the theme can give a piece of code, as it comes out. */
function themeColours(): string[] {
  const original = [
    codeTheme.colors?.['editor.foreground'],
    ...(codeTheme.tokenColors ?? []).map((rule) => rule.settings?.foreground),
  ].filter((colour): colour is string => Boolean(colour));
  return [...new Set(original.map((colour) => colour.toLowerCase()))].map(
    (colour) => replacements[colour] ?? colour,
  );
}

describe('contrastRatio', () => {
  it('matches known values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
    // The grey WCAG examples use as the faintest that passes on white.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
});

describe('the code block theme', () => {
  it('has the background the stylesheet sets', () => {
    expect(codeTheme.colors?.['editor.background']).toBe(CODE_BACKGROUND);
    expect(readFileSync('src/styles/global.css', 'utf8')).toContain(
      `background-color: ${CODE_BACKGROUND};`,
    );
  });

  it('has no colour too faint to read on that background', () => {
    const colours = themeColours();
    expect(colours.length).toBeGreaterThan(8);
    const faint = colours
      .map((colour) => ({ colour, ratio: contrastRatio(colour, CODE_BACKGROUND) }))
      .filter(({ ratio }) => ratio < AA);
    expect(faint).toEqual([]);
  });

  it('only replaces colours the theme has, and only ones that needed it', () => {
    const inTheme = new Set(
      (codeTheme.tokenColors ?? []).map((rule) => rule.settings?.foreground?.toLowerCase()),
    );
    for (const original of Object.keys(COLOR_REPLACEMENTS)) {
      expect(original).toBe(original.toLowerCase());
      expect(inTheme, `${original} is not in the theme`).toContain(original);
      // Colours with transparency are replaced for being see-through.
      if (original.length === 7) {
        expect(contrastRatio(original, CODE_BACKGROUND)).toBeLessThan(AA);
      }
    }
  });
});
