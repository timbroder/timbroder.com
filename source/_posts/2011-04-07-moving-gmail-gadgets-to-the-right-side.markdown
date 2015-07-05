---
author: tim
comments: true
date: 2011-04-07 14:56:39+00:00
layout: post
slug: moving-gmail-gadgets-to-the-right-side
title: Moving Gmail Gadgets to the Right Side
wordpress_id: 900
categories:
- Code
tags:
- css
- gmail
- Remember the Milk
---

I started using Remember the Milk recently but didn't want the [gmail gadget](http://www.rememberthemilk.com/services/gmail/gadget/) to be so far down on the left hand side of my screen.  There is no built in way to move gadgets to the right hand side with the exception of chat (labels used to do this but was removed in favor of drag in drop back in late 2009).

[![](http://timbroder.com/wp-content/uploads/2011/04/gmail_right_widgets.png)](http://timbroder.com/wp-content/uploads/2011/04/gmail_right_widgets.png)



If you don't have anything in the right hand column, _enable Right-Side Chat_ from Gmail Labs.  We are going to add in some custom css to gmail so install either [Stylist ](https://chrome.google.com/extensions/detail/pabfempgigicdjjlccdgnbmeggkbjdhd)for Chrome or [Stylish](https://addons.mozilla.org/en-US/firefox/addon/stylish/) for Firefox.

Add the following style:

[css]div.TZ:nth-child(8) {
    position:absolute !important;
    right:0px;
    top:165px;
    width:164px;
}[/css]

In chrome you can also restrict the domain to mail.google.com.  For me, the Remember the Milk gadget was the 8th child.  Play with this until it looks right for you. You may also have to play with the "top" element depending on how much room your chat gadget takes up
