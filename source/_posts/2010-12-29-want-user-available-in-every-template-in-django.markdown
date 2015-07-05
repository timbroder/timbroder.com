---
author: tim
comments: true
date: 2010-12-29 03:08:52+00:00
layout: post
slug: want-user-available-in-every-template-in-django
title: Want user available in every template in Django?
wordpress_id: 704
categories:
- Code
tags:
- django
- HOWTO
- python
---

Create a context processor

settings.py
[python]
TEMPLATE_CONTEXT_PROCESSORS = (
    'myapp.context_processors.user',
)
[/python]

context_processors.py
[python]
def user(request):
    if hasattr(request, 'user'):
        return {'user':request.user }
    return {}
[/python]

user is now available in any template:
[html]
{% if user.is_authenticated %}Do Something Special{% endif %}
[/html]

source: [stackoverflow](http://stackoverflow.com/questions/41547/always-including-the-user-in-the-django-template-context)
