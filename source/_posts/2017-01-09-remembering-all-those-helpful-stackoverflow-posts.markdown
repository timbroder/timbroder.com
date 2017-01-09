---
layout: post
title: Remembering All Those Helpful Stackoverflow Posts
date: 2017-01-09 14:38
---

How often has this happened to you?

**2 years ago**

* You are spelunking on Google and StackOverflow (SO). 
* You find what you need. 
* You graciously upvote and/or leave a comment. 
* You update your code and leave a comment. 
* **You move on**

**Now**

* You come across the *same* problem. You remember finding it before. But it's a different job or project. Spelunking begins!
* You look through your bookmarks
* You try to remember how you Googled for it the *last* time
* You eventually find it after an hour
* **You move on**
* *This possibly happens again in the future*

Now in the perfect world, we're keeping a [programming notebook](https://geo.itunes.apple.com/app/quiver-programmers-notebook/id866773894?at=11laRZ&ct=afp15&ls=1&mt=12 "programming notebook") or remembering to bookmark/tag/organize what we find. If you do, awesome, I wish I was you. For the rest of us mere mortals, read on.

I wanted something that would let me search *my* collection of SO *things* so I could find it later. Here's where I ended up:

1. Use an instance of [stack2rss](stack2rss "stack2rss") to get an RSS feed of SO posts I've starred. 
2. Run a [Zap](https://zapier.com/ "Zap") that pulls these in and sends them to my [bookmarks](https://pinboard.in/u:broderboy/t:stackoverflow/ "bookmarks") (tagged as 'stackoverflow')
3. Search using [Pinboard Premium](https://pinboard.in/upgrade/ "Pinboard Premium") which downloads the questions and archives them. *(this is optional)*

This has been working for me and I've already be able to re-find things that helped me before. Here's how to set it up:

1. Spin up an instance of [stack2rss](https://github.com/nathan-osman/stack2rss "stack2rss"). There is a [demo](http://stack2rss.quickmediasolutions.com/ "demo") available, but I've found it tends to go down. I've submitted a [PR](https://github.com/nathan-osman/stack2rss/pull/3 "PR") so you can 1 click install to Heroku. Click this [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/nathan-osman/stack2rss/)
2. Get the url for your starred feeds: ```https://[YOUR-HEROKU-APP].herokuapp.com/2.2/users/[YOUR-SO-ID]/favorites?order=desc&sort=activity&site=stackoverflow```
3. Login or Register with [Zapier](https://zapier.com/ "Zapier")
4. Create a 2 step zap with the trigger being ```RSS by Zapier``` and Pinboard's ```create bookmark``` action
5. Set each up as follows 

![](https://c5.staticflickr.com/1/622/32066204692_74e32cdde5_z.jpg)

![](https://c1.staticflickr.com/1/515/32066204992_a2aa11295d_z.jpg)

![](https://c5.staticflickr.com/1/571/32176780436_a1fec1e26d_z.jpg)

This has already saved me a lot of time. If you'd like help setting up, leave me a comment below