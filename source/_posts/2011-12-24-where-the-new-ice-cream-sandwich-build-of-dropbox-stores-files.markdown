---
author: tim
comments: true
date: 2011-12-24 16:21:12+00:00
dsq_thread_id: '514953481'
layout: post
link: ''
slug: where-the-new-ice-cream-sandwich-build-of-dropbox-stores-files
title: Where the new Ice Cream Sandwich build of dropbox stores files
wordpress_id: 1056
categories:
- Code
tags:
- Android
- dropbox
---

In the old version of dropbox, you used to be able to long press > download
a file.  This has been replaced by "favorite". Instead of going to:
```/sdcard/dropbox``` These files are now stored in: ```/sdcard/Android/data/com.dropbox.android/files/scratch```