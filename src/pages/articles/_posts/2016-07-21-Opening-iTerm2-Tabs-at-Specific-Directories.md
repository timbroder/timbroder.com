---
author: tim
comments: true
date: 2016-07-21 10:22:00+00:00
layout: post
link: ''
slug: opening-iterm2-tabs-at-specific-directories

title: Opening iTerm2 Tabs at Specific Directories

categories:
- Code
tags:
- 
- 
---


I love iTerm2. I can customize the stock Terminal.app just about as much, but it's much easier in iTerm. I find myself always opening the same 3 or 4 tabs when I get into coding mode. Luckily iTerm2 has **great** [scripting support](https://www.iterm2.com/documentation-scripting.html "scripting support")

The 4 tabs I always open for [Kidfund](http://www.kidfund.us/ "Kidfund") are:

1. Our iOS project
1. Our Laravel project. Usually where I run artisan commands
1. Our Laravel project; Tails most recent file in the log directory
1. Our Laravel project; I jump around from here. Usually CD-ing to 1. the realm directory to pop it into [Realm Browser](https://github.com/realm/realm-browser-osx "Realm Browser")

I didn't want this to run *all* of the time so I didn't have this script run each time iTerm opens. I instead wired it into an Alfred command. If you are interested you can download that [here](https://github.com/Kidfund/KidTabs "here")

The underlying script is as follows. It's crud, and could definitely be more flexible, but it works for me at the moment. Hopefully it can help you craft something to your needs

```applescript
tell application "iTerm2"
  tell current session of current window
    write text "cd ~/workspace/kidfund/ios"
  end tell
  tell current window
    create tab with default profile
      tell current session of current tab
        write text "cd ~/workspace/kidfund/web"
      end tell
  end tell
    tell current window
    create tab with default profile
      tell current session of current tab
        write text "cd ~/workspace/kidfund/web && tail -f storage/logs/\"$(ls -at storage/logs | head -n 1)\""
      end tell
  end tell
    tell current window
    create tab with default profile
      tell current session of current tab
        write text "cd ~/workspace/kidfund/web"
      end tell
  end tell
end tell
```