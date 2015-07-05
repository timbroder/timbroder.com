---
author: tim
comments: true
date: 2014-03-30 17:41:32+00:00
layout: post
slug: tips-resources-beginning-ios-development
title: Tips and Resources for beginning iOS Development
wordpress_id: 1476
categories:
- Code
---

<blockquote>While you are planning and building out your application, think about the user experience and interface a lot. Tweak, try things out, and above all, design something that avoids complexity. If you look at all of the top selling apps, they are the ones that have removed complexity, and distilled down the application idea into its most simplistic form possible while still maintaining a good range of functionality. There's a fine line begin being simple and being useless, and it's up to you to find that line and stay on the useful side.</blockquote>


I'm trying harder to plan out the design of my next app when appropriate. This time I sketched out all the user flows I could think of, in advance, on paper.  This helped a lot when modeling classes and data.  This is something I really have to force myself to do, I really just want to jump into the code. But, we know that just bites you in the ass, you just end up with spaghetti code.  Case and point being the massive UIViewController in [Weather Notifications](https://itunes.apple.com/us/app/weather-notifications/id704052114?ls=1&mt=8&at=11laRZ&ct=blog).  It's due for a refactor. I have a post in draft about the new features for that app.

As I code, I do find issues with the flow. I'm playing around with the app in the simulator, realize that what I designed just doesn't work, so I fix it in the code. The philosophical question at this point is do I update my mocks? Why didn't I catch it? Is there a way I could have? Still thinking about the answer to those.
