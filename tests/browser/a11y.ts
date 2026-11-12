/**
 * Accessibility checks shared by the browser tests.
 *
 * A check fails on any serious or critical violation, apart from the ones
 * listed here, which the design inherits from the live site.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * Violations the current design is known to have. Matching the live site
 * comes first during the migration; these are follow-ups for after cutover.
 */
export const INHERITED_VIOLATIONS: Record<string, string> = {
  'color-contrast':
    'Dates and the copyright line are zinc-400 on white, and links and "Read article" are teal-500 on white. Both are below 4.5:1.',
};

export async function seriousViolations(page: Page, include?: string): Promise<string[]> {
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .filter((v) => !(v.id in INHERITED_VIOLATIONS))
    .map((v) => `${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}, e.g. ${v.nodes[0]?.html.slice(0, 120)})`);
}
