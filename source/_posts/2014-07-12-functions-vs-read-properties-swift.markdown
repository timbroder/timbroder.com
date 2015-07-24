---
author: tim
comments: true
date: 2014-07-12 23:22:03+00:00
dsq_thread_id: '2838888640'
layout: post
link: ''
slug: functions-vs-read-properties-swift
title: Functions or Read-Only Properties in Swift?
wordpress_id: 1589
categories:
- Code
tags:
- swift
---

I’m not sure which is better.  If it's returning something that is directly
tied to the class: a slice/dice of properties is already has, I'm leaning
towards properties. Because of the many examples I _feel_ like read-only
properties are the way to do.  I’m not the only person
[wondering](http://stackoverflow.com/questions/24035276/computed-read-only-
property-vs-function-in-swift), so that’s validating.

Property:

```c
extension String {
    var fullSentences: [String] {
        // stuff
    }
}
```

Function:

```c
extension String {
    func fullSentences() -&gt; [String] {
        // stuff
    }
}
```