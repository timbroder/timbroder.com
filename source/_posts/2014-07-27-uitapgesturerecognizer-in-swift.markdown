---
author: tim
comments: true
date: 2014-07-27 14:47:33+00:00
dsq_thread_id: '2877329407'
layout: post
link: ''
slug: uitapgesturerecognizer-in-swift
title: UITapGestureRecognizer in Swift
wordpress_id: 1614
categories:
- Code
tags:
- swift
---

I have a subclass of UIView that has a label:

```swift
class PlayerView : UIView {
    @IBOutlet weak var playLabel: UILabel!
}
```

I want to attach a Tap Gesture to it:

```swift 
class PlayerView : UIView {
    @IBOutlet weak var playLabel: UILabel!
}
```