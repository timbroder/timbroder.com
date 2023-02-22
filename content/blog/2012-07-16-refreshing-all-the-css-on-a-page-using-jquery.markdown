---
author: tim
comments: true
date: 2012-07-16 19:16:03+00:00
dsq_thread_id: '767965732'
layout: post
link: ''
slug: refreshing-all-the-css-on-a-page-using-jquery
title: Refreshing all the css on a page using jQuery
wordpress_id: 1130
category: Code
tags:
- css
- javascript
- jquery
---

I have a client project where we let them customize some css attributes in the
admin, show them the updates in a small preview area, then save the changes
back to the server. The custom css attributes are in a small css file that is
generated on pageload and then cached to the server. All of the admin
functionality is done through ajax, so I wanted a good way to update the UI of
the site without having to do a full pageload. The below function was a great
help.

```javascript
function reloadStylesheets() {
    var queryString = '?reload=' + new Date().getTime();
    $('link[rel=&quot;stylesheet&quot;]').each(function () {
        this.href = this.href.replace(/\?.*|$/, queryString);
    });
}
```