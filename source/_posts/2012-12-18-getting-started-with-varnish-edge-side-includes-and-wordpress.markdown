---
author: tim
comments: true
date: 2012-12-18 20:20:35+00:00
dsq_thread_id: '981316888'
layout: post
linked_list_url: ''
slug: getting-started-with-varnish-edge-side-includes-and-wordpress
title: Getting Started with Varnish Edge Side Includes and Wordpress
wordpress_id: 1269
categories:
- Code
tags:
- ESI
- varnish
- wordpress
---

There are a lot of cases on blogs where once you write the post, the cache for
that page doesn't really have to be updated all that often.  Comments can be
powered by Disqus so you don't need to bust the cache every time someone
comments. If you make a change to a post, it's page and any pages that display
it (home, category, etc) should be updated automatically anyway; [wp-
varnish](https://github.com/pkhamre/wp-varnish) is the best plugin for that
btw. 

Now, the sidebar. That's where it can get tricky.  On a lot of the
content sites I work on, we can cache most pages for days, the backend doesn't
need to keep generating them, the content just lives in varnish. Except for
the sidebar.  This could have things like "Popular Posts" or "New Posts".
Things that are going to change outside of the context of the post you are
currently looking at. 

This is where [Edge Side
Includes](http://en.wikipedia.org/wiki/Edge_Side_Includes) (ESI) comes in.
For a while, [Akamai](http://www.akamai.com/html/support/esi.html) was the only way to get this behavior, and they are quite expensive. Don't get me
wrong, they are amazing, but you have to be getting serious traffic to need them. [Varnish](https://www.varnish-cache.org/) is one of the best caching
solutions you can use, especially for Wordpress. If you are unsure where to start with Varnish and wordpress, [this
article](http://www.ewanleith.com/blog/900/10-million-hits-a-day-with-wordpress-using-a-15-server) is a great starting point. I'v also bookmarked some other articles [here](https://pinboard.in/u:broderboy/t:varnish/t:wordpress). 

ESI was
introduced in 2.1, and really fleshed out in 3.0 and can be thought of as
fragment caching for Varnish. It's really easy to fix the example I gave
above: we want to be able to cache most of the content for 24 hours but
refresh just the sidebar every 10 mins.  Varnish will do this processing for
us, keeping the rest of the page cached, and splicing in the sidebar (and
having your webserver process just the sidebar) when it needs to. Most of what
I'm going to do below is in the ESI [documentation](https://www.varnish-
cache.org/docs/3.0/tutorial/esi.html). 

We're going to assume that our theme
has a dynamic sidebar called "Sidebar" and that there are cases where we want
ESI to be active (production) and some where wordpress should just behave
normally (dev).  This is what we have before we start thinking about Varnish:

```PHP
<div class=&quot;five columns&quot;>
<?php
	if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar(&quot;Sidebar&quot;) ) :
	endif;
?>
</div>
```

The two varnish tags we are going to use are an esi comment, and an esi:remove tag. These are the switch that will process the page properly whether you have ESI or not. esi:remove will ignore everything between them if ESI is enabled. This is where we put our “normal processing” code. If ESI is not active, this code will run as normal. Inside the esi comment we put the code that we want to run if ESI is enabled. If it is not, the code will be ignored.

```PHP
<div class=&quot;five columns&quot;>
	<esi:remove>
		<?php
		if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar(&quot;Sidebar&quot;) ) :
		endif;
		?>
	</esi:remove>
	<!--esi
		<esi:include src=&quot;/wp-content/plugins/myplugin/esihandler.php&quot;/>
	-->
</div>
```

Now our sidebar display is ESI ready, but we need to give Varnish an endpoint to hit so it can generate the fragment of the sidebar. So lets create esihandler.php: 

```PHP
<?php
 
$cwd = getcwd();
$path = substr($cwd, 0, strpos($cwd, 'wp-content/'));
require $path . 'wp-blog-header.php';
 
if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar(&quot;Sidebar&quot;) ) :
endif;
```

Lastly, we’ll have to tell Varnish to cache for different timeframes. A full Varnish config is out of the scope of this post, see the links above for more info. What we need is in the sub vcl_fetch call. Add this at the top:

```c
if (req.url ~ &quot;esihandler.php&quot;) {
    set beresp.ttl = 10m;
}
else {
    set beresp.do_esi = true;
    set beresp.ttl = 1440m;
}
```

And you should be all set. When developing you can use smaller timeframes (10 seconds, and 1min). Drop some logging in to see it in action.

Let me know of any questions in the comments