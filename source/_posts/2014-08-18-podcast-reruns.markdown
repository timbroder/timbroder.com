---
author: tim
comments: true
date: 2014-08-18 18:06:58+00:00
dsq_thread_id: '2938274336'
layout: post
link: ''
slug: podcast-reruns
title: Podcast Reruns
wordpress_id: 1630
categories:
- Code
tags:
- podcasts
- yahoo pipes
---

Last year, I had been plowing through old episodes of a few Tech podcasts. I
was able to get through all of [Developing
Perspective](http://developingperspective.com/) (they are short) and was
working on [Build and Analyze](http://5by5.tv/buildanalyze).  I’m halfway-ish
through B&amp;A, but my listening has died off in leu of new episodes of
[other shows](http://timbroder.com/podcasts).

I’ve missed listening to it.  The reason it dropped of is playlist related.
Everything I listen to is in one playlist that I prune from time to time. I
didn’t add B&amp;A to it because I didn’t want to have to download each
episode each time. I downloaded them all at once. If I added it to the
playlist, all 108 episodes would have shown up.  I had a separate playlist
just for this show. But, I would forget about it.

I got to thinking about reruns. TV has them. YouTube has them.  Why not this
medium?  Whether specifically for podcasts or RSS feeds in general, I thought
something might exist. Something that would take a feed and give back the
items at a pubDate+days interval. This way, whatever you consume the feeds
with, will think it’s new. This could be done by modifying the pubDate, though
some feed scrapers might not care that a pubDate might be in the future.  The
other method would be to restrict a feed based on a range of days (or weeks
for Podcasts).

I googled around for a bit. The back of my mind thinks it remembers something
from…. 5 or so years ago? No luck. Then I wanted to build a service to do it…
Then I remembered time is scarce these days. Yahoo Pipes to the rescue!!

I got a pipe working that overcast would accept and process. Then tweaked it
for more public consumption.

<http://pipes.yahoo.com/timbroder/podcastreruns>

The Pipe has 3 inputs (listed in a different order from that link for ease of
explanation)

  * Feed URL: Paste in the url of your podcast feed here
  * How Many Weeks ago to start: This is when in the podcast to start pulling from. If want to start at the very first episode, use the number of weeks between when the episode first aired, and now.  I want to start B&amp;A at episode 49. It aired on 10/24/2011. It’s currently 7/29/2014. So, I want to start 145 weeks ago
  * How many episodes do you want per week: This depends on how much you want, and how often the podcast released episodes.  If it was a weekly podcast and you want to get 1 episode a week, put 1. If it was weekly and you want 4 episodes a week to catch up faster, put 4.  What this is doing is loading all the feed items in between the “start week” and this number at once. Podcasts that come out more than once a week will be multiplied by this number

Configure as needed, then cick “Run Pipe” to confirm you see the appropriate
episodes. Then, grab the RSS url for this configuration. Load this URL into
your pod catcher.

![2014 07 29 1602](http://timbroder.com/wp-content/uploads/2014/07/2014-07-29_16021.png)

I’ve been testing this for a few weeks now and it’s working great! Another
good use would be [Overcast’s](https://itunes.apple.com/us/app/overcast-
podcast-player/id888422857?mt=8&at=11laRZ&ct=pro) “Retired Greats” Section:

 ![Overcast1](http://timbroder.com/wp-content/uploads/2014/08/overcast1.jpg)

If you are interested in the inner workings of this Pipe, here is a
screenshot. Though, looking at this now, getting more than 1 episode a week
needs some tweaking.

[![2014 07 29 1606](http://timbroder.com/wp-content/uploads/2014/07/2014-07-29_16061.png)](http://timbroder.com/wp-content/uploads/2014/07/2014-07-29_16061.png)