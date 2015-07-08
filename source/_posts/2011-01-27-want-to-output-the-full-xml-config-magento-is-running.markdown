---
author: tim
comments: true
date: 2011-01-27 19:56:14+00:00
dsq_thread_id: '245713324'
layout: post
linked_list_url: ''
slug: want-to-output-the-full-xml-config-magento-is-running
title: Want to output the full xml config Magento is running?
wordpress_id: 813
categories:
- Code
tags:
- magento
- php
---

[php] Mage::getConfig()-&gt;getNode()-&gt;asNiceXml('full_config.xml'); [/php]
Where full_config.xml is the file you want it dumped to.

