---
author: tim
comments: true
date: 2007-10-05 02:04:00+00:00
dsq_thread_id: '121343051'
layout: post
linked_list_url: ''
slug: displaying-what-you-read-in-google
title: Displaying what you read from Google Reader
wordpress_id: 81
categories:
- Code
tags:
- HOWTO
- python
- reader
---

I've been wanting to [share](http://www.gpowered.net/g/feeds/) what I
subscribe to in Google Reader and using the [functions I
wrote](http://gpowered.blogspot.com/2007/08/google-reader-api-functions.html)
I was able to do just that. Check out the article for the full run down on the
unofficial Google Reader API. This is written in python but should be easily
portable to php. If i get around to it, I want to make a WordPress plugin so
bloggers can share what they read with their readers. This will be followed
(or in parallel depending on my mood) with a Javascript version so Blogspot
users can do the same in the sidebar. On to the code!  
  
To start off we'll just copy the functions we need from [last
time](http://gpowered.blogspot.com/2007/08/google-reader-api-functions.html).
Generally this is the login and SID token functions, as well as the feed list
function.  

```python
from django.shortcuts import render_to_response
from django.template import Library
from elementtree import ElementTree
import urllib
import urllib2
import re

login = 'timothy.broder@gmail.com'
password = '***'
source = 'gPowered'

google_url = 'http://www.google.com'
reader_url = google_url + '/reader'
login_url = 'https://www.google.com/accounts/ClientLogin'
token_url = reader_url + '/api/0/token'
subscription_list_url = reader_url + '/api/0/subscription/list'

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

#get results from url
def get_results(SID, url):
    header = {'User-agent' : source}
    header['Cookie']='Name=SID;SID=%s;Domain=.google.com;Path=/;Expires=160000000000' % SID
    print url
    request = urllib2.Request(url, None, header)

    try :
        f = urllib2.urlopen( request )
        result = f.read()

    except:
        print 'Error getting data from %s' % url

    return result

#get a specific feed.  It works for any feed, subscribed or not
def get_feed(SID, url):
    return get_results(SID, get_feed_url + url.encode('utf-8'))

#get a token, this is needed for modifying to reader
def get_token(SID):
    return get_results(SID, token_url)

#get a list of the users subscribed feeds
def get_subscription_list(SID):
    return get_results(SID, subscription_list_url)
```

Then we'll want to get rid off all the information in the feed that we don't
want and load what we do into a data dictionary. After its in the dictionary,
feed names and links (and the folders they are in) are ready to be displayed.
As usual, I use Django to display my pages, but everything is the same up to
the final return in the Feeds method. Below is an example of what each
subscription looks like in the Google Reader Feed, and below that is how to
process it  

```XML
<object>
    <string name="id">feed/http://www.ubuntu.com/rss.xml</string>
    <string name="title">Ubuntu</string>
    <list name="categories">

        <object>
            <string name="id">user/16162999404522159936/label/dev</string>
            <string name="label">dev</string>
        </object>
    </list>
    <number name="firstitemmsec">1186137757794</number>
</object>
```

```python
class myFeed:
    def __init__(self, name, link):
        self.name = name
        self.link = link

def Feeds(request):
    SID = get_SID()
    feeds = get_subscription_list(SID)
    tree = ElementTree.fromstring(feeds)
    d = dict()

    #loop through each feed
    for object in tree.findall('list')[0].findall('object'):
        strings = object.findall('string')
        key = object.findall('list')[0].findall('object')[0].findall('string')[1].text

        #tag already exists, add to the list
        try:
            d[key].append(myFeed(strings[1].text, strings[0].text.replace('feed/', '')))
        #tag doesn't exist, create list
        except KeyError:
            d[key] = [myFeed(strings[1].text, strings[0].text.replace('feed/', ''))]


    return render_to_response('pages/feeds.html', {
    'feeds': d,
    })
```

For those of you that use django or are just curious how I end up displaying
the feeds, this is what i have in my view:  

```html

### My Reading
{% verbatim %}
{% for item in feeds.items %}
	{{ item.0 }}
	{% for feed in item.1 %}
		[{{ feed.name }}]({{ feed.link }})
	{% endfor %}
{% endfor %}
{% endverbatim %}
``` 
  
Again, too see what I subscribe to, [click
here](http://www.gpowered.net/g/feeds/)

