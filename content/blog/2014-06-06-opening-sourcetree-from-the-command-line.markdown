---
author: tim
comments: true
date: 2014-06-06 15:33:35+00:00
dsq_thread_id: '2741912600'
layout: post
link: ''
slug: opening-sourcetree-from-the-command-line
title: Opening SourceTree from the Command line
wordpress_id: 1550
category: Code
tags:
- git
---

SourceTree is my weapon of choice for a git GUI. I do most of my git work from
the command line, but it’s great to look at diffs and branch trees.

I was finding it tedious to open SourceTree with Alfred, then opening the
correct project.

I use this alias to open it right from my working directory:

`alias` `sourcetree=``'open -a SourceTree'`

  
  
---  
  
Then, just ```“sourcetree .”``` from where I am

