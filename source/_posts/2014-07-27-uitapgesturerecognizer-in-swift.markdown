---
author: tim
comments: true
date: 2014-07-27 14:47:33+00:00
layout: post
slug: uitapgesturerecognizer-in-swift
title: UITapGestureRecognizer in Swift
wordpress_id: 1614
categories:
- Code
tags:
- swift
---

I have a subclass of UIView that has a label:



    
    class PlayerView : UIView {
        @IBOutlet weak var playLabel: UILabel!
    }
    




I want to attach a Tap Gesture to it:



    
        func setupObservers() {
            let playTap = UITapGestureRecognizer(target: self, action: "playTapped")
            playLabel(playTap)
        }
    
        func playTapped() {
            println("tapped")
        }
    
    
