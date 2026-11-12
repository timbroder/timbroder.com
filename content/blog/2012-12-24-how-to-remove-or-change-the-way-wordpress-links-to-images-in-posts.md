---
author: tim
comments: true
date: 2012-12-24 20:34:43+00:00
dsq_thread_id: '997183744'
layout: post
link: ''
slug: how-to-remove-or-change-the-way-wordpress-links-to-images-in-posts
title: How to Remove or Change the way Wordpress Links to Images in Posts
wordpress_id: 1278
category: Code
tags:
- php
- regex
- wordpress
---

By default, WordPress will link directly to an image in the category or post view.  In a project I was working on today I wanted to change that. On the category view I wanted the image just to link to the post, and in the post, I didn’t want a link at all. Useful trick I found below:

```PHP
function change_image_permalink($content){
	$format = get_post_format();
 
	//category listing page. link image to post
	if (is_single() === FALSE AND $format == 'image'){
		$content =
		preg_replace(
			array('{<a(.*?)(wp-att|wp-content/uploads)[^>]*><img}','{ wp-image-[0-9]*&quot; /></a>}'),
			array('<a href=&quot;' . get_permalink() . '&quot;><img','&quot; /></a>'),
			$content
		);
	}

	//post page. remove link
	else if ($format == 'image'){
		$content =
			preg_replace(
				array('{<a(.*?)(wp-att|wp-content/uploads)[^>]*><img}','{ wp-image-[0-9]*&quot; /></a>}'),
				array('<img','&quot; />'),
				$content
			);
	}
	
	return $content;
}
add_filter('the_content', 'change_image_permalink');
```