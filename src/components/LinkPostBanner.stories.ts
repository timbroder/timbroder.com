import ProseDecorator from './examples/ProseDecorator.astro';
import LinkPostBannerComponent from './LinkPostBanner.astro';

export default {
  component: LinkPostBannerComponent,
};

/** Shown above the body of a link post. */
export const LinkPostBanner = {
  args: { href: 'https://davidhemphill.com/small-wins' },
  decorators: [{ component: ProseDecorator }],
};
