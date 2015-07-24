---
author: tim
comments: true
date: 2012-04-16 17:35:23+00:00
dsq_thread_id: '651905946'
layout: post
link: ''
slug: sync-side-loaded-content-between-your-kindle-and-other-devices
title: Sync side-loaded content between your Kindle and other devices
wordpress_id: 1068
categories:
- Code
tags:
- Calibre
- Kindle
---

I read a lot of books on my kindle that I got from other sources, mostly
[Manning](http://www.manning.com/catalog/mobile/) and
[O'Rielly](http://shop.oreilly.com/category/ebooks.do), but these won't sync
between my phone and my kindle.  Only books purchased from Amazon will sync
between devices. [Again](http://timbroder.com/2011/01/getting-it-onto-the-
kindle.html), Calibre to the rescue. For this to work, the book must already
exist on the kindle and be sold through Amazon.  The example book I'm going to
use is [Version Control with
Git](http://shop.oreilly.com/product/9780596520137.do).

  1. Add the book to your Calibre library
  2. Update any needed metadata.
  3. Jump over to Amazon and open the [book's page](http://www.amazon.com/Version-Control-Git-collaborative-ebook/dp/B002L4EXHO/ref=tmm_kin_title_0?ie=UTF8&m=AG56TWVU5XWC2&qid=1334596465&sr=1-1)
  4. Make sure you are on the Kindle edition of the book.  If there is no kindle edition, this will not work.
  5. Make note of the ASIN code. ![](http://farm8.staticflickr.com/7249/7084540211_05042bf0fc_o.png)
  6. Take this code and use it as the ISBN number in Calibre (it will not like this, that's ok) ![](http://farm8.staticflickr.com/7233/7084540251_5ce233f54c_o.png)
  7. Convert the book to .mobi (Even if it is already in .mobi format, you have to do this)
  8. Copy the book to your kindle via USB. Either by dragging it in your file manager or through Calibre. Do not use email, wifi, or 3g to do this, it will remove the ASIN code that we just wrapped onto the document. Once it is on the device syncing over wifi/3g will function as normal)
  9. Using USB, copy the file to your device. For android this is the kindle folder on your SD card. I haven't tested but doing through iTunes is supposed to work for an iphone/ipad.
Enjoy!