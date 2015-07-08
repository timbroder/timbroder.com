---
author: tim
comments: true
date: 2014-07-12 23:08:57+00:00
dsq_thread_id: '2838871623'
layout: post
linked_list_url: ''
slug: parsing-sentences-string-swift
title: Parsing sentences from a String in Swift
wordpress_id: 1582
categories:
- Code
tags:
- swift
---

I’ve been looking at how to [parse
sentences](https://pinboard.in/u:broderboy/t:sentences/) from text recently.
While I’m still looking for a more Machine Learning approach, I found
NSStringEnumerationBySentences which can get me there faster (for now).  I
need to get all of the sentences from a given String.  This could easily be an
Objective-C category method.  But, I’m trying to learn as much Swift as I can.
I haven’t played with extensions yet. Here we go.
enumerateSubstringsInRange:options:usingBlock: is what I’ll need, but I need
the extension first: [c] extension String { var fullSentences: [String] { } }
[/c] Fiddling with Swift’s closure syntax for a little while, and using the
shorthand for NSStringEnumerationBySentences, I end up with this: [c]
extension String { var fullSentences: [String] { var sentences = [String]()
let range = self.rangeOfString(self) self.enumerateSubstringsInRange(range,
options: .BySentences) { substring, substringRange, enclosingRange, inout in
sentences += substring } return sentences } } [/c] This could have been
condensed even more, but I find this very hard to read: [c] extension String {
var fullSentences: [String] { var sentences = [String]() let range =
self.rangeOfString(self) self.enumerateSubstringsInRange(range, options:
.BySentences) { substring, _, _, _ in sentences += substring } return
sentences } } [/c] Ah, but alas. Now I can’t use this in Objective-C. It won’t
see the String extension.  It needs to be NSString: [c] extension NSString {
var fullSentences: [String] { var sentences = [String]() let range =
self.rangeOfString(self) self.enumerateSubstringsInRange(range, options:
.BySentences) { substring, substringRange, enclosingRange, inout in sentences
+= substring } return sentences } } [/python] [/c] I haven’t quite figured out
the naming convention for Swift Extension files yet. Right now, I have this in
StringExtentions.swift in my categories folder.  Though…. I guess to be proper
it should be NSStringExtentions.swift...

