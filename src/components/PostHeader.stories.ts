import { article, longTitle } from '../fixtures/posts.ts';
import PostHeader from './PostHeader.astro';

export default {
  component: PostHeader,
};

export const Default = { args: { title: article.title, date: article.date } };

export const LongTitle = { args: { title: longTitle.title, date: longTitle.date } };
