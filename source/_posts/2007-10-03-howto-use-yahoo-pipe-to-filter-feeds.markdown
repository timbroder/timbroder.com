---
author: tim
comments: true
date: 2007-10-03 22:59:00+00:00
dsq_thread_id: '111417073'
layout: post
linked_list_url: ''
slug: howto-use-yahoo-pipe-to-filter-feeds
title: 'HOWTO: Use a Yahoo Pipe to filter feeds'
wordpress_id: 79
categories:
- Code
tags:
- YUI
---

One of my friends at work asked me today how I sift through volumes of news to
find articles and information on Google and specifically on Google Code for my
articles. The answer is simple, I don't. Granted, I DO read a LOT, but there
just aren't enough hours in the day to read everything I want to. So, I have a
[Yahoo Pipe](http://pipes.yahoo.com/pipes/) sift through the feeds for me.
Pipes is "a powerful composition tool to aggregate, manipulate, and mashup
content from around the web." Its fairly easy to use and doesn't require any
code or coding experience, although understanding the basic layout of an RSS
or Atom feed is a definite plus. The method I'm going to describe could work
for any blogger or anyone who wants to filter a single or large group of feeds
by keyword. I'm not going to go into the details of Yahoo Pipes, there are
plenty of tutorials and examples for that. I'm just going to describe how I
built the small pipe I use to filter for Google news.  
  
The first step is to log into or create a Yahoo account and go to
<http://pipes.yahoo.com/pipes/> and click on Create Pipe. The first node we're
going to use is under sources and is called "Fetch Feed". Add as many of these
as you want to pull in all the feeds you will need.  
  
![](http://lh6.google.com/timothy.broder/RwQeq2uGXrI/AAAAAAAAMTE/_APNQgTsUMQ/s400/pipe1.jpg?imgdl=1)  
  
Then use unions (located under Operators) to join these Fetches together. If
you have more then 5 feeds, you will need multiple unions.  
  
  
  
![](http://lh6.google.com/timothy.broder/RwQeq2uGXsI/AAAAAAAAMTM/uKp3MSfdtUg/s400/pipe2.jpg?imgdl=1)  
  
Finally, add a filter, also located under Operators. Here, "Permit" items that
match "any" of the following. Then, add rules where item.description >
Contains and then the word or phrase you want to search for. This filter will
allow any posts that have the words through, and block everything else. Send
the output of the Filter to the Pipe Output and you are done.  
  
![](http://lh6.google.com/timothy.broder/RwQeq2uGXtI/AAAAAAAAMTU/zrI8IloMhiw/s400/pipe3.jpg?imgdl=1)  
  
You can then subscribe to the output of this pipe with the reader of your
choice. When I subscribe to my pipe's [feed](http://pipes.yahoo.com/pipes/pipe
.run?_id=vF35LapU3BG9UzFodbq02Q&_render=rss) in Google Reader, I only see
posts that contain the word Google or google. I also could have done that as
one filter with a regular expression, or just with "oogle".  
  
Here is a full view of the
[pipe](http://pipes.yahoo.com/pipes/pipe.info?_id=vF35LapU3BG9UzFodbq02Q)  
  
![](http://lh6.google.com/timothy.broder/RwQeq2uGXuI/AAAAAAAAMTc/RAnjUutsd5A/s400/pipe4.jpg?imgdl=1)  
  

