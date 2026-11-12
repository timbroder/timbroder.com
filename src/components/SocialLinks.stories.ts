import SocialLinksComponent from './SocialLinks.astro';

export default {
  component: SocialLinksComponent,
};

export const SocialLinks = {
  args: {
    links: [
      { icon: 'mastodon', href: 'https://masto.ai/@timothybroder', label: 'Follow on Mastodon' },
      { icon: 'instagram', href: 'https://www.instagram.com/timothybroder/', label: 'Follow on Instagram' },
      { icon: 'github', href: 'https://github.com/timbroder', label: 'Follow on GitHub' },
      { icon: 'linkedIn', href: 'https://www.linkedin.com/in/timbroder/', label: 'Follow on LinkedIn' },
      { icon: 'reddit', href: 'https://www.reddit.com/user/broderboy/', label: 'Follow on Reddit' },
      { icon: 'goodreads', href: 'https://www.goodreads.com/user/show/1253891-tim-broder', label: "What I'm reading" },
      { icon: 'playstation', href: 'https://www.exophase.com/user/timbroder/', label: "What I'm playing" },
      { icon: 'lastFm', href: 'https://www.last.fm/user/broderboy/', label: "What I'm listening to" },
      { icon: 'trakt', href: 'https://trakt.tv/users/timbroder', label: "What I'm watching" },
    ],
  },
};
