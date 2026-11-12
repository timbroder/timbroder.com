---
author: tim
comments: true
date: 2007-08-23 02:57:00+00:00
dsq_thread_id: '110347319'
layout: post
link: ''
slug: google-reader-api-functions
title: 'HOWTO: Google Reader API Functions'
wordpress_id: 44
category: Code
tags:
- HOWTO
- python
- reader
---

I've been wanting an API for Google reader since I started using it, and
especially since i started gPowered so I could display a list of the feeds I
read on the site. The official word on an API for reader is "It's coming in a
few weeks," but that was back in late 2005. The reason being that at the time,
the URLs the API would use were going to change a lot. So, after a bit of
research and coding I came up with some python functions to do the job.  

The first step was authenticating against Google accounts without using the
[client library](http://code.google.com/p/gdata-python-client/). The Python
Gdata Library makes login very easy but Reader isn't part of the Client
Library yet (maybe I'll try to add it, we'll see...) but
[this](http://djcraven.blogspot.com/2006/10/success-posting-to-blogger-beta-using.html) was the method I was using for gdata and python pre-Client
Library, and the principles still hold true for working with Reader.
Thankfully, most of the [research](http://www.niallkennedy.com/blog/archives/2005/12/google_reader_a.html) for working with the 'Reader API' was done for me
already by Niall Kennedy. This is an unofficial, unsupported API and the URLs
for some of the queries have changed since the writing of that article. Here
we go...  
  
We're going to use urllib(2) to handle the communication with this one. I
rather would have used httplib, but I was having trouble with the
authentication cookie. Each retrieval has its own URL to query against  

```python
import urllib
import urllib2
import re

login = 'timothy.broder@gmail.com'
password = '****'
source = 'gPowered'

google_url = 'http://www.google.com'
reader_url = google_url + '/reader'
login_url = 'https://www.google.com/accounts/ClientLogin'
token_url = reader_url + '/api/0/token'
subscription_list_url = reader_url + '/api/0/subscription/list'
reading_url = reader_url + '/atom/user/-/state/com.google/reading-list'
read_items_url = reader_url + '/atom/user/-/state/com.google/read'
reading_tag_url = reader_url + '/atom/user/-/label/%s'
starred_url = reader_url + '/atom/user/-/state/com.google/starred'
subscription_url = reader_url + '/api/0/subscription/edit'
get_feed_url = reader_url + '/atom/feed/'
```

When we authenticate against Google Reader with a gmail account and password
in the browser, a cookie is stored. We'll have to recreate the values in this
cookie. The static values are the Domain (.google.com), the Path (/), and
Expires (we'll use 160000000000). The unique value, based on the current login
session, is the SID (Session ID?), which we will need to retrieve. We'll do
the login and retrieval in the same function:  

```python
#login / get SED
def get_SID():
    header = {'User-agent' : source}
    post_data = urllib.urlencode({ 'Email': login, 'Passwd': password, 'service': 'reader', 'source': source, 'continue': google_url, })
    request = urllib2.Request(login_url, post_data, header)

    try :
        f = urllib2.urlopen( request )
        result = f.read()

    except:
        print 'Error logging in'

    return re.search('SID=(\S*)', result).group(1)
```

We'll also need a function that can handle any of those URLs, create the
header, attach a cookie to it, and retrieve the data from Google. I left the
return as a raw data string so you could use whatever XML parsing library you
want. I personally like using [ElementTree](http://effbot.org/zone/element-
index.htm).  

```python
#get results from url
def get_results(SID, url):
    header = {'User-agent' : source}
    header['Cookie']='Name=SID;SID=%s;Domain=.google.com;Path=/;Expires=160000000000' % SID

    request = urllib2.Request(url, None, header)

    try :
        f = urllib2.urlopen( request )
        result = f.read()

    except:
        print 'Error getting data from %s' % url

    return result
```

The following methods are the calls that I've gotten working so far; I'm going
to keep working on the 'edit' functions, like adding, removing feeds, changing
tags, etc. See the comments for what they do. Note: Any edit against the API
needs to send over a changing token as part of the call  

```python
#get a token, this is needed for modifying to reader
def get_token(SID):
    return get_results(SID, token_url)

#get a specific feed.  It works for any feed, subscribed or not
def get_feed(SID, url):
 return get_results(SID, get_feed_url + url.encode('utf-8'))

#get a list of the users subscribed feeds
def get_subscription_list(SID):
    return get_results(SID, subscription_list_url)

#get a feed of the users unread items
def get_reading_list(SID):
    return get_results(SID, reading_url)

#get a feed of the users read items
def get_read_items(SID):
    return get_results(SID, read_items_url)

#get a feed of the users unread items of a given tag
def get_reading_tag_list(SID, tag):
        tagged_url = reading_tag_url % tag
        return get_results(SID, tagged_url.encode('utf-8'))

#get a feed of a users starred items/feeds
def get_starred(SID):
    return get_results(SID, starred_url)

#subscribe of unsubscribe to a feed
def modify_subscription(SID, what, do):
    url = subscription_url + '?client=client:%s&ac;=%s&s;=%s&token;=%s' % ( login, do.encode('utf-8'), 'feed%2F' + what.encode('utf-8'), get_token(SID) )
    print url
    return get_results(SID, url)

#subscribe to a feed
def subscribe_to(SID, url):
    return modify_subscription(SID, url, 'subscribe')

#unsubscribe to a feed
def unsubscribe_from(SID, url):
    return modify_subscription(SID, url, 'unsubscribe')
```
  
Example usage:  

```python
SID = get_SID()
print get_subscription_list(SID)
#print get_reading_list(SID)
#print get_read_items(SID)
#print get_reading_tag_list(SID, 'me')
#print get_reading_tag_list(SID, 'nada-mas')
#print get_starred(SID)
#print get_token(SID)

#test_feed = 'http://picasaweb.google.com/data/feed/base/user/timothy.broder/albumid/5101347429735335089?kind=photo&alt;=rss&hl;=en_US'

#print subscribe_to(SID, test_feed)
#returns ok but I don't see the feed in reader?

#print get_feed(SID, test_feed)
```

Like I said, I'd like to keep going with this and get the edit functionality
to work better. I'm also going to take a look into the Client Library and see
if I could set this up as a patch that people could use if they wanted to use
the API.

