---
author: tim
comments: true
date: 2011-02-11 18:35:44+00:00
dsq_thread_id: '243134417'
layout: post
linked_list_url: ''
slug: a-note-on-magento-and-multiple-nodes-using-memcached
title: A note on Magento and multiple nodes using Memcached
wordpress_id: 831
categories:
- Code
tags:
- magento
- Memcached
- php
- xml
---

If you have multiple nodes using a shared memcached server, make sure you
define a shared prefix for the keys to use. In local.xml: [xml] &lt;cache&gt;
... &lt;prefix&gt;a1i&lt;/prefix&gt; &lt;id_prefix&gt;a1i&lt;/id_prefix&gt;
&lt;memcached&gt; ... [/xml]

