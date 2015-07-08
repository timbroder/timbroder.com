---
author: tim
comments: true
date: 2014-07-27 02:11:16+00:00
dsq_thread_id: '2876238035'
layout: post
linked_list_url: ''
slug: creating-a-conforming-delegate-uitableviewdelegate-in-swift
title: Creating a conforming delegate (UITableViewDelegate) in Swift
wordpress_id: 1606
categories:
- Code
tags:
- swift
---

This tripped me up for a bit so I hope this helps someone.

I started out with this class, thinking I could just continue on my merry way.
This errors in Xcode with: "_class does not conform to NSObjectProtocol_”

    
    
    class FastListUITableViewDelegate : UITableViewDelegate {
        
    }
    

Hmm ok, but much there yet, what did I miss? This should definitely be a
class; not a protocol (I have methods to implement), not a @class_protocol
(wrong use, based on the docs), hmm.

This obviously behaves different than in objective-c. What is inherent in the
obj-c version of this that would conform to NSObjectProtocol? NSObject. Every
class and C eventually rolls up to this…

This is working so far:

    
    
    class FastListUITableViewDelegate : NSObject, UITableViewDelegate {
        
    }
    

I’ll report back here if this solution changes

