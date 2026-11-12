/**
 * The rule for post slugs: lowercase letters, digits and single hyphens.
 *
 * New posts must already follow it (the content schema checks). `cleanSlug`
 * is used once, to propose tidy slugs for the old posts that do not.
 */

export const CLEAN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isCleanSlug(slug: string): boolean {
  return CLEAN_SLUG.test(slug);
}

export function cleanSlug(input: string): string {
  return (
    input
      // "é" becomes "e": split off accents, then drop them.
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      // "show-&-tell" reads better as "show-and-tell" than "show-tell".
      .replace(/&/g, ' and ')
      // Apostrophes and quotes join their word: "aren’t" becomes "arent".
      .replace(/['’‘"“”]/g, '')
      // Everything else that is not a letter or digit becomes a hyphen.
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}
