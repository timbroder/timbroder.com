---
author: tim
comments: true
date: 2007-07-24 01:52:00+00:00
layout: post
slug: howto-post-code
title: 'HOWTO: post code'
wordpress_id: 25
categories:
- Code
---

Posting code is made quite easy by using [SyntaxHighlighter](http://code.google.com/p/syntaxhighlighter/).  It's pretty
 easy to set up and works on any html sites, as well as [blogger](http://www.blogger.com) and [wordpress](http://www.wordpress.org).  I'll be using it heavily throughout these posts.  3 easy steps:  
  
1. Include the SyntaxHighlighter.css file at the top of your page.

 	```<link type="text/css" rel="stylesheet" href="/php/js/dp.SyntaxHighlighter/Styles/SyntaxHighlighter.css"></link>```
    
1. At the bottom of the page, include the [brushes](http://code.google.com/p/syntaxhighlighter/wiki/Brushes) and other js files you will need, as well as the function call to stylize the ```<pre>``` tags:
    
    ```
    <script language="javascript" src="/php/js/dp.SyntaxHighlighter/Scripts/shCore.js"></script>
    <script language="javascript" src="/php/js/dp.SyntaxHighlighter/Scripts/shBrushCSharp.js"></script>
    <script language="javascript" src="/php/js/dp.SyntaxHighlighter/Scripts/shBrushXml.js"></script>
    <script language="javascript" src="/php/js/dp.SyntaxHighlighter/Scripts/shBrushPython.js"></script>
    <script language="javascript">
    dp.SyntaxHighlighter.ClipboardSwf = '/flash/clipboard.swf';
    dp.SyntaxHighlighter.HighlightAll('code');
    </script>
    ```

1. Then, place the code you want in between these two steps using ```<pre>``` tags that the javascript will stylize
  
    ```html
    <pre name="code" class="html">
    <!-- code here -->
    </pre>
    <pre name="code" class="python">
    # code here
    </pre>
    ```
