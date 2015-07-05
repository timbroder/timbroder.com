---
author: tim
comments: true
date: 2007-08-11 18:25:00+00:00
layout: post
slug: howto-getting-list-of-post-titles-from
title: 'HOWTO: Getting a list of post titles from blogger (Python)'
wordpress_id: 34
categories:
- Code
tags:
- blogger
- HOWTO
- python
---

This will be a quick one on how to pull the titles from your blog.  I'm using it to [Lists the posts](http://gpowered.net/g/postlist) I have available on [gPowered.net](http://gpowered.net/g/).  Firstly we'll set up our imports and call to the blogger service.  
  



    
    
    from elementtree import ElementTree 
    from gdata import service
    import gdata
    import atom
    import getopt
    import sys
    
    blog_id = 413573351281770670
    blogger_service = service.GDataService('timothy.broder@gmail.com', '*****')
    blogger_service.source = 'Blogger_Python_Sample-1.0'
    blogger_service.service = 'blogger'
    blogger_service.server = 'www.blogger.com'
    blogger_service.ProgrammaticLogin()
    

  


For this query we're going to use the summary feed because all we really need for this is the titles, not the full posts:  
  


    
    
    query = service.Query()
    query.feed = '/feeds/' + str(blog_id) + '/posts/summary'
    feed = blogger_service.Get(query.ToUri())
    

  


Then I just do a little counting so I can use the links on my site.  All the information we need is in feed.entry  
  


    
    
    curr_id = int(feed.total_results.text)
    for entry in feed.entry:
     entry.my_id = curr_id
     curr_id -= 1
    
