---
title: From Gatsby to Astro in Two Days. The Old Site Was the Spec.
layout: post
slug: gatsby-to-astro-migration
date: 2026-11-20
category: Code
ai_assisted: true
ai_model: claude-fable-5-2
tags:
- astro
- gatsby
- netlify
- replatforming
- claude
- playwright
---

Last week I wrote that [Gatsby is on autopilot](/2026/11/gatsby-on-autopilot-time-to-replatform/) and that I hadn't decided where to go next.

That line had a short shelf life. The post went up on November 13th. So did the new site.

This site runs on [Astro](https://astro.build) now. Same look, same feed, same URLs (mostly, more on that below). Here's how we did it. "We" being me and [Claude Code](https://claude.com/claude-code).

## Five false starts

This wasn't my first try. The repo has five closed pull requests to prove it, going back almost a year: two questionnaires, an upgrade plan, a feature audit, and one full attempt at the migration.

The audit said the site had "about 25" posts. It has 519.

The full attempt changed 1,172 files and didn't include a single test. I had no way to know whether it matched the old site, short of clicking through 500-some posts going back to 2007. So it never shipped.

All five got closed the day the new plan started.

## The old site is the spec

The new plan started from one idea: the live site is the reference. Not my memory of it. Not a list of features. The site itself.

So before any Astro got written, a script crawled timbroder.com and wrote down what every page says. 771 URLs. For each one: the title, the meta tags, the text, the links, the pictures. For every list page, which posts are on it and in what order. For the feed, every guid.

That's the baseline.

Then came 30 requirements, each with a test behind it. A few of them:

- Every live URL still works
- Feed is unchanged for subscribers
- Post content renders the same
- Pages look the same, and fit the screen
- Bad content cannot deploy

The new site wasn't done when it looked right to me. It was done when the tests couldn't tell the two sites apart, except for a short list of differences, each one written down with a reason.

## Small stages, one switch

The work landed as eight small PRs into an `astro` branch. `main` kept serving Gatsby the whole time.

1. The plan
2. The baseline, the tests and CI
3. A bare Astro project, plus proof for nine things the plan was only assuming
4. Content, URLs and redirects
5. Design and components
6. Content fidelity and images
7. [Contentful](https://www.contentful.com)
8. The feed, head tags and analytics

Then one [cutover PR](https://github.com/timbroder/timbroder.com/pull/142).

Number 3 is the one I'd steal for any project. Before building on an assumption, check it. Does Astro read `.markdown` files? No, only `.md`, so 497 files got renamed. Do [Netlify](https://www.netlify.com) redirects match URLs with odd characters in them? Yes, with care. (More on that below too.)

My part was a short table in the plan titled "What I need from Tim." Merge each PR. Review the new slugs. Approve how the code blocks look. Publish a test post.

The decisions we made together are in another table. The ones Claude made alone sit under a heading that reads "Defaults I am assuming," with "Say so if any of these is wrong" right below it.

## What the old site was hiding

The baseline had a side effect. To prove the new site matched the old one, the tests had to know exactly what the old one did. Turns out it did a few things I'd never have signed off on:

- **Every page of a list showed the whole list.** `/page/2/` had the same 516 cards as the home page. So did pages 3 through 26.
- **Three posts were missing** from every list and from the feed, though their pages existed.
- **Two posts had no date**, so Gatsby filed them under the month of the latest build. Their URLs changed every month. One of them was [my coffee post](/2015/07/fussy-coffee/), which now stays put.
- **54 posts showed links as raw markdown.** An old export had wrapped long lines, sometimes in the middle of a web address.
- **Dates and links were too faint.** The gray had a contrast of 2.6:1 and the teal 2.4:1. The guideline asks for 4.5:1.
- **The tab icon was the Gatsby logo.** Left over from the starter.

None of these were worth copying. Each one became an expected difference in the tests, with a reason next to it. Everything else had to match.

## The details that would've bitten me

**Redirects.** 83 posts had untidy URLs: capitals, curly quotes, a `|` here and there. They all got clean slugs and a redirect from the old address. Simple enough. Except Netlify compares a redirect rule with the exact characters of the request, and a browser doesn't always send what you typed. So one old URL needs more than one rule:

```
/2015/07/world's-best-whisky-is-being-sent-to-age-in-space/  /2015/07/worlds-best-whisky-is-being-sent-to-age-in-space/  301
/2015/07/world%27s-best-whisky-is-being-sent-to-age-in-space/  /2015/07/worlds-best-whisky-is-being-sent-to-age-in-space/  301
```

Nobody guessed that. Claude tried rules on a deploy preview until the pattern was clear.

**Feed guids.** Change a post's guid and every feed reader shows it as new. With 83 re-slugged posts, that's 83 old posts landing in people's readers again. So a guid is the address a post had on the old site, forever, even when its link changes.

**The Contentful check.** The plan called for publishing a throwaway test post in Contentful to prove that side worked. I published a real one: the autopilot post. It caught a real bug. The old feed gave a Contentful post's guid a trailing slash and a markdown post's none, and the new feed treated them the same. That post would've shown up twice for subscribers.

So yes. The post where I said I hadn't decided was a test for the site I'd already picked.

**Images.** 213 pictures in old posts lived on other hosts, mostly Picasa, Blogger and Flickr. 109 are now saved in the repo, 40 of them thanks to the [Internet Archive](https://web.archive.org). 90 are gone for good and show a placeholder. The other 14 were never pictures at all: tracking pixels and feed buttons.

**Screenshots.** The visual tests opened each kind of page on the old site and on the new one, in the same browser, and compared the two. The first version let 1% of the pixels differ. That was enough to let a change of text color through unnoticed. The limit became 100 pixels.

The tests run on [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev). Every component has stories in a public [component library](/astrobook/), built with [Astrobook](https://github.com/ocavue/astrobook).

## Cutover

One merge. Then every one of the 778 addresses the Gatsby site had was requested on the live site: 690 were served directly, 87 redirected in one step, and one returned a 404 on purpose. (`/tag//`, a page that only existed because two posts had an empty tag.)

The rollback plan was to republish the last Gatsby deploy from Netlify, which keeps every one. Didn't need it.

From the first merged PR to the cutover: about a day.

## What we missed

It wasn't perfect.

Four days later I pulled a report from Google Search Console and we went through it. Two things turned up that the tests should have caught:

- **An old slug with `.html` on the end returned a 404.** Netlify quietly answers `/a/b.html` for any page that lives at `/a/b/`, so those addresses had always worked. Once the slugs changed, nothing was answering for them. The tests checked every address in the old sitemap. These weren't in it.
- **Twelve links in old posts were missing their `https://`**, so a browser read them as pages on this site. The link test skipped them because they didn't start with a slash.

Both are fixed, and both have a test now.

That report sent us down a longer road. It's why there's now an [archive](/archive/), a [tags page](/tag/), and "Newer" and "Older" links at the bottom of this post. But that's a post of its own.

## What I'd do again

- **Capture the old site before touching anything.** It turned "does it look right?" into a question a test could answer.
- **Write down what you're assuming, then prove it early.** Nine checks, done before anything was built on top of them.
- **Keep a list of differences, each with a reason.** "Same as before" is a great default. The exceptions are where the thinking goes.
- **Make publishing boring.** After the cutover, the tests that compared the build with Gatsby came out. What's left checks rules, not a list of posts, so a new post never needs a test changed.

The whole plan is [in the repo](https://github.com/timbroder/timbroder.com/blob/09fb449a051f188544b52ee58976d5e30f99da6d/MIGRATION_PLAN.md) if you want the long version. All 635 lines of it.

Thanks to the [Astro](https://astro.build) team, to [ocavue](https://github.com/ocavue) for Astrobook, and to the Internet Archive for holding on to 40 pictures I'd have lost.

---

*This post was written by Claude (Anthropic's AI assistant) based on the migration plan, pull requests and commit history in this repository, and the voice guide in this repository. Claude also did the migration work described here with me.*
