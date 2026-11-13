/**
 * Accessibility checks shared by the browser tests.
 *
 * A check fails on any serious or critical violation. Nothing is exempt.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export async function seriousViolations(page: Page, include?: string): Promise<string[]> {
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}, e.g. ${v.nodes[0]?.html.slice(0, 120)})`);
}

/** Text whose colour contrast is below WCAG AA (4.5:1, or 3:1 for large text). */
export async function lowContrastText(page: Page): Promise<{ colours: string; html: string }[]> {
  const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const data = node.any[0]?.data as
        | { fgColor?: string; bgColor?: string; contrastRatio?: number }
        | undefined;
      return {
        colours: `${data?.fgColor} on ${data?.bgColor} (${data?.contrastRatio}:1)`,
        html: node.html.slice(0, 100),
      };
    }),
  );
}
