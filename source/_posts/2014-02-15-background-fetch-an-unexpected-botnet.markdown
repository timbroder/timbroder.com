---
author: tim
comments: true
date: 2014-02-15 14:37:08+00:00
layout: post
slug: background-fetch-an-unexpected-botnet
title: 'Background fetch: An Unexpected Botnet'
wordpress_id: 1421
categories:
- Code
---

<blockquote>

> 
> When enabled within your applications you are essentially building a massively distributed botnet. Each copy of your application will be periodically awoken and sent on a mission to seek and assimilate internet content with only the OS safeguards holding it back. As your app grows in popularity this can lead to some rather significant increases in activity.
> 
> 
</blockquote>





David Smith's article on the implications (and related cost) of background fetch gave me a few things to think about. I have a few parts of my new app that use background fetch. Thus far I have been guilty of #2: **Be honest when your application didn’t get data from a fetch.** This needs to change.
