---
author: tim
comments: true
date: 2011-03-15 23:31:01+00:00
dsq_thread_id: '255208339'
layout: post
link: ''
slug: setting-a-project-as-the-default-redmine-homepage
title: Setting a project as the default redmine homepage
wordpress_id: 874
category: Code
tags:
- Redmine
- Ruby
---

Only have a single project running on [redmine](http://www.redmine.org/)? want
it to be the homepage? 

In ```config/routes.rb in cofig/routes.rb```

```ruby
map.home '', :controller =&gt; 'projects', :action =&gt; 'show', :id =&gt; 'my_project_name'
```