---
author: tim
comments: true
date: 2014-05-07 16:07:24+00:00
dsq_thread_id: '2677470137'
layout: post
link: ''
slug: poking-angularjs-model-within-iframe
title: Poking at an AngularJS model from within an iFrame
wordpress_id: 1517
categories:
- Code
tags:
- angularjs
---

Full Disclosure: This is dirty and hacky. You may feel unclean after reading.
Grab soap. 

For a few infrastructure reasons I won’t get into, we have an
iFrame on a page that Angular renders.  It pulls in a page that exists within
our code base and on the same site. Thankfully, no Cross Domain issues to
worry about.  The page within the iFrame needs some configuration from the
parent page. When a user is done in the iframe and hits a button inside of it,
the parent page needs some information from it.  This information has to be
updated in an Angular model on the parent page. 

Starting off a partial
template: 

```HTML
<iframe src="/....html" width="100%" height="800" scrolling="no" seamless="seamless" style="border:0;"></iframe>
```

On the directive, I attach a configuration method to the window. Not great, I know.

```javascript
link: function(scope, element, attrs) {
 
  top.window.TTTpassConfig = function() {
    config = {};
    config.RPCurl = attrs.initRpcurl;
    config.xml = attrs.initXml;
  }
 
},
```

This gets called from within the iFrame:

```javascript
parent.passConfig()
```

At some point, the inner page is done, and needs to call back to the parent with data:

```javascript
parent.callSave(outputXml);
```

But, this method needs to live in the partial template AND update the model. For simplicity, I went with inline JS and created the proper textarea to hold my data and bind to the model. Below I can see that the data is coming back, and the textarea has the text. There are two problems with this: 1) The model itself isn’t getting updated and 2) This js is outside of Angular’s scope so I can’t just call $apply. Angular’s dirty checking won’t see this change. I needed a way to update the model from outside Angular.


```HTML
{% verbatim %}
<script type="text/javascript">
    function callSave(payload){
        console.log('Data being saved from iframe: ', payload);
        var $elm = $('#iframe-data');
        $elm.val(payload);
    }
</script>
 
<iframe src="/....html" width="100%" height="800" scrolling="no" seamless="seamless" style="border:0;"></iframe>
<pre>{{parent[uuid][data.id].value}}</pre>
<textarea type="text" id="iframe-data" ng-model="parent[uuid][data.id].value" data-name="{{data.name}}" data-id="{{data.id}}" value="{{data.value}}"></textarea>
{% endverbatim %}
```

The trick ended up being that ngModel listens for an “input” event. Use that, hide the textarea, and I’m good to go

```HTML
{% verbatim %}
<script type="text/javascript">
    function callSave(payload){
        console.log('Data being saved from iframe: ', payload);
        var $elm = $('#iframe-data');
        $elm.val(payload);
        $elm.trigger('input');
    }
</script>

<iframe src="/....html" width="100%" height="800" scrolling="no" seamless="seamless" style="border:0;"></iframe>
<pre>{{parent[uuid][data.id].value}}</pre>
<textarea type="text" id="iframe-data" ng-model="parent[uuid][data.id].value" data-name="{{data.name}}" data-id="{{data.id}}" value="{{data.value}}" style="display: none;"></textarea>
{% endverbatim %}
```

I know the Angular way to do this would have been a combination of $watch and $apply from within the directive. I went down that road for a few hours. Because of timeline constraints I have to leave as is. I’ve acknowledged that I’m incurring technical debt and marked a TODO that may or may never get addressed.