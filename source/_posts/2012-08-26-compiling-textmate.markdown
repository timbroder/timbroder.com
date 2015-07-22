---
author: tim
comments: true
date: 2012-08-26 18:24:16+00:00
dsq_thread_id: '819371804'
layout: post
linked_list_url: ''
slug: compiling-textmate
title: Compiling Textmate
wordpress_id: 1192
categories:
- Code
tags:
- homebrew
- osx
- textmate
---

TextMate 2 recently went [open
source](http://blog.macromates.com/2012/textmate-2-at-github/) on
[github](https://github.com/textmate/textmate) and a coworker
[friend](https://twitter.com/tweetonwards) of mine was asking if I had
compiled it yet. Here's the quick and easy on how to compile it.

## Prerequisites

  * Either [homebrew](http://mxcl.github.com/homebrew/) or [macports](http://www.macports.org/) (I'll be using homebrew for this post)
  * [Xcode](http://itunes.apple.com/us/app/xcode/id497799835?mt=12) 4.4+ (make sure to open at least once and accept licence agreement)
Now install the needed apps with brew: [shell] brew install ragel boost
multimarkdown hg ninja proctools [/shell]

  * [ninja](http://martine.github.com/ninja/) — build system similar to `make`
  * [ragel](http://www.complang.org/ragel/) — state machine compiler
  * [boost](http://www.boost.org/) — portable C++ source libraries
  * [multimarkdown](http://fletcherpenney.net/multimarkdown/) — marked-up plain text compiler
  * [mercurial](http://mercurial.selenic.com/) — distributed SCM system
  * pgrep and pkill - part of protocols

If the hg install gives you issues, get the latest command line tools from
[Apple](https://developer.apple.com/downloads/index.action). (At the time of
this writing it is Command Line Tools (OS X Lion) for Xcode - August 2012)
Compile 

```
git clone https://github.com/textmate/textmate.git 
cd textmate
git submodule update --init ./configure &amp;&amp; ninja 
```
Install and Cleanup

```
cp -R ~/build/TextMate/Applications/TextMate/TextMate.app ~/Applications 
rm -Rf ~/build/TextMate*
```