---
author: tim
comments: true
date: 2009-09-30 19:51:00+00:00
dsq_thread_id: '109993689'
layout: post
link: ''
slug: checking-if-remote-file-exists-in
title: Checking if a remote file exists in python
wordpress_id: 216
categories:
- Code
---

Normally, to check if a remote web file exists I would use urllib's getcode()
but that is a 2.6 and newer feature.  In Python 2.5 its a little more
interesting.  Thankfully, wget's spider command can help us out.  
  
  
```python
from subprocess import Popen, PIPE
def url_exists(url):
    command = ["wget", "-S", "--spider", url]
    p = Popen(command, stdout=PIPE, stderr=PIPE)
    stdout, stderr = p.communicate()
    exists = stderr.find('ERROR 404')
    if int(exists) > -1:
        return False
    else:
        return True
```