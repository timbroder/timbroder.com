---
author: tim
comments: true
date: 2010-01-05 14:46:00+00:00
layout: post
slug: quick-way-to-display-your-delicious
title: A quick way to display your delicious links by tag
wordpress_id: 230
categories:
- Code
---

quick, dirty, and slow with lots of tags  

  


    
    <html>
    <body>
    <script type="text/javascript"> 
    function goforit (posts) {
     for ( var tagname in posts ) {
      document.writeln('<scr'+'ipt type="text/javascript" src="http://feeds.delicious.com/v2/js/NYCEndurance/' + tagname + '?title=' + tagname + '&icon;=s&count;=100&sort;=alpha&tags;"></scr'+'ipt>'); 
     }
    }
    </script>
    <script type="text/javascript" src="http://feeds.delicious.com/v2/json/tags/NYCEndurance?callback=goforit"></script>
    </body>
    </html>
    
