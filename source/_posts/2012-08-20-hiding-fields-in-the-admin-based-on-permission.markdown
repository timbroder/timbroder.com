---
author: tim
comments: true
date: 2012-08-20 16:53:46+00:00
dsq_thread_id: '812236822'
layout: post
linked_list_url: ''
slug: hiding-fields-in-the-admin-based-on-permission
title: Hiding fields in the Django admin based on permission
wordpress_id: 1164
categories:
- Code
tags:
- django
- python
---

Quick and easy if you have one group of users that can only edit an asset, and
another group that has publishing rights 

```python
def remove_from_fieldsets(fieldsets, fields):
    for fieldset in fieldsets:
        for field in fields:
            if field in fieldset[1]['fields']:
                new_fields = []
                for new_field in fieldset[1]['fields']:
                    if not new_field in fields:
                        new_fields.append(new_field)
                        
                fieldset[1]['fields'] = tuple(new_fields)
                break

class PositionAdmin(admin.ModelAdmin):
    ...
    def get_fieldsets(self, request, obj=None):
        fieldsets = super(PositionAdmin, self).get_fieldsets(request, obj)
    
        if not request.user.is_superuser and request.user.groups.filter(name='publisher').count() == 0:
            remove_from_fieldsets(fieldsets, ('is_published',))
        return fieldsets
```