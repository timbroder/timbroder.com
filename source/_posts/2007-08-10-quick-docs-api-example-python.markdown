---
author: tim
comments: true
date: 2007-08-10 03:04:00+00:00
dsq_thread_id: '110061397'
layout: post
linked_list_url: ''
slug: quick-docs-api-example-python
title: Quick Docs Api Example (python)
wordpress_id: 33
categories:
- Code
tags:
- Docs Spreadsheets
- gdata
- HOWTO
- python
---

To use the gdata docs python client you need to upgrade to
[1.0.7](http://code.google.com/p/gdata-python-client/downloads/list) or
higher. First thing is to import the modules you'll need.  
  

    
```python
import gdata.docs.service
import gdata.docs
```

  
Then, set up the usual authentication parameters for the client.  
  

    
```python
gd_client = gdata.docs.service.DocsService()
gd_client.email = 'timothy.broder'
gd_client.password = '*****'
gd_client.source = 'gpowered-docs-list-ex'
gd_client.ProgrammaticLogin()
```

  
The most basic query will just return all of your documents  
  

    
```python    
feed = gd_client.GetDocumentListFeed()
```    

  
However, if we want to display just the spreadsheets, we build the query like
this:  
  

    
```python
q = gdata.docs.service.DocumentQuery(categories=['spreadsheet'])
feed = gd_client.Query(q.ToUri())
```

  
Finally, we output the titles  
  

    
```python    
if(len(feed.entry) == 0):
        print 'No entries in feed.\n'
for i, entry in enumerate(feed.entry):
        print '%s %s (%s)' % (i+1, entry.title.text.encode('UTF-8'))
```

  
If we wanted to, we could also import the DateTime library and show when the
document was last updated  
  

    
```python
import gdata.docs.service
import gdata.docs

from mx import DateTime

gd_client = gdata.docs.service.DocsService()
gd_client.email = 'timothy.broder'
gd_client.password = '*****'
gd_client.source = 'gpowered-docs-list-ex'
gd_client.ProgrammaticLogin()

q = gdata.docs.service.DocumentQuery(categories=['spreadsheet'])
#feed = gd_client.GetDocumentListFeed()
feed = gd_client.Query(q.ToUri())

if(len(feed.entry) == 0):
        print 'No entries in feed.\n'
for i, entry in enumerate(feed.entry):
        dt = DateTime.ISO.ParseDateTimeUTC(entry.updated.text)
        print '%s %s (%s)' % (i+1, entry.title.text.encode('UTF-8'), dt.strftime('%m/%d/%Y %I:%M %p'))
```

  
  
For me this outputs:

    
```
1 TDP2006 Contact Info (11/18/2006 05:41 AM)
2 contact info (07/23/2006 08:15 PM)
3 Tim and Rob (08/09/2007 10:18 PM)
4 nyc happy hour spreadsheet (07/04/2007 08:25 PM)
5 public_spring_2006_roster (10/16/2006 12:40 AM)
6 dax2006 (11/12/2006 11:23 PM)
7 project dream (07/13/2007 03:54 AM)
8 Stuff Tim should get (06/13/2007 01:53 AM)
9 Erg Test Results - 9/26 (10/15/2006 01:02 AM)
10 Head of the Charles Regatta Itineary (10/17/2006 04:54 PM)
11 tvshows (11/02/2006 11:44 PM)
12 HF (10/01/2006 03:36 PM)
```

