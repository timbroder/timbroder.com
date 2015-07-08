---
author: tim
comments: true
date: 2014-07-27 20:25:59+00:00
dsq_thread_id: '2877982731'
layout: post
linked_list_url: ''
slug: using-ponydebugger-on-a-device
title: Using PonyDebugger on a device
wordpress_id: 1623
categories:
- Code
tags:
- debug
- HOWTO
- swift
---

PonyDebugger is awesome. I use it mostly for Core Data debugging. Most of the
time, I find it easier then firing up [SQLite
Professional](https://itunes.apple.com/us/app/sqlite-professional-sql-
coredata/id586001240?mt=12&at=11laRZ&ct=pro).

When using the simulator, hitting localhost:9000 is fine. On a device, not so
much; you need to hit your machine. [xip.io](http://xip.io/)to the rescue!
What it is: xip.io is a magic domain name that provides wildcard DNS for any
IP address. We use this heavily at work if the machine we’re on isn’t hooked
up to a subdomain or [Vagrant Share](https://www.vagrantup.com/blog/feature-
preview-vagrant-1-5-share.html).

We can use this wildcard to have our iPhone hit our laptop’s instance of
PonyDebugger.

First, get your IP. I use
[this](https://www.dropbox.com/s/mngjeqwe64z5zkl/MyIP.alfredworkflow) Alfred
workflow. Take note of your local IP.

Start PonyDebugger listening on that IP:

    
    
    ponyd serve —listen-interface=192.168.1.10
    

For handy access, alias this command:

    
    
    alias pony="ponyd serve --listen-interface=192.168.1.10"
    

Load Pony in your browser by appending your IP to the a xip.io URL:
<http://192.168.1.10.xip.io:9000/>

To access via the simulator or a device:

    
    
    let pony = PDDebugger.defaultInstance()
    pony.connectToURL(NSURL.URLWithString("ws://192.168.1.10.xip.io:9000/device"))
    pony.enableNetworkTrafficDebugging()
    pony.enableCoreDataDebugging()
    

