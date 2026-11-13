import FooterComponent from './Footer.astro';

export default {
  component: FooterComponent,
};

// The year is fixed so the story does not change every January.
export const Footer = { args: { year: 2026 } };
