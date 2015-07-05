---
author: tim
comments: true
date: 2011-03-15 23:31:01+00:00
layout: post
slug: setting-a-project-as-the-default-redmine-homepage
title: Setting a project as the default redmine homepage
wordpress_id: 874
categories:
- Code
tags:
- Redmine
- Ruby
---

Only have a single project running on [redmine](http://www.redmine.org/)? want it to be the homepage?
in config/routes.rb


in cofig/routes.rb
[ruby]map.home '', :controller => 'projects', :action => 'show', :id => 'my_project_name'[/ruby]
