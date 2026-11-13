/** Layout checks shared by the browser tests. */
import type { Page } from '@playwright/test';

/**
 * Says what makes the page scroll sideways, or returns null when the page
 * fits its screen.
 */
export async function sidewaysScroll(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const by = root.scrollWidth - root.clientWidth;
    if (by <= 0) return null;

    const limit = root.clientWidth;
    // An element inside a box that scrolls or clips does not widen the page.
    const clipped = (el: Element) => {
      for (let box = el.parentElement; box && box !== document.body; box = box.parentElement) {
        if (getComputedStyle(box).overflowX !== 'visible') {
          return box.getBoundingClientRect().right <= limit;
        }
      }
      return false;
    };
    const sticksOut = (el: Element) =>
      Math.round(el.getBoundingClientRect().right) > limit && !clipped(el);
    // Name the innermost culprits: those with no child sticking out too.
    const culprits = [...document.body.querySelectorAll('*')]
      .filter(sticksOut)
      .filter((el) => ![...el.children].some(sticksOut))
      .slice(0, 3)
      .map((el) => `<${el.tagName.toLowerCase()}> "${(el.textContent ?? '').trim().slice(0, 50)}"`);

    // Text that overflows a block does not move the block's own edge, so
    // there may be no element to name.
    return `scrolls sideways by ${by}px (${culprits.join(', ') || 'a word too long for its line'})`;
  });
}
