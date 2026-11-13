import Pagination from './Pagination.astro';

export default {
  component: Pagination,
};

export const FirstPage = {
  args: { page: 1, numPages: 26, prev: null, next: '/page/2/' },
};

export const MiddlePage = {
  args: { page: 2, numPages: 26, prev: '/', next: '/page/3/' },
};

export const LastPage = {
  args: { page: 26, numPages: 26, prev: '/page/25/', next: null },
};

/** A list with one page shows no pagination at all. */
export const SinglePage = {
  args: { page: 1, numPages: 1, prev: null, next: null },
};
