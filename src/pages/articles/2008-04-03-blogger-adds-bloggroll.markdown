---
author: tim
comments: true
date: 2008-04-03 22:37:00+00:00
dsq_thread_id: '109994389'
layout: post
link: ''
slug: blogger-adds-bloggroll
title: Blogger adds bloggroll
wordpress_id: 103
category: Code
tags:
- blogger
- reader
- socialgraph
---

[Blogger](http://buzz.blogger.com/2008/04/blog-list-scheduled-post-publishing-
on.html) in [draft](http://draft.blogger.com/) added 2 new features today: a
blogroll page element, and post scheduling. Post scheduling is pretty useful,
you can write up your post, set the time (in the future) that you want it to
post, and Blogger will do it automatically. The second feature, a blogroll, I
would like a lot more if it was done better. The main thing I like about it is
that it integrates with Google Reader so if I'm linking to my friend's blogs,
I just scroll to my 'Friends' Tag and add them. The thing I don't like however
is that it does not support [XFN](http://gmpg.org/xfn/) or
[FOAF](http://gmpg.org/xfn/) therefore not getting picked up by the
[SocialGraph API](http://code.google.com/apis/socialgraph/docs/). For example,
if I linked to my [girlfriend's blog](http://maybe-not.net/ "Laura's blog" ),
the blogroll just lists this as

```HTML
<a href='http://maybe-not.net/' target='_blank'>Maybe-Not</a>
```

A better link, for example from a [wordpress](http://www.wordpress.org)
blogroll would look something like

```HTML
<a href="http://maybe-not.net/" rel="friend sweetheart" title="Laura&#8217;s blog">Maybe-Not</a>< 
```

...and get picked up but the SocialGraph as having a relationship to me.
Blogger is great and I love using it, but the features of wordpress are
blowing it out of the water.

