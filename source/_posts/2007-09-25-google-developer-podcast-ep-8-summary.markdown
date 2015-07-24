---
author: tim
comments: true
date: 2007-09-25 03:24:00+00:00
dsq_thread_id: ''
layout: post
linked_list_url: ''
slug: google-developer-podcast-ep-8-summary
title: Google Developer Podcast Ep 8 Summary
wordpress_id: 71
categories:
- Code
---

I got some time today on the train today to listen to Episode 8 of the Google
Developer Podcast. Normally I'll listen to it at work when it first comes out
but it's been way to hectic. Here are some highlights some commentary thrown
in.  
  

  * ZohoWriter goes on Gears - See my opinions about this [here](http://gpowered.blogspot.com/2007/08/google-get-in-gear.html). Google really needs to step it up and get Gears into their own services. The top two on my list being Gmail and Docs
  * Embed Google Maps in a "youtube like way". Also the Drag zoom and custom marker manager controls have been improved. Very easy to use.
  * Sky in Google Earth. I havn't played with this yet. I'll check it out after work tomorrow if Halo 3 isn't in the mailbox ;-) 
    * Stars
    * Google's proof that there probably is life on other planets: Earth is not just a "one off".
    * We need a Marvin the Martian Easter egg
  * Google Objective-C library has been updated for code search, Picasa, and calendar
The Guest in this episode was Mark Stahl, the Tech lead of GData since it
started (about 2 1/2 years)

  * GData is the way to interact with Google Data, See most of my [HOWTO's](http://gpowered.blogspot.com/search/label/HOWTO) for examples.
  * Uses the Atom publishing protocol (REST)
  * Resources are represented as XML. Many, many libraries are out there for working with XML so no steep learning curve for working with the data.
  * GET, PUT, POST, DEL to manipulate Data
  * A feed is a container of Data Items
  * Atom: syndication technology. It is a feed document. Used as a response for "get me the latest version of.... foofoo data set
  * Atom publishing protocol added manipulation in the form of read/write
  * Atom beat out RSS because it already had an ITEF committee
  * GData builds on top of Atom publishing 
    * Way to query, by passing parameters through a URL
    * Standardized parameters
  * Atom has no concurrency to detect conflicts / multiple writes
  * Etags are coming in the future to address this. Etags are strings that contain version info. This will enable for better caching solutions on the client, or any point in between the client and the server.
  *   * The GData team chose REST because the web is built on REST ideas. It already had developer Acceptability. It's also easy to learn. 
  * REST is a style, its good at certain things, but has trouble mapping certain operations that would perhaps be better off as an RPC
  * Atomic but not transactional
  * The first service to get GData was Calendar, and it currently gets the most request, followed (in order) by Blogger, Base, and Spreadsheets.
  * The most popular client libraries are the ones in Java and .net, followed by Python, PHP, Objective C, Lisp, and Ruby
  * Authentication can be done via ClientLogin with a token (Programmatic login), or via authsub (Google handles credentials)
  * Uses "kinds": Semantic level syndication (add custom info to an entry and helps define types of entries)

