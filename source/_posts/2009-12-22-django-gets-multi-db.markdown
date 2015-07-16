---
author: tim
comments: true
date: 2009-12-22 19:58:00+00:00
dsq_thread_id: '110028684'
layout: post
linked_list_url: ''
slug: django-gets-multi-db
title: Django gets Multi-DB
wordpress_id: 228
categories:
- Code
---

For his Google Summer of Code project [Alex
Gaynor](http://lazypython.blogspot.com/) added Multiple Database support to
Django, which just got pushed to Trunk.  
  
The Documentation is available
[here](http://docs.djangoproject.com/en/dev/topics/db/multi-db/).  
  
Some of the offhand benifits I can see:  

  1. Multiple of databases.  Got some legacy systems you don't want to migrate but have access to the data? no problem
  2. Have a read and a write database.  Want one of your databases to speed up by configuring faster indexes and disabling writes? done.
  3. Multiple TYPES of databases.  This is the one I'm most excited about.  This is going to enable people to use some of the NoSQL databases ([MongoDB](http://www.mongodb.org/), [CouchDB](http://couchdb.apache.org/), see [here ](http://en.wikipedia.org/wiki/NoSQL#List_of_NoSQL_open_source_projects)for a more complete list)  
  
For a great application of MongoDB on a news site see [Business
Insider](http://www.businessinsider.com/how-we-use-mongodb-2009-11)  
