/**
 * The rule for post slugs: lowercase letters, digits and single hyphens.
 * The content schema and the build check hold every post to it.
 */

export const CLEAN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isCleanSlug(slug: string): boolean {
  return CLEAN_SLUG.test(slug);
}
