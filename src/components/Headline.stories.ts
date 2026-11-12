import HeadlineExample from './HeadlineExample.astro';

export default {
  component: HeadlineExample,
};

export const Short = {
  args: { text: 'Small Wins' },
};

export const Long = {
  args: {
    text: 'Reading on My Kobo, Listening on My Phone, Never Losing My Place',
    padded: false,
  },
};
