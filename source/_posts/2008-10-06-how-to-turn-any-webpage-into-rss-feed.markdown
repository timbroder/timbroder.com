---
author: tim
comments: true
date: 2008-10-06 12:55:00+00:00
dsq_thread_id: '109993656'
layout: post
linked_list_url: ''
slug: how-to-turn-any-webpage-into-rss-feed
title: How to turn any webpage into an RSS feed
wordpress_id: 180
categories:
- Code
tags:
- HOWTO
---

Using a tool called [Dapper](http://www.dapper.net/) and [Yahoo
Pipes](http://pipes.yahoo.com/pipes/), its fairly easy to turn any webpage
into an RSS feed. Dapper is a powerful HTML scrapping system and Pipes is a
handy data remixing tool.  Head on over to dapper.net and check to make sure
someone hasn't already done what you are planning on doing (Do this by using
dapper's search function.)  If you can't find any, you are ready to go.  
  
For this example, I'm going to scrape
<http://ifanboy.com/users/broderboy/comics> which shows the comic books I'm
interested in this week.  Click "create new dapp" (located under the search
bar). Once inside the Dapp Factory, input the url of the page you want to
scrape.  Then, change the format to RSS Feed.  You can leave the format is
Dapp XML if you want much more control over the data, as well as more options
for output, but its harder to turn this into an RSS feed.  I'll cover how to
do this in a later article.  
  
![](http://3.bp.blogspot.com/_Ng3QbVQfLZ8/SOoNorE0EnI/AAAAAAAATJ0/leCPt6SrNsQ/s1600-h/1.jpg)

At this point I would recommend watching the Demo that will pop up.  After the
demo you should see a rendering of the page you were looking at.  Click add to
basket.  Then, try to add more pages that are similar, but might have
different data.  For my example this would be other people's comics.  Add
these to the basket as well (you should try to have at least 4)  
  

[![](http://1.bp.blogspot.com/_Ng3QbVQfLZ8/SOoOoUkvuhI/AAAAAAAATJ8/WgfrxcqVv4E
/s320-R/2.jpg)](http://1.bp.blogspot.com/_Ng3QbVQfLZ8/SOoOoUkvuhI/AAAAAAAATJ8/ktxQucSBFxY/s1600-h/2.jpg)

Click next step, and the system will analyze your pages.  You can watch
another demo at this point.  Now you can start selecting page elements.  The
more example pages you gave dapper, the smarter the element selecting will be.
All I'm interested in is the title of the comic, which I'm going to use for
the title of the RSS article, and the number of pulls it had, which I will use
for the body of the article.  
  

[![](http://3.bp.blogspot.com/_Ng3QbVQfLZ8/SOoP7VrxYiI/AAAAAAAATKE/Sa8E9LiQTBU
/s320-R/3.jpg)](http://3.bp.blogspot.com/_Ng3QbVQfLZ8/SOoP7VrxYiI/AAAAAAAATKE/cZegoqyOGRg/s1600-h/3.jpg)



After I have these selected, I move on to the next step. Here you can preview
or save you dapp.  It should have already grouped your 2 items into an RSS
group for you.  Exit the wizard to get the RSS feed and options.  
  

[![](http://2.bp.blogspot.com/_Ng3QbVQfLZ8/SOoRHt1LJRI/AAAAAAAATKM/xd4VjsOeDIk
/s320-R/4.jpg)](http://2.bp.blogspot.com/_Ng3QbVQfLZ8/SOoRHt1LJRI/AAAAAAAATKM/byTDlv2rlaA/s1600-h/4.jpg)

  
  
At this point, you have the RSS feed and are done with that portion.  If you
only need the address of the feed for yourself, there is no need to go any
furthur.  I wanted to make the input very easy for anyone to use the feed for
any user on iFanboy.  Enter Yahoo Pipes.  I used a text input, string builder,
and URL builder to create the URL I would need.  Then sent this url into the
dapp, and pulled back the RSS.  The orriginal URL for the dapp was [http://www.dapper.net/transform.php?dappName=iFanboyComicsfortheWeekRSS&amp;transformer=RSS&amp;extraArg_title=comic_title&amp;extraArg_description[]=pulls&amp;applyToUrl=http%3A%2F%2Fwww.ifanboy.com%2Fusers%2Fbroderboy%2Fcomics](http://www.dapper.net/transform.php?dappName=iFanboyComicsfortheWeekRSS&transformer=RSS&extraArg_title=comic_title&extraArg_description%5B%5D=pulls&applyToUrl=http%3A%2F%2Fwww.ifanboy.com%2Fusers%2Fbroderboy%2Fcomics).  While the 'broderboy' could
have been replaced directly in this url, it might not have been clear.  The
new Pipes URL makes it a little easier to see [http://pipes.yahoo.com/pipes/pipe.run?_id=GjdOGm9_3RGeKVooPxJ3AQ&amp;_render=rss&amp;username=broderboy](http://pipes.yahoo.com/pipes/pipe.run?_id=GjdOGm9_3RGeKVooPxJ3AQ&_render=rss&username=broderboy).  
  

[![](http://1.bp.blogspot.com/_Ng3QbVQfLZ8/SOoTMSgH6JI/AAAAAAAATKU/f6s1x0hbHF4
/s320-R/5.jpg)](http://1.bp.blogspot.com/_Ng3QbVQfLZ8/SOoTMSgH6JI/AAAAAAAATKU/fxS2mt00hNc/s1600-h/5.jpg)

You can also merge multiple RSS feeds in the pipe using the Union node.  
  
Enjoy!