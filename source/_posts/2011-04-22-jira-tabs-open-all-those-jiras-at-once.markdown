---
author: tim
comments: true
date: 2011-04-22 18:21:22+00:00
layout: post
slug: jira-tabs-open-all-those-jiras-at-once
title: 'Jira Tabs: Open all those Jira''s at once! '
wordpress_id: 926
categories:
- Code
tags:
- javascript
- JIRA
---

Ever want to open all the Jira’s on the screen in new tabs? Jess does, I do, and you should too!

For firefox and chrome we now have the JiraTabs bookmark button.

Drag this link up to your bookmarks bar: [JiraTabs](javascript: function tab(where){ var elms = document.getElementById(where).getElementsByTagName('tr'); var conf=confirm('Do you want to open '+(elms.length-1)+' Jiras?'); if(conf){ for(var i=1; i<elms.length; i++){ var url = elms[i].getElementsByClassName('summary')[0].getElementsByTagName('a')[0]; window.open(url.href);}  } } tab('issuetable');). Then, whenever you are on a filter or search view of Jira's, click the button and all the jira's on your screen will open up in new tabs

Demo:



Any updates will be made [here](https://bitbucket.org/broderboy/jira-tabs/src).
