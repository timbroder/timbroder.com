---
author: tim
comments: true
date: 2013-03-23 17:38:14+00:00
dsq_thread_id: '1159541645'
layout: post
link: ''
slug: automating-adding-to-trello-on-ios
title: Automate Adding to Trello on iOS with Launch Center Pro and Pythonista
wordpress_id: 1299
category: Code
tags:
- ios
- launch center pro
- python
- pythonista
---

I love using [Trello ](https://trello.com/)to organize my life and work. While
I kind of like it's iOS app, sometimes navigating to a board to add a card can
be a little time consuming.  I want this process to be faster. I also use
Launch Center Pro to get some quick actions that I miss from Android. Mostly
around quick communication, adding events, and now, adding to Trello.  LCP
uses x-callback-urls for inter-app communication, but Trello doesn't have any
that I could see. Inspired by Federico
[Viticci](https://twitter.com/viticci)'s article on [automating his iOS
workflow](http://www.macstories.net/stories/automating-ios-how-pythonista-changed-my-workflow/), I decided to take a crack at it using pythonista. All
code shown below can be found on
[GitHub](https://github.com/broderboy/PythonistaTrello). 

[![2013-02-1114.32.57](/images/2013/02/2013-02-11-14.32.57.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-14-32-57)

[![2013-02-11
14.33.00](/images/2013/03/LCP.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-14-33-00)

[Pythonista](http://omz-software.com/pythonista/) lets you edit and run python scripts on your phone.
There are a few ways to get scripts onto your device:

  * Edit right in the app
  * Import [from a gist](https://gist.github.com/omz/b0644f5ed1d94bd32805)
  * Use [pastebot](http://tapbots.com/software/pastebot/). A great app that gives you multiple clipboards on your device that will also sync with your mac. This is my preferred method.
 
The endgame of all this: I want to be able to add a card to a specific board,
with as few taps as possible. Check out this video for what we are going to
build.  Digging into the [Trello
API](https://trello.com/docs/api/card/index.html#post-1-cards), we can see
that to add a card, we'll need a name for the card and the ID of the list to
add it to. We also see that we'll need a token for any of the API calls. To
get all of our lists, we'll also need to know about all of our boards.  This
breaks our tasks out as follows:

  1. Get an App API Key
  2. Get an API Token
  3. Get a list of every board we heve
  4. Get the IDs of every list on each of these boards
  5. Add a new card to our list of choice

To get an App API Key, you can generate one [here](https://trello.com/1/appKey/generate  "here").  In theory, the one I distribute with
these scripts should be ok. Get this first script into Pythonista and run it.
It will generate a permanant API token for you that you can leave in Launch
Center Pro when running these scripts. 

```python
#GetTrelloToken

import webbrowser

url = 'https://trello.com/1/authorize?key=3e2cd730f3dcccbe15eaf0d39d219a37&amp;name=PythonistaTrello&amp;expiration=never&amp;response_type=token&amp;scope=read,write'

#open web browser to get a permanant Trello API Token
webbrowser.open(url)
```

[![2013-02-11 14.54.35](/images/2013/02/2013-02-11-14.54.35.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-14-54-35)

[ ![2013-02-1114.54.40](/images/2013/02/2013-02-11-14.54.40.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-14-54-40)

Now that we have our key and tokens,
let's get get all of our boards and the lists on each one. Run this script and
pass in your token and your email address as arguments. (In pythonista hold
down run to get the "Run with arguments dialog"). Add your arguments separated
by spaces. For me, this could look something like: ```"EGYlyiOdggDOaPoTUxaTQobmS6gtiX timothy.broder@gmail.com"``` 

```python
#List all lists by user

import urllib2
import urllib
import json
import sys

if len(sys.argv) != 3:
    raise Exception("Usage: list_trello_lists.py [token] [email]")

key = "3e2cd730f3dcccbe15eaf0d39d219a37"
args = { 'key': key,
    'token': sys.argv[1],
    'filter': 'open'}

#build out api url
username = sys.argv[2]
boards_url = "https://api.trello.com/1/members/%s/boards/?%s" % (username, urllib.urlencode(args))

#get board data from api
try:
    data = urllib2.urlopen(boards_url)
except urllib2.HTTPError as inst:
    raise Exception("Key or Token incorrect")

boards = json.loads(data.read())

#loop through each board
for board in boards:
    board_id = board['id']
    lists_url = "https://api.trello.com/1/boards/%s/lists?%s" % (board_id, urllib.urlencode(args))
    data = urllib2.urlopen(lists_url)
    lists = json.loads(data.read())

    print "-- %s" % board['name']
    #output each list in board
    for lizt in lists:
        print "\"%s\" %s" % (lizt['name'], lizt['id'])
    print "\n"
```

Running this, we'll get the IDs of the lists we need

[![2013-02-11 15.06.39](/images/2013/02/2013-02-11-15.06.39.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-15-06-39)

[![2013-02-1115.07.13](/images/2013/02/2013-02-11-15.07.13.png)](http://timbroder.com/2013/03/automating-adding-to-trello-with-launch-center-pro-and-pythonista.html/2013-02-11-15-07-13)

Finally, we'll need to take our key, the
id of the list, what we want our card to say, and hit the API with them.  I
also add in a position so the cards I add this way will appear at the top of
their list. We'll pass these in as parameters: 

```"EGYlyiOdggDOaPoTUxaTQobmS6gtiX V12t3k6RQQ2r8X top the name of my card goes here"``` 

Two things to point out inthis script:

  * we put the name of the card at the end so we can just loop through all the remaining words and not have to worry about wrapping the name in quotes to deal with spaces.
  * since the end game of this is to run from Launch center pro, we want to jump back to Launch Center Pro at the end using it's x-callback-url


```python
#Add card to List

import urllib2
import urllib
import json
import sys
import webbrowser

arglen = len(sys.argv)

if arglen < 5:     raise Exception("Usage: list_trello_lists.py [token] [list_id] [position] [card_name]") name = sys.argv[4] #take care of spaces if arglen > 5:
    for i in range(5,arglen):
        name = "%s %s" % (name, sys.argv[i])

key = "3e2cd730f3dcccbe15eaf0d39d219a37"
token = sys.argv[1]
args = { 'key': key,
    'token': sys.argv[1],
    'name': name,
    'pos': sys.argv[3],
    'idList': sys.argv[2]
    }
card_add_url = "https://api.trello.com/1/cards"

try:
    data = urllib2.urlopen(card_add_url, urllib.urlencode(args))
except urllib2.HTTPError as inst:
    raise Exception("Key or Token incorrect")

#jump back to Launch Center Pro
webbrowser.open("launchpro:")
```

To run this in Launch Center Pro,
Add an Action > Pythonista > Run Script with Arguments. Put in the name
of the script, then in arguments, but everything from above except the name:
"EGYlyiOdggDOaPoTUxaTQobmS6gtiX V12t3k6RQQ2r8X top," then hit the button that
says input prompt. Now, when you run the script, Launch Center Pro will prompt
you for text, enter the name of the card and hit go. 

Add as many of these as
you want! Just swap out the list ID.