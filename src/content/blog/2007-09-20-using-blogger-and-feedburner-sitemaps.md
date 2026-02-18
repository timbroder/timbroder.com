---
author: tim
comments: true
date: 2007-09-20 00:20:00+00:00
dsq_thread_id: '110879835'
layout: post
link: ''
slug: using-blogger-and-feedburner-sitemaps
title: Using Blogger and Feedburner Sitemaps in Webmaster Tools
wordpress_id: 68
category: Code
tags:
- blogger
---

Blogger, good. FeedBurner, good. Google Webmaster tools, good. The 3 working
together? A little more difficult. A few months ago blogger [added
support](http://buzz.blogger.com/2007/07/attention-FeedBurner-fans.html) to
have FeedBurner + blogger integration. No more editing template code, just
change a setting in blogger, and viola, FeedBurner will track all your
subscribers. However, this method did not go over so well with Google
Webmaster Tools. Previously you could just add your blog's feed as a sitemap
for you blog and the Google Bot would have no problem. If you turned on
FeedBurner however, sitemap errors popped up all over because the FeedBurner
links were on a different domain from the blog, etc..  
  
Here is a way to make it work (assuming you already have a blog set up):  
  

1. Make an account on [FeedBurner](http://www.FeedBurner.com/fb/a/home) and add your blog to it  
	![](https://lh6.google.com/timothy.broder/RvE7pPREi1I/AAAAAAAAMRQ/rgAU_migW2A/s400/feedburne.jpg?imgdl=1)  
  
1. Then, in blogger go to settings > Site Feed > Post Feed Redirect URL and add your FeedBurner feed  
  
	![](https://lh6.google.com/timothy.broder/RvE7pPREi2I/AAAAAAAAMRY/yy7Obs753HM/s400/FeedBurner2.jpg?imgdl=1)  
  

  3. Finally, if you want to track your blog in [Google Webmaster Tools](www.google.com/webmasters/sitemaps/) you will have to add the sitemap a little differently then normal. Add a General Web sitemap as the "rss.xml?orderby=updated" feed off of your blog. FeedBurner does not pick up this feed in the redirects, so the Google Bot will not have trouble with it.  
  
	![](https://lh3.google.com/timothy.broder/RvE7pfREi3I/AAAAAAAAMRg/s_PLXzrV9hE/s400/FeedBurner3.jpg?imgdl=1)  
  

  4. After this your site will be tracked by FeedBurner as well as Google Webmaster tools and the Google Bot will be able to use the sitemap properly  
  

