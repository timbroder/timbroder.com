---
author: tim
comments: true
date: 2013-05-10 16:42:32+00:00
dsq_thread_id: '1285289556'
layout: post
linked_list_url: ''
slug: fixing-youtube-embeds-in-wordpress
title: Fixing YouTube embeds in Wordpress
wordpress_id: 1353
categories:
- Code
tags:
- php
- wordpress
- youtube
---

In some wordpress themes, youtube embeds just show up as a black screen. As
discussed [here](http://wordpress.org/support/topic/dynamically-change-
youtube-iframe-embeds-to-auto-add-transparent-mode?replies=8), the solution is
adding a transparency setting to the iframe's src. However, the solution in
that thread only works if the src is right next to the frameborder. Updated
code below if you are running into this problem [php] function
add_video_wmode_transparent( $html ) { $pattern = '#(src="https?://www.youtube
(?:-nocookie)?.com/(?:v|embed)/([a-zA-Z0-9-]+).")#'; preg_match_all( $pattern,
$html, $matches ); if ( count( $matches ) &gt; 0) { foreach ( $matches[0] as
$orig_src ) { if ( !strstr($orig_src, 'wmode=transparent' ) &amp;&amp;
!strstr( $orig_src, 'hd=1' ) ) { $add = 'hd=1&amp;wmode=transparent"'; if (
!strstr($orig_src, '?') ) { $add = '?' . $add; } $new_src = substr( $orig_src,
0, -1 ) . $add; $html = str_replace( $orig_src, $new_src, $html ); } } }
return $html; } add_filter( 'the_content', 'add_video_wmode_transparent', 10
); [/php] New thread in the wordpress forums can be found
[here](htp://wordpress.org/support/topic/dynamically-change-youtube-iframe-
embeds-to-auto-add-transparent-mode-updated). (The original was closed)

