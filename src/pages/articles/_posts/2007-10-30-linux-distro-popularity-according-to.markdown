---
author: tim
comments: true
date: 2007-10-30 02:30:00+00:00
dsq_thread_id: '110582946'
layout: post
link: ''
slug: linux-distro-popularity-according-to
title: Linux Distro Popularity According to Google
wordpress_id: 98
categories:
- Code
tags:
- ubuntu
---

Over the years I've used a variety of Linux Distros: Mandrake, Red Hat,
FreeBSD, Fedora, Gentoo, and Ubuntu. [Distrowatch](http://distrowatch.com/)
keeps track of everything we need to know about the distros, and recently
there has been an enormous push in desktop Linux thanks to Dell putting Ubuntu
on desktops and [Compiz-Fusion](http://www.compiz-fusion.org) bringing snazzy
eye candy to even low end machines. Distrowatch gives some pretty decent stats
on the main Distros but for a while I've wanted to know how Google sees their
popularity; mainly by how many pages mention specific distros.  
  
  
  
Using some python, a spreadsheet, and a little scraping, I was able to get my
answer. To see how Google would rank different distros I'm using the number of
results Google returns when searching for the Distro's name as my numbers. I'm
going to write a HOWTO on the technical aspects of what I did sometime this
week, but here are the basic steps

  1. In a Google Spreadsheet I made a sheet that held the names of the top distros on Distrowatch.
  2. Another sheet holds the full list from distro watch (366 on record at the time of this writing)
  3. I set up a dapp to take these names, and return the number of results Google would have if you searched them
  4. A python script pulls the distros out of the spreadsheet, queries the dapp, and puts the results back into another sheet
I have 2 sets of results. One is a query using the vanilla list out of the
spreadsheet. The second is appending the word Linux to the distro if it does
not already have it as the title, I was curious as to how this would effect
the results. Below are the results of the most popular Distros on Distrowatch.
Look, Ubuntu! The spreadsheet that has all of the findings (and all 366
distros) is shared
[here](http://spreadsheets.google.com/pub?key=p919ps7OYXvugbqx9SegSTw)  
  
**Distro**| **Page Hist**  
---|---  
Ubuntu| 96,800,000  
FreeBSD| 36,700,000  
Fedora| 35,800,000  
openSuse | 29,500,000  
Debian Linux| 28,100,000  
KNOPPIX| 12,500,000  
Mandriva Linux| 5,720,000  
Gentoo Linux| 4,430,000  
PCLinuxOS| 3,170,000  
Slackware Linux| 3,010,000  
MEPIS Linux| 1,640,000  
  
  
![Distro Chart](http://spreadsheets.google.com/pub?key=p919ps7OYXvugbqx9SegSTw&oid=2&output=image)  
  
Stay tuned for the code behind it!
[Subscribe](http://feeds.feedburner.com/gPpowered) to the feed to get more
updates.

