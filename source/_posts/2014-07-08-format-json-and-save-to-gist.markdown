---
author: tim
comments: true
date: 2014-07-08 21:02:32+00:00
dsq_thread_id: '2828067152'
layout: post
linked_list_url: ''
slug: format-json-and-save-to-gist
title: Format JSON and save to gist with Alfred
wordpress_id: 1569
categories:
- Code
tags:
- alfred
- github
- json
---

At work, we have an Angular app that deals with a lot of custom JSON. With a
distributed dev team, we pass a LOT of JSON around.  Copying from Chrome’s net
tab, formatting, adding to a Github [gist](https://gist.github.com/) for easy
transport is a PITA when you are doing it 20 times a day. I have 2 Alfred
workflows to help with this.

My Use:

  1. Copy unformatted JSON to clipboard
  2. Alfred “JsonLint”. Formatted JSON is now in my clipboard
  3. Alfred “gist”. URL to raw gist is now in my clipboard
  4. One of these days I’ll chain these together

To get this working:

  1. You’ll need the Alfred [PowerPack](http://www.alfredapp.com/powerpack/)
  2. Install my JSON lint [workflow](https://github.com/broderboy/AlfredJsonLint/blob/master/Json%20Lint.alfredworkflow?raw=true). (It needs work, but gets the job done)
  3. Install [AlfredGist](https://github.com/phallstrom/AlfredGist)
  * Be sure to follow the setup [instructions](https://github.com/phallstrom/AlfredGist).
  * I prefer to have the ‘raw’ url returned from AlfredGist. (in the clipboard and opened)  
To enable this, open functions.sh  
Look for this line: gist_url=$(get_json_key “html_url" "$json")  
Modify to: gist_url=$(get_json_key “raw_url” "$json")

  * In “gistconfig” set the gists to be private

You should now be able to chain together as I listed above

Let me know if you have any questions!

