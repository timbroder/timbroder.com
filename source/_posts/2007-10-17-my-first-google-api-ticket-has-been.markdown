---
author: tim
comments: true
date: 2007-10-17 02:57:00+00:00
dsq_thread_id: '110342015'
layout: post
linked_list_url: ''
slug: my-first-google-api-ticket-has-been
title: My First Google API ticket has been fixed
wordpress_id: 90
categories:
- Code
tags:
- Docs Spreadsheets
---

My first [ticket](http://code.google.com/p/gdata-issues/issues/detail?id=44)
for the Google Document List API has been fixed. As I posted about
[before](http://gpowered.blogspot.com/2007/08/quick-docs-api-example-
python.html), the Document List API did not have the ability to just retrieve
the documents from a given folder or tag. This has now been made possible,
thanks API team!  
  
Original ticket:  
  

> It would be ideal if we could pull back a list of documents from a certain
folder. This would give more functionality and make the size of the data
smaller if you only needed to grab a list of file from a certain folder.  
  
Possibly something like: ```gdata.docs.service.DocumentQuery(folder=['myfolder1'])```
or ```gdata.docs.service.DocumentQuery(folders=['myfolder1','folder2'])```

  

