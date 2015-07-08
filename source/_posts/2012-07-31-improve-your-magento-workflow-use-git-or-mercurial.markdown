---
author: tim
comments: true
date: 2012-07-31 13:18:07+00:00
dsq_thread_id: '786942944'
layout: post
linked_list_url: ''
slug: improve-your-magento-workflow-use-git-or-mercurial
title: 'Improve your Magento workflow: Use git or mercurial'
wordpress_id: 1141
categories:
- Code
tags:
- git
- magento
- mercurial
---

Most of our new projects at work are on mercurial and I've moved most of my
personal projects over to git.  We do, unfortunately, still have one Magento
install that lives in our old subversion repository.  If you've ever tried to
work with a project the size of Magento in SVN with branching, you know the
kind of pain this can cause. My machine at work is no slouch. An i7, 8 gigs of
ram, 256 megs graphics card, and an SSD. Perfect for any number of high
performance or [online games](http://sv.partypoker.com/), compiling, or video
editing. Yet, switching branches on the mercurial project brings it to its
knees.  It's honestly better to go shoot a quick game of pool while its
switching rather then try to get anything done.  Eventually... we'll get it
into mercurial.   Anyway, to migrate a project from svn to git, use the
following command: [code]git svn clone http://svn/repo/here/trunk[/code] To
migrate a project from svn to hg, use the following command: [code]hg convert
http://svn/repo/here/trunk[/code]   Branching is now much, much easier and if
that isn't enough for you to switch here are a few more reasons:

  * git is much easier to use than when it first came out
  * merging is exponentially smoother than SVN
  * distributed: you can branch, merge, commit, revert all locally without effecting your team until you push. All this happens locally = faster
  * you can work offline
  * can centralize only if you want to
  * branching takes on a whole new level. Create custom workflows base on release, or bug, or whatever you want
  * merging is exponentially smoother than SVN (yes, I listed this twice)
  * visual branch diagrams

