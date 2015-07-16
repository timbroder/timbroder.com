---
author: tim
comments: true
date: 2009-04-08 13:45:00+00:00
dsq_thread_id: '116967586'
layout: post
linked_list_url: ''
slug: big-appengine-news-cron-java-firewalled
title: 'Big Appengine news: Cron, Java, Firewalled Data, DB Import'
wordpress_id: 200
categories:
- Code
tags:
- appengine
---

[Java Support](http://googleappengine.blogspot.com/2009/04/seriously-this-time-new-language-on-app.html): This was the first, and most popular [request
](http://code.google.com/p/googleappengine/issues/detail?id=1)in the bug
tracker. Followed closely by PHP support.  Google has merged the simplicity of
appengine with the robustness of java, and added it to their [Eclipse
plugin](http://code.google.com/eclipse) to boot.  
  
[Cron Support](http://code.google.com/appengine/docs/python/config/cron.html):
The cron support works by calling a URL at a given interval. I'm not sure if
cron jobs are also restricted by the timeout policy, hopefully they will be
allowed to be longer.  
  
[Secure Data Connector](http://code.google.com/securedataconnector/): An
exampled of this would be accessing data behind a corporate firewall.  Might
be a (good/bad) idea ;)  
  
[Bulk Uploader](http://code.google.com/appengine/docs/python/tools/uploadingdata.html): Dump data into appengine from another database or a CSV
file