---
author: tim
comments: true
date: 2010-01-07 17:05:00+00:00
layout: post
slug: override-querysetdelete-one-way-of
title: Override QuerySet.delete() (one way of preventing cascading deletes)
wordpress_id: 231
categories:
- Code
---

We needed to override the default QuerySet delete function to deal with a client problem that we were facing  

  

Yes This is monkey-patching, and probably bad practice but if anyone needs to conditionally override the cascading delete that django does at the application level from a queryset, this is how to do it  

  


    
    from django.db.models.query import QuerySet
    
    #save original delete method
    orrigdelete = QuerySet.delete
    def showdelete(self):
        #add on to delete method
        for test in self:
            if isinstance(test, YourObject):
                raise Exception('someone tried to delete your object')
                return  
            else:
                break   
        #call original delete
        return orrigdelete(self)
    
    #set the queryset delete as our new method
    QuerySet.delete = showdelete
    
