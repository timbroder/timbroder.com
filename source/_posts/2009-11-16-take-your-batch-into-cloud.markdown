---
author: tim
comments: true
date: 2009-11-16 22:07:00+00:00
dsq_thread_id: '109993705'
layout: post
linked_list_url: ''
slug: take-your-batch-into-cloud
title: Take your batch into the cloud
wordpress_id: 223
categories:
- Code
---

From the work blog:  
  
[Take your batch into the
cloud](http://www.alexanderinteractive.com/blog/2009/11/take-your-batch-into-the-cloud.html): "

About a year ago I wrote a webapp called
[twitter2gtalk](http://twitter2gtalk.appspot.com), which simply takes your
latest Twitter message and sets it as your Google [Talk
](http://www.google.com/talk/)Status. Shortly there after I attended an [App
Engine](http://code.google.com/appengine/) Hackathon (GAE) at Google NYC. At
the hackathon, I started porting the app over to app engine. At the time,
there was no scheduling or cron support in GAE. I created a hybrid app running
between GAE and my webfaction server. My webfaction server would handle the
cron, proxy out the requests, and do some of the longer running tasks (the
limit on an app engine request is 20 seconds).  
  
Now with the release of the [Task
Scheduler](http://code.google.com/appengine/docs/python/config/cron.html) and
[Task Queues](http://code.google.com/appengine/docs/python/taskqueue/), you
can break up a long winded process into the cloud. My batch was taking around
18 minutes to run, with about 800 users being processed each time. For each
user the app had to get their Twitter status, then connect to Google's xmpp
server, and after a couple of xmpp calls, update the Google Talk Status. Even
being single threaded, this whole process started eating up a lot of juice on
the server. The rest of my apache processes suffered and the entire site
slowed down  
  
Using the new app engine features, I was able to do two things: 1) Move the
scheduling into app engine itself and 2) have app engine do the bulk of the
work, by having each user-update be its own task. These worker tasks are then
processed anywhere in the cloud, and can be run in parallel, independently of
each other

The original code was something like:  
  
```
    for users in all my users:  
         get twitter status  
         connect to gtalk  
         get current status  
         update status
```

My process for converting this to app engine tasks was as follows:  
1. Create a process to load all of the users into a Task Queue  
1. Set up each Task Queue so that it can independently do the work for the
user that it is associated with  
1. Schedule Step 1 to run every half hour  
  
Skeleton Code for Step 1:

```python
    class TaskLoader(BaseRequestHandler):

        def get(self):  
            logging.info("Starting to load tasks %s" %
datetime.datetime.now())

            users = Account.gql('WHERE active = :1', True)  
  
            count = 0  
            for user in users:

                send_key = # data to send to the worker  
                taskqueue.add(url='/worker/', params={'key': send_key})

                count += 1  
  
            logging.info("Ended load tasks (%d users) %s" % (count,
datetime.datetime.now()))  
```
  
The Url call for this method: ('/taskloader/', TaskLoader),

The Skeleton code for step 2:  
  
```python
    class TaskWorker(BaseRequestHandler):  
         def post(self):  
             key = self.request.get('key')

             t = ''.join(["http://django.gpowered.net/xmppproxy/", key])

             logging.info("URL !%s!" % t)  
             result = urlfetch.fetch(t,  
                     None,  
                     urlfetch.GET,  
                     {'Cache-Control':'no-cache,max-age=0', 'Pragma':'no-
cache'})  
```
  
Url call for this method: ('/worker/', TaskWorker),

So, TaskLoader loads all of the users into the Task queue. App Engine
processes these when it has the cpu cycles to do so, and for each of these,
TaskWorker is called  
  
I can schedule these using cron.yaml in my project:  
  
cron:  
```
description: load the task queue  
url: /taskloader/  
schedule: every 30 minutes  
```
  
This is a general overview of how to break up your batch in to smaller, easier
to manage tasks. Please see the App Engine [documentation
](http://code.google.com/appengine/docs/python/overview.html)for more detailed
information.