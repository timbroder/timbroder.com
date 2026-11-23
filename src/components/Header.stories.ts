import Header from './Header.astro';

export default {
  component: Header,
};

export const PostsActive = { args: { active: '/' } };
export const PodcastsActive = { args: { active: '/podcasts/' } };
export const ProjectsActive = { args: { active: '/projects/' } };
export const TalksActive = { args: { active: '/talks/' } };
export const AboutActive = { args: { active: '/about/' } };

/** Search is the icon at the end. */
export const SearchActive = { args: { active: '/search/' } };

/** Paged lists, tag pages and category pages highlight nothing. */
export const NoneActive = { args: { active: null } };
