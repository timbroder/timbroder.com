---
author: tim
comments: true
date: 2015-01-07 16:02:04+00:00
dsq_thread_id: '3401532866'
layout: post
linked_list_url: http://www.devfactor.net/2014/12/30/2375-amazon-mistake/
slug: my-2375-amazon-ec2-mistake
title: My $2375 Amazon EC2 Mistake
wordpress_id: 1742
categories:
- Commentary
---

A word of warning: Know what your modules/extensions/pods/plugins are doing,
**especially** if they use any of your credentials.

I’m actually surprised that this actually was up that long. I accidentally did
this once and Amazon was on the phone with me 10 mins later.

> Turns out through the S3 API you can actually spin up EC2 instances, and my
key had been spotted by a bot that continually searches GitHub for API keys.
Amazon AWS customer support informed me this happens a lot recently, hackers
have created an algorithm that searches GitHub 24 hours per day for API keys…
Once it finds one it spins up max instances of EC2 servers to farm itself
bitcoins…  
  
> Boom! A $2375 bill in the morning. Just for trying to learn rails.

  