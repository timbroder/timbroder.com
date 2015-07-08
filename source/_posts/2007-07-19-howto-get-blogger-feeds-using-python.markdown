---
author: tim
comments: true
date: 2007-07-19 03:07:00+00:00
dsq_thread_id: '111936092'
layout: post
linked_list_url: ''
slug: howto-get-blogger-feeds-using-python
title: 'HOWTO: Displaying Blogger feeds with Python'
wordpress_id: 24
categories:
- Code
tags:
- blogger
- gdata
- HOWTO
- python
---

This first HOWTO is going to cover how I did the basic structure of the posts
section of gPowered: pulling from blogger. The main functions we'll need are
to show a range of posts, a single post, and a function to get the total
number of posts that are in the blog. The reason I try to get the total number
is so the different pages can be bookmarkable. When retrieving a GData feed
from blogger. Entry 1 in the feed is going to be the newest post so there is
no 'id' that is going to be static, so we'll do a little math to get a number
we can later use as the id. I use Django to handle rendering the python to the
browser. I probably won't get into other methods.  
  
To start out you'll have to grab the following modules.  
\- the [gdata python client](http://code.google.com/p/gdata-python-
client/downloads/list)  
\- [ElementTree](http://effbot.org/zone/element-index.htm)  
\- [mxDateTime](http://www.egenix.com/products/python/mxBase/mxDateTime/) (I
used this for date formatting)  
  
We then import the parts the we'll need (you can ignore the Django part for
your own methods):  
  

    
    
    from Django.shortcuts import render_to_response
    
    from gdata import service
    import gdata
    import atom
    import getopt
    import sys
    
    from mx import DateTime
    

  
One of the first things we're going to have to do is authenticate with google
services. There are two ways to do this: [AuthSub proxy authentication](http:/
/code.google.com/apis/blogger/developers_guide_python.html#auth_sub) which has
a user login using their own credentials, and [ ClientLogin username/password 
authentication](http://code.google.com/apis/blogger/developers_guide_python.ht
ml#client_login) where you send a username and password. We will be using
ClientLogin. First off, set your login credentials to use later.  
  

    
    
    #login info
    user = 'timothy.broder@gmail.com'
    password = '********'
    

  
Then we start setting up our call to the service.  
  

    
    
    #set up service
    blogger_service = service.GDataService(user, password)
    blogger_service.source = 'gpowered'
    blogger_service.service = 'blogger'
    blogger_service.server = 'www.blogger.com'
    blogger_service.ProgrammaticLogin()
    

  
For more info see the [blogger developer's guide with
python](http://code.google.com/apis/blogger/developers_guide_python.html) or
the [Google Account Authentication
documentation](http://code.google.com/apis/accounts/Authentication.html)  
After we have authenticated with Google we need to start building up our query
to [GData](http://code.google.com/apis/gdata/), which will return as an
ElementTree of data. The first thing you'll need is your blog's id.  
You can use the function in the dev guide to help you with this if you don't
already know it.  
  

    
    
    def PrintUserBlogTitles(blogger_service):
      query = service.Query()
      query.feed = '/feeds/default/blogs'
      feed = blogger_service.Get(query.ToUri())
    
      print feed.title.text
      for entry in feed.entry:
        print "\t" + entry.title.text
    

  
After you have the blog id we can start working on the query  
  

    
    
    blog_id = 413573351281770670
    feed_url = '/feeds/%s/posts/default' % str(blog_id)
    query = service.Query()
    query.feed = feed_url
    

  
The below function returns the total number of posts that are in the feed. We
can get a small response by sending 0 for the max results. Below is the
function and the small response we get from it.  
  

    
    
    #get the total number of posts for this feed
    def get_total(query):
     #query for no posts
     query.max_results = '0'
     query.start_index = '1'
     
     #get back entryless feed
     feed = blogger_service.Get(query.ToUri()) 
     return int(feed.total_results.text)
    

  
  

    
    
    
     1
     0
     1
     Blogger
     Tim
     tag:blogger.com,1999:blog-413573351281770670
     
     
     
     
     gPowered
     2007-07-18T10:55:06.728-05:00
    
    

  
So we get the total number of posts and then we can start pulling data. Lets
make a generic function, PostFrom, that can be used to show multiple posts, or
just single ones, depending on what you pass to it. The start number that is
passed to PostFrom has been set to the first post in the blog is considered to
have an id of 1 and the latest post is the same as total_posts. This is useful
so if viewers want to bookmark the page they are looking at, the post that is
being displayed will not change. The following are the different functions
that will make use of it.  
  

    
    
    #show latest posts
    def Posts(request):
     return ListPosts(request, total_posts)
    
    #show posts starting from a certain point 
    def ListPosts(request, start):
     start = total_posts - int(start) + 1
     return PostFrom(request, start, show_num)
    
    #show a single post
    def Post(request, start):
     start = total_posts - int(start) + 1
     return PostFrom(request, start, 1)
     
    def PostFrom(request, start, count):
     #query for count number of posts starting at the given post
     query.max_results = str(count)
     query.start_index = str(start)
     feed = blogger_service.Get(query.ToUri())
    

  
now we have all the data we need in the feed variable. Its been turned into an
element tree so we don't have to worry about XML parsing here. Every node has
become an objects and lists. Objects for single nodes(title), and lists for
where there are multiple nodes of the same name (entry, link) At this stage I
play with the data a little so it's easier to use in my Django template.  
  

    
    
     #normalize data for output
     for entry in feed.entry:
      #get link for template
      entry.my_link = entry.link[0].href
      
      #id for links
      entry.my_id = curr_id
      curr_id -= 1
      
      #format published date
      dt = DateTime.ISO.ParseDateTimeUTC(entry.published.text)
      entry.my_date = dt.strftime('%m/%d/%Y')
      entry.my_time = dt.strftime('%I:%M %p') 
    

  
Of course we're going to need next and previous buttons as well. The way we've
set up the math with total_posts and the start number, we only have to
increment or decrement these by count (the number of posts to display on a
page). I also set part of the link, as well as the page title, that I will use
in my template.  
  

    
    
     prev = total_posts - (start - count) + 1
     if prev > total_posts:
      prev = None
      
      
     next = total_posts - (start + count) + 1
     if next < 1:
      next = None
     
     #showing single post 
     if count == 1:
      link = 'post'
      title = feed.entry[0].title.text
     #listing posts
     else:
      link = 'posts'
      title = 'home'
    

  
The final part of the function is a return to the Django framework to populate
my template. I'm going to get into the template more in the next post, but you
now have all the information you need stored.  
  

    
    
     return render_to_response('posts/index.html', {
      'entries': feed.entry,
      'title': title,
      'tag_link': tag_link, 
      'prev': prev,
      'next': next,  
      'link': link,
      'tab_home': True,
      })
    

  
To the template!  
  
The first part consists of displaying the post itself, along with its relevant
information  
  

    
    
    {% for entry in entries %}
    
      <h2><a href="/post/{{ entry.my_id }}">{{ entry.title.text }}</h2></a>
      {{ entry.content.text }}
      <p>Posted by {% for auth in entry.author %}{{ auth.name.text }}{% if not forloop.last %}, {% endif %}{% endfor %} 
      on {{ entry.my_date }} at {{ entry.my_time }}</p>
      {% if entry.category %}<p>Labels: {% for cat in entry.category %}
       <a href="{{ tag_link }}{{ cat.term }}">{{ cat.term }}</a>
       {% if not forloop.last %}, {% endif %}
       {% endfor %}</p>{% endif %}<p><a href="{{ entry.my_link }}">More...</a></p>
       
    {% endfor %}
    

  
And the second part handles the prev and next links  
  

    
    
      
    
    
    
    
    {% if prev %}
    [prev](/{{ link }}/{{ prev }})
    {% else %}
        
    {% endif %}
        
    {% if next %}
    [next](/{{ link }}/{{ next }})
    {% else %}
        
    {% endif %}
    
    
    
    {% include 'bottom.html' %}
    

  
That's all for now. A working example is the
[gPowered.net](http://gpowered.net/g/) site I'm putting up. All posts on there
are getting pulled from this blog. I'm going to get into tags and comments
next time, as well as javascript and php versions. Stay tuned!

