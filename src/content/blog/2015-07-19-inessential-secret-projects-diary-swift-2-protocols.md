---
layout: post
title: Learning from Brent
date: 2015-07-19 21:42
link: http://inessential.com/2015/07/19/secret_projects_diary_2_swift_2_0_prot
---

I learn more about how to think about programming from Brent Simmons' blog than any place I can think of. I wish he wrote books or did full length tutorials. Probably more the later. I really like his thought process and how he breaks problems down. 

A good follow up to his Swift Protocol issue can be found [here](http://owensd.io/2015/07/19/brents-feed-problem.html) by David Owen. I learn a lot from him too

> Let's say I'm writing an RSS reader. (This is the example I tend to use on my blog, for historical reasons, and shouldn't be taken as indicative of anything.)
> 
> Let's say the RSS reader can have a mix of stand-alone feeds and feeds that are synced with FeedBin, Feedly, NewsBlur, etc. I might very well do this:
> 
> Create a Feed protocol.
> Create classes for each different type of feed: LocalFeed, FeedBinFeed, FeedlyFeed, etc. Each one of these conforms to the Feed protocol.
> (Why? Because each syncing system is different, and rather than have a giant Feed class that can handle all the different types, it's smarter to have a Feed protocol and then specific implementations for each different type of feed.)
> 
> RSS readers tend to have folders too. But folders may have different rules, depending on the system: folders inside folders may or may not be allowed, for instance. So, similarly, I might do this:
> 
> Create a Folder protocol.
> Create classes for each different type of folder: LocalFolder, FeedBinFolder, FeedlyFolder, etc. Each one of these conforms to the Folder protocol.
