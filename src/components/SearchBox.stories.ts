import SearchBox from './SearchBox.astro';

export default {
  component: SearchBox,
};

export const Empty = { args: {} };

export const WithASearch = { args: { value: 'redirects' } };
