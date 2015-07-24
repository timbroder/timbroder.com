---
author: tim
comments: true
date: 2011-02-23 20:55:22+00:00
dsq_thread_id: '243706747'
layout: post
link: ''
slug: running-mongodb-as-a-service-on-windows
title: Running Mongodb as a service on windows
wordpress_id: 850
categories:
- Code
tags:
- mongodb
---

```
> c:\mongodb\mongod.exe --logpath "c:\mongodb\logs\mongo.log" --logappend --dbpath "c:\mongodb\dat
a" --directoryperdb --install
all output going to: c:\mongodb\logs\mongo.log
Creating service MongoDB.
Service creation successful.
Service can be started from the command line via 'net start "MongoDB"'.

> net start MongoDB
The Mongo DB service was started successfully.
>

> mongo
MongoDB shell version: 1.6.5
connecting to: test
>
```