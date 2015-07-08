---
author: tim
comments: true
date: 2007-08-30 03:32:00+00:00
dsq_thread_id: '111954297'
layout: post
linked_list_url: ''
slug: getting-numerof-diggs-from-digg
title: 'HOWTO: Getting the Numer of Diggs from Digg (Python)'
wordpress_id: 55
categories:
- Code
tags:
- HOWTO
- python
---

After 2 of my posts were on the Digg front page this morning (Thank you all
very much to those that dugg them), I took my first look into the [Digg
API](http://apidoc.digg.com/). I wanted a way to take a quick look to see how
many Diggs certain stories were getting. In some ways it is similar to GData:
make a call to a URL, get some XML back, parse it, etc. It does, however, feel
lighter, probably due to its streamlined nature. It has one purpose, get
information off of Digg. Using this, I've added a section in the [Post
List](http://gpowered.net/g/postlist/) section of gPowered.net that shows the
Diggs of a few of the articles that I have submitted on Digg.  
  
The API is broken into 5 main sections or endpoints. Each of these will return
related types of data:  
\- Stories  
\- Events  
\- Users  
\- Topics  
\- Errors  
  
In this quick HOWTO I'm going to take a quick look into the Stories endpoint
so I can display the number of Diggs specific stories have. We'll start off by
making a small class to hold our returned data (useful to send to a template
or just for working with later on. We don't want to keep having to hit the
ElementTree to get data out). All of the calls will be send to
'http://services.digg.com/'. In this example I will only be querying
'http://services.digg.com/story/{story clean title}'.  
  

    
    
    import httplib2  
    from elementtree import ElementTree  
    
    #for storing
    class MyDigg:
     def __init__(self, title, link, digg, diggs):
      self.title = title
      self.link = link
      self.digg = digg
      self.diggs = diggs
     
     def __str__(self):
      return self.title + ' ' + self.diggs
    
    #stories to get diggs of  
    posts = [
     'Google_NOT_releasing_it_s_Goobuntu_Desktop_OS_STOP_DIGGING_IT', 
     'New_Digg_Home_Page_breaks_the_Linux_section_on_IE',
     'Google_Reader_API_Functions'
     ]
     
    #hold returned info
    my_diggs = []
    
    #all calls go through this
    digg_service = 'http://services.digg.com/'
    
    #just looking at stories
    service_endpoint = digg_service + 'story/%s'
    
    #only need 1 result back
    trailer = '?count=1&appkey;=http%3A%2F%2Fgpowered.blogspot.com'
    
    #keep track of total diggs
    total_diggs = 0
    

  
  
After we are set up, we will want to loop through each story we want to get
Digg data for. Add the well formed title into the query string, and send it to
the Digg service. Then, parse the response, and get the information we need.  
  

    
    
    for story in posts:
     curr_story = service_endpoint % story
     url = curr_story + trailer
    
     h = httplib2.Http() 
     resp, content = h.request(url, "GET", body="nt", headers={'content-type':'text/plain'} )
     
     story = ElementTree.fromstring(content).findall('story')[0]
     
     d = MyDigg(story.findall('title')[0].text, story.get('link'), story.get('href'), story.get('diggs'))
     total_diggs = total_diggs + int(d.diggs)
     my_diggs.append(d)
     print d
    
    print 'Total: ' + str(total_diggs)
    

  
  
And that's that. my_diggs now has all the information we need!

