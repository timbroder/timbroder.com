---
author: tim
comments: true
date: 2012-08-18 00:50:47+00:00
dsq_thread_id: '809518683'
layout: post
linked_list_url: ''
slug: animate-adwhirl-bottom
title: Animate an AdWhirlView from the Bottom of the Screen
wordpress_id: 1154
categories:
- Code
tags:
- adwhirl
- ipad
- iphone
- objective c
- os
- xcode
---

If you are using [AdWhirl](https://www.adwhirl.com/) and want the ad to slide
in from the bottom of the screen when your View loads, use this snippet: [c]
\- (void)viewDidLoad { [super viewDidLoad]; AdWhirlView *adWhirlView =
[AdWhirlView requestAdWhirlViewWithDelegate:self]; adWhirlView.delegate =
self; adWhirlView.frame = CGRectMake(0, 430+kAdWhirlViewHeight,
kAdWhirlViewWidth, kAdWhirlViewHeight); [self.parentViewController.view
insertSubview:adWhirlView belowSubview:self.view]; [UIView
beginAnimations:@"AdWhirlIn" context:nil]; [UIView setAnimationDuration:.5];
[UIView setAnimationCurve:UIViewAnimationCurveEaseInOut]; adWhirlView.frame =
CGRectMake(0, 430, kAdWhirlViewWidth, kAdWhirlViewHeight); [UIView
commitAnimations]; } [/c]

