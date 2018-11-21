---
author: tim
comments: true
date: 2011-01-27 19:56:14+00:00
dsq_thread_id: '245713324'
layout: post
link: ''
slug: want-to-output-the-full-xml-config-magento-is-running
title: Want to output the full xml config Magento is running?
wordpress_id: 813
category: Code
tags:
- magento
- php
---

```PHP
Mage::getConfig()-&gt;getNode()-&gt;asNiceXml('full_config.xml');
```

Where full_config.xml is the file you want it dumped to. 