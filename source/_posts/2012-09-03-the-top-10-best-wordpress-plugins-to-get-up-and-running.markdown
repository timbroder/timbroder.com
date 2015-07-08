---
author: tim
comments: true
date: 2012-09-03 00:39:24+00:00
dsq_thread_id: '828465510'
layout: post
linked_list_url: ''
slug: the-top-10-best-wordpress-plugins-to-get-up-and-running
title: The top 10 best Wordpress plugins to get up and running with everything you need.
wordpress_id: 1219
categories:
- Code
tags:
- analytics
- seo
- wordpress
---

These are the top 10 best wordpress plugins I use to quickly get a wordpress
blog up and running with everything I need.  I used these last week to get a
new site going in about 2 hours.  Leave some time for analytics to catch up
and you are all set.

  * [Google Analyticator](http://ronaldheft.com/code/analyticator/) harnesses the power of Google Analytics for your blog. See where traffic is coming from, where its going, as well as basic hit tracking. The plugin also comes with an easily customizable widget that can be used to display specific information that is gathered by Google Analytics using the Google Analytics API. It supports all of the tracking mechanisms that Google Analytics supports such as external link tracking, download tracking, tracking without counting administrative users, and any other advanced tracking the user wishes to add. Google Analyticator works with a majority of themes as long as these themes provide the proper plugin hooks.Features: 
    * Supports standard Google Analytics tracking via the latest async tracking methods (faster and more reliable than the older ga.js tracking method)
    * Includes an admin dashboard widget that displays a graph of the last 30 days of visitors, a summary of site usage, the top pages, the top referrers, and the top searches
    * Provides a widget that can be used to display visitor stat information on the front-end
    * Supports external link tracking of all links on the page, including links not managed by WordPress
    * Supports download link tracking
    * Supports event tracking with outbound links / downloads instead of the old pageview tracking method
    * Supports site speed tracking
    * Supports hiding Administrator visits without affecting Google Analytics’ site overlay feature
    * Supports any advanced tracking code Google provides
    * Installs easily, only requiring the user know their UID
    * Provides complete control over options; disable any feature if needed
    * Supports localization – get the settings page in your language of choice
  *  [FD Feedburner Plugin for WordPress](http://flagrantdisregard.com/feedburner/) lets you track subscribers to your feed by redirecting the main feed and optionally the comments feed to Feedburner.com. It does this seamlessly without the need to modify templates, setup new hidden feeds, modify .htaccess files, or asking users to migrate to a new feed. All existing feeds simply become Feedburner feeds seamlessly and transparently for all users. Just tell the plugin what your Feedburner feed URL is and you’re done.
  * [FancyBox for WordPress](http://plugins.josepardilla.com/fancybox-for-wordpress/) will automatically show all images in a fancy popup window when clicked. Handy for resized images where you don't want your users stuck on just the image file when they click on it.
  * [Easy AdSense](http://www.thulasidas.com/plugins/easy-adsense) manages all aspects of Google AdSense for a blog: insert ads into posts and sidebar, and add a Google Search box.Features: 
    * Remembers AdSense code and your options by theme, so that you don’t have to re-enter them if you play with multiple themes. [This feature provides a solution to Google's unwillingness to let you modify and customize the AdSense code -- you just store all the code variants in your blog database.]
    * Enforces the Google policy of not more than three ad blocks per page.
    * Sidebar Widgets: 
      * For AdSense for content with custom title.
      * For search with customizable text or image title.
      * For Link Units.
    * Rich set of Options: 
      * To put Link Units or Ad Blocks in header or footer.
      * To suppress ads on all pages (as opposed to posts), or on the front/home page.
      * To add a customizable mouse-over border decoration on ad blocks.
    * Control over the positioning and display of AdSense blocks in each post or page.
    * Simplest possible configuration interface — nothing more than cutting and pasting AdSense code, and with sensible defaults for the few options present, all with clear instructions.
    * Internationalized (multiple languages supported).
  *  [WordPress SEO by Yoast](http://yoast.com/wordpress/seo/) is the most complete WordPress SEO plugin that exists today for WordPress.org users. It incorporates everything from a snippet preview and page analysis functionality that helps you optimize your pages content, images titles, meta descriptions and more to XML sitemaps, and loads of optimization options in between.  I use it to help generate a complete Google sitemap and tweak how my sites show up in Google.Features: 
    * Post titles and meta descriptions
    * Robots Meta configuration
    * Canonical
    * Breadcrumbs
    * Permalink clean up
    * XML Sitemaps
    * RSS enhancements
    * Edit your robots.txt and .htaccess
    * Clean up head section
  *  [w3-total-cache](http://www.w3-edge.com/wordpress-plugins/w3-total-cache/)is THE performance plugin for wordpress.  It's the fastest and most complete WordPress performance optimization plugin. W3 Total Cache improves the user experience of your blog by improving your server performance, caching every aspect of your site, reducing the download time of your theme and providing transparent content delivery network (CDN) integration.  I use it heavily for it's memcached integration, front-end compression, and CDN integration.Benefits: 
    * At least 10x improvement in site performance (when fully configured: Grade A in YSlow or great Google Page Speed Improvements)
    * “Instant” second page views (browser caching after first page view)
    * Reduced page load time: increased visitor time on site (visitors view more pages)
    * Optimized progressive render (pages appear to load instantly)
    * Improved web server performance (easily sustain high traffic spikes)
    * Up to 80% Bandwidth savings via Minify and HTTP compression of HTML, CSS, JavaScript and RSS feeds
Features:

    * Compatible with shared hosting, virtual private servers and dedicated servers / clusters
    * Transparent content delivery network (CDN) integration with Media Library, theme files and WordPress itself
    * Caching of (minified and compressed) pages and posts in memory or on disk
    * Caching of (minified and compressed) CSS and JavaScript in memory, on disk or on CDN
    * Caching of RSS (comments, page and site) feeds in memory or on disk
    * Caching of search results pages (i.e. URIs with query string variables) in memory or on disk
    * Caching of database objects in memory
    * Minification of posts and pages and RSS feeds
    * Minification (combine and remove comments / white space) of inline, embedded or 3rd party JavaScript (with automated updates)
    * Minification (combine and remove comments / white space) of inline, embedded or 3rd party CSS (with automated updates)
    * Browser caching of CSS, JavaScript and HTML using future expire headers and entity tags (ETag)
    * JavaScript grouping by template (home page, post page etc) with embed location management
    * Non-blocking JavaScript embedding
    * Import post attachments directly into the Media Library (and CDN)
  * Since most of my infrastructure is already on Amazon I use the [Amazon SES DKIM Mailer](http://wordpress.org/extend/plugins/amazon-ses-and-dkim-mailer/) plugin to use [SES](http://aws.amazon.com/ses/) as my mail provider.  It's a quick, easy way to get guaranteed delivery.
  * [Contact Form 7](http://contactform7.com/) is the best contact form out there.  It allows you to flexibly design the form and mail. You can manage multiple contact forms as well.  In addition, it supports many features including AJAX submitting, CAPTCHA, Akismet spam filtering, file uploading, etc.
  * [WP Smush.it](http://dialect.ca/code/wp-smushit/)  taps into the API behind Yahoo’s excellent Exceptional Performance series recommends optimizing images in several lossless ways: stripping meta data from JPEGs, optimizing JPEG compression, converting certain GIFs to indexed PNGs and stripping the un-used colours from indexed images.
  * This last one isn't required for all setups, but if like me you have varnish sitting in front of your app servers, [wp-varnish](https://github.com/pkhamre/wp-varnish ) is a must have. It automatically clears your varnish caches as needed.

