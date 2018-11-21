---
author: tim
comments: true
date: 2009-01-26 15:11:00+00:00
dsq_thread_id: '117911366'
layout: post
link: ''
slug: how-to-get-brightkite-photos-into-rss
title: How to get brightkite photos into an RSS feed (to post to a blog)
wordpress_id: 188
category: Code
tags:
- brightkite
- HOWTO
- timbroder.com
- wordpress
- yahoo pipes
---

I started another [blog ](http://timbroder.com)so I have a place to rant about
comics or movies or whatever else I need to get off my chest, and I needed an
excuse to play with wordpress (something I've been wanting to do for a while).
I plan on posting how I did certain things on that blog on gPowered. One of
the things I really wanted to do was have my twitter photos show up as posts
on that blog. For a while I have been using
[twitpic](http://twitpic.com/photos/broderboy), but have recently changed over
to [brightkite](http://brightkite.com/people/broderboy). Brightkite provides
an rss feed of all your activity, but I was only interested in the photos.
Looked like a job for [Yahoo!
Pipes](http://pipes.yahoo.com/pipes/pipe.info?_id=PMOQjpHo3RGyu7JdLXO0Kg).

[![](http://4.bp.blogspot.com/_Ng3QbVQfLZ8/SX3Uw_HR3KI/AAAAAAAAajI/XPnLMt02wdQ
/s320/pipe1.JPG)](http://4.bp.blogspot.com/_Ng3QbVQfLZ8/SX3Uw_HR3KI/AAAAAAAAajI/XPnLMt02wdQ/s1600-h/pipe1.JPG)

I imported the bkite feed into pipes, filtered on the items that were photo
posts, and renamed the title so it would have the title of the photo instead
of the bkite location (by default bkite photo titles are the location where
you most recently checked in). I also did some URL generation so anyone could
[use the pipe](http://pipes.yahoo.com/pipes/pipe.run?_id=PMOQjpHo3RGyu7JdLXO0Kg&_render=rss&username=broderboy) The next step was to get this into
wordpress. I Installed the
[FeedWordPress](http://projects.radgeek.com/feedwordpress/) plugin and set it
up to import the pipe's RSS feed. You can tweak the the settings on what user
should be used to write the posts, categories, tags, permalinks (I set mine to
point directly back to brightkite). Hope this helps someone out there,
enjoy
