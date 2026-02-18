---
author: tim
comments: true
date: 2010-12-29 03:08:52+00:00
dsq_thread_id: '266390238'
layout: post
link: ''
slug: want-user-available-in-every-template-in-django
title: Want user available in every template in Django?
wordpress_id: 704
category: Code
tags:
- django
- HOWTO
- python
---

Create a context processor

settings.py

```python
TEMPLATE_CONTEXT_PROCESSORS = (
	'myapp.context_processors.user',
)
```

context_processors.py

```python
def user(request):
	if hasattr(request, 'user'):
		return {'user':request.user }
	return {}
```

user is now available in any template:

```HTML
{% verbatim %}
{% if user.is_authenticated %}Do Something Special{% endif %}
{% endverbatim %}
```

source: [StackOverflow](http://stackoverflow.com/questions/41547/always-including-the-user-in-the-django-template-context "StackOverflow")