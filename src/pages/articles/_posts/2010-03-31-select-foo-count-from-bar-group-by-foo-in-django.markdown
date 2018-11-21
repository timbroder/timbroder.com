---
author: tim
comments: true
date: 2010-03-31 16:31:06+00:00
dsq_thread_id: '110651684'
layout: post
link: ''
slug: select-foo-count-from-bar-group-by-foo-in-django
title: select foo, count(*) from bar group by foo in django
wordpress_id: 247
categories:
- Code
tags:
- django
- HOWTO
- python
---

Every once in a while you need some old fashion SQL style queries in django.
This is a common one for reporting and aggregation.  Its fairly easy to
replicate in a queryset.  Say I wanted to get the authors and the number of
articles they have written going back to the beginning of 2009 to the
present:﻿


```python
from django.db.models import Count
Article.objects
	.filter(created_date__gte=datetime.datetime(2009,1,1))
	.values('author')
	.annotate(Count('author'))
```


The result:


```
[{'author__count': 1028, 'author': 17L}, {'author__count': 9, 'author': 9L}, {'author__count': 39, 'author': 12L}, {'author__count': 581, 'author': 10L}, {'author__count': 15, 'author': 7L}, {'author__count': 366, 'author': 13L}, {'author__count': 233, 'author': 5L}, {'author__count': 167, 'author': 15L}, {'author__count': 287, 'author': 14L}, {'author__count': 10, 'author': 6L}, {'author__count': 2101, 'author': 16L}]
```