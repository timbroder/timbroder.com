---
author: tim
comments: true
date: 2009-12-17 17:03:00+00:00
layout: post
slug: sneak-some-advanced-logic-into-django
title: Sneak some advanced logic into a Django template
wordpress_id: 226
categories:
- Code
---

I was adding on an app to a Django project at work where I was overriding an existing template but did not have access to the view that called that template.  I was left in a scenario where I had the variables that the view was originally set up with, but non of the new models that I had added.  

  

In a filter you can do whatever logic you want, and then pass information back to the view.  Please keep in mind, this is probably a horrible practice, but it does have its uses.  In this specific scenario I needed to query the new models without modifying the existing view, solution: add a filter and do the querying there.  

  

This is the filter that I used to do the querying:  


    
    from django import template
    from stager.jira.models import JiraProject, ProjectLink
    from stager.staging.models import *
    
    register = template.Library()
    
    def has_jira(value, arg):
        client = Client.objects.get(path=value)
        project = client.projects.get(path=arg)
        try:
            jiras = ProjectLink.objects.get(ClientProject=project).JiraProject.exclude(filter_id='')
            return True
        except:
            return False
    register.filter('has_jira', has_jira)
    

  

Then, in my template:  


    
    {% load has_jira %}
    {% if client.path|has_jira:project.path %}
         <li><a href="jira/projects">Jira</a></li>
    {% endif %}
    

  

A more general example if this would be to work around the annoyance of not being able to have multiple tests in an if statement in a template: You can't do {% if this and that %}  

  

A solution would be:  


    
    def if_and(value, arg):
        if value and arg:
            return True
        else:
            return False
        
    def if_or(value, arg):
        if value or arg:
            return True
        else:
            return False
    

  


    
     {% if True|if_and:False %}
     show
     {% else %}
     don't show
     {% endif %}
    

  

Let me know your thoughts, pros/cons of this method.  
  


Ai's stager project is open source and can be found at [github](http://github.com/aiaio/ai-stager)
