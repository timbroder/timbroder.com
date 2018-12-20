---
author: tim
comments: true
date: 2007-08-11 21:22:00+00:00
dsq_thread_id: '113567183'
layout: post
link: ''
slug: howto-pulling-google-bookmarks-with
title: 'HOWTO: Pulling Google Bookmarks with Python'
wordpress_id: 35
category: Code
tags:
- bookmarks
- HOWTO
- python
- YUI
---

I love using [Google Bookmarks](http://www.google.com/bookmarks/) (usually
with the [Google Toolbar](http://toolbar.google.com)) because it lets me get
to my bookmarks at home on my laptop or desktop, at work, or anywhere. It's
great. Now I'm using those bookmarks to power the
[links](https://gpowered.net/g/links/) section of
[gPowered.net](https://gpowered.net/g)  
First we're going to need the
[httplib2](http://code.google.com/p/httplib2/downloads/list) library so we can
authenticate against Google and grab the bookmark feed and then the
[ElementTree](http://effbot.org/zone/element-index.htm) to help process the
rss feed.  
  

    
    
    import httplib2
    from elementtree import ElementTree
    

  
Then we'll setup the link to pull the rss from, authenticate against the
request, and pull back the feed  
  

    
    
    login = "timothy.broder@gmail.com"  
    password = "*****"
    url = 'https://www.google.com/bookmarks/?output=rss&num;=1000'  
      
    h = httplib2.Http()  
    h.add_credentials(login, password)  
     
    resp, content = h.request(url, "POST", body="nt", headers={'content-type':'text/plain'} )
    

  
I figured for this a hashmap (or dictionary) would work well using the tags on
the bookmarks as keys, pointing to lists of bookmarks. Then when we display
them, just iterate through the keys. I also kept a list of the keys to make
sorting faster later on. So we define our objects and then loop through the
rss object pulling out the tags for keys, the names of the links, and the
urls. I define a small Bookmark class which holds a name and url which will go
into the hashmap to make storing the bookmark's easier. When I try to add a
bookmark to the dict's list I try to append it, if the key(tag) doesn't exist
I know I have to start a new list.  
  

    
    
    class Bookmark:
     def __init__(self, name, link):
      self.name = name
      self.link = link
      
    d = dict()
    sort_keys = []
    for item in tree.findall('item'):
     key = item.findtext('{http://www.google.com/searchhistory}bkmk_label')
     if (key != None) and (key != 'gpowered') and (key != 'BP') and (key != 'Quick Searches') and (key != 'Me'):
      title = item.findtext('title')
      link = item.findtext('link')
      try:
       d[key].append(Bookmark(title.encode('utf-8'), link))
      except KeyError:
       d[key] = [Bookmark(title.encode('utf-8'), link)]
       sort_keys.append(key)
    

  
Then we'll sort the key list and the list of each key. To do this we need a
small function that defines how to sort a bookmark  
  

    
    
    def bookmark_compare(a, b):
     return cmp(a.name, b.name)
    
    sort_keys.sort() 
    for key in sort_keys:
     d[key].sort(bookmark_compare)
    

  
Check out the static HTML version [Here](https://gpowered.net/g/links/simple).
I also made a [fancier version](https://gpowered.net/g/links/) using
[YUI](http://developer.yahoo.com/yui/)'s
[TreeView](http://developer.yahoo.com/yui/treeview/)

