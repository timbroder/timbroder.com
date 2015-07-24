---
author: tim
comments: true
date: 2007-07-24 02:17:00+00:00
dsq_thread_id: '110486738'
layout: post
linked_list_url: ''
slug: picasa-web-api-updates
title: Picasa Web Api updates
wordpress_id: 26
categories:
- Code
tags:
- gdata
- picasa web
---

[Google Data Api's](http://googledataapis.blogspot.com/2007/07/picasa-web-albums-adds-new-api-features.html) posted a few updates today, a few of which
I've really been looking forward to; Community Search, Retrieving a user's
recently uploaded photos, Retrieving recently added comments for a particular
user, Searching a user's photos, Filtering by tag, Uploading non-JPEG photos,
Downloading the original photo.  
  
(my fav) **Downloading the original photo**: You can now download the original
photo, including all EXIF data. This is accomplished by retrieving the feed
with the `imgmax=d` query parameter and value This will return a feed where
the `media:content` elements reference the original downloadable image.  
  
It's nice not having to use a [backdoor ](http://groups.google.com/group/Google-Picasa-Data-API/browse_thread/thread/6311fb3da0673228/a165e494fe1c1d9d#a165e494fe1c1d9d)
for this anymore

