---
author: tim
comments: true
date: 2016-02-22 23:00:00+00:00
layout: post
slug: jira-filter-subscriptions
title: Jira Filter Subscriptions
category: Code
tags:
- jira
---

I'm working in a Jira that I don't have admin access to. It's been a while since that's happened!

I wanted a way to get notified if anyone in the system opens a new ticket, so I could decide if I wanted to watch it or not. Jira makes this fairly straightforward with filters and subscriptions.

First, create a filter that picks up any tickets created in the last hour. I named mine "Recently Created"

![](https://farm2.staticflickr.com/1529/24572160063_d61b56b982_z_d.jpg)

Then, click details, and new subscription

![](https://farm2.staticflickr.com/1488/25172705536_1b486d9f4c_z_d.jpg)

Setup the schedule to be every 30 mins, 24 hours a day, and to **not** email you if there are no new issues

![](https://farm2.staticflickr.com/1644/24831359639_ab75c74611_z_d.jpg)


You'll get a well formatted email if there are new issues, and you can cherry pick the ones you want to watch
