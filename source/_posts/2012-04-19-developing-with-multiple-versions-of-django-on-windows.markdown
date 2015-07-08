---
author: tim
comments: true
date: 2012-04-19 16:47:46+00:00
dsq_thread_id: '656376127'
layout: post
linked_list_url: ''
slug: developing-with-multiple-versions-of-django-on-windows
title: Developing with multiple versions of Django on windows
wordpress_id: 1076
categories:
- Code
tags:
- django
---

At [work](http://www.alexanderinteractive.com/), we have sites that use
various versions of [Django](https://www.djangoproject.com/), so there is a
need to switch packages.  On my mac I use
[virtualenv](http://www.virtualenv.org/en/latest/index.html) to handle this,
but I've never quite gotten it to play nice with windows, and just switching
Django versions has sufficed so far. If you can set up virtualenv, that's a
much better solution

  1. Download [junction](http://technet.microsoft.com/en-us/sysinternals/bb896768) (think symbolic links for windows). Put the executable somewhere in your path. I put it in my Python scripts folder (C:\Python26\Scripts)
  2. Plan out your directory structure: Make sure you don't have any stock django eggs or folders in your site-packages folder
  3. Create a django_veresions folder in site-packages (C:\Python26\Lib\site-packages\django_versions)
  4. In this folder I put my different django installs [code] C:\Python26\Lib\site-packages\django_versions\1.1\django C:\Python26\Lib\site-packages\django_versions\1.3\django C:\Python26\Lib\site-packages\django_versions\1.4\django [/code]
  5. I also put a txt file inside the django folder to easily see what version is there (this will be helpful later to double check) [code]C:\Python26\Lib\site-packages\django_versions\1.4\django\1.4.txt[/code]
  6. Create a file called djangoversion.cmd and drop it in C:\Python26\Scripts [code]junction -d C:\Python26\Lib\site-packages\django junction C:\Python26\Lib\site-packages\django C:\Python26\Lib\site-packages\django_versions\%1\django[/code]
  7. The first line removes any links that may have been there. The second line creates a new link to the version you'll pass in.
  8. Now, to switch versions, just run this from the command line: djangoversion 1.4 [code] PS C:\Users\tbroder&gt; djangoversion 1.4 C:\Users\tbroder&gt;junction -d C:\Python26\Lib\site-packages\django Junction v1.06 - Windows junction creator and reparse point viewer Copyright (C) 2000-2010 Mark Russinovich Sysinternals - www.sysinternals.com Deleted C:\Python26\Lib\site-packages\django. C:\Users\tbroder&gt;junction C:\Python26\Lib\site-packages\django C:\Python26\Lib\site-packages\django_versions\1.4\django Junction v1.06 - Windows junction creator and reparse point viewer Copyright (C) 2000-2010 Mark Russinovich Sysinternals - www.sysinternals.com Created: C:\Python26\Lib\site-packages\django Targetted at: C:\Python26\Lib\site-packages\django_versions\1.4\django PS C:\Users\tbroder&gt; [/code]
  9. Switch as needed

