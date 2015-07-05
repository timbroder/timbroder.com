---
author: tim
comments: true
date: 2014-07-22 23:23:27+00:00
layout: post
slug: looping-subviews-downcasting-swift
title: Looping through subviews and downcasting in Swift
wordpress_id: 1598
categories:
- Code
tags:
- swift
---

I've been playing around with Auto-Layout. This snippet was helpful to see what constraints were set on what views in my View Hierarchy.

Getting the downcast right on the subviews Array took a few tries:

[swift]
func showAL(view: UIView) {
    println("!")
    println(view)
    println(view.constraints())
}

    for view in self.subviews as [UIView] {
        showAL(view)
        for subview in view.subviews as [UIView] {
            showAL(subview)
        }
    }
[/swift]
