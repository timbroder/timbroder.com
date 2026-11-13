---
author: tim
comments: true
date: 2010-02-09 18:48:00+00:00
dsq_thread_id: '110651160'
layout: post
link: ''
slug: get-admin-url-for-django-model
title: Get the admin url for a django model
wordpress_id: 233
category: Code
---

Add this to your model to be able to get their admin change link from anywhere  

Useful if you want to jump to the admin screen of an object you are looking at
on the front end  



```python
from django.core import urlresolvers
from django.contrib.contenttypes.models import ContentType

def get_admin_url(self):
    content_type = ContentType.objects.get_for_model(self.__class__)
    return urlresolvers.reverse("admin:%s_%s_change" % (content_type.app_label, content_type.model), args=(self.id,))
```
