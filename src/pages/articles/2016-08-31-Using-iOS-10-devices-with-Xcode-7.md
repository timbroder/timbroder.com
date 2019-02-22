---
author: tim
comments: true
date: 2016-08-31 16:33:00+00:00
layout: post
link: ''
slug: using-ios-10-devices-with-xcode-7

title: Using iOS 10 devices with Xcode 7

category: Code
---

[Peter Steinberger](https://twitter.com/steipete "Peter Steinberger") started a GREAT [gist](https://gist.github.com/steipete/d9b44d8e9f341e81414e86d7ff8fb62d "gist") on *Using Xcode 7.3.1 and iOS 10 devices*.

Below is what worked for me to get a few extra test devices (my carry phone runs the 10 beta) working with Xcode 7. Can't upgrade to 8 just yet. Working with a contractor and don't want to move too many pieces.

**My Setup**

Xcode 7.3.1 and Beta 6
iOS 10 beta 6 *(Beta 7 is out, after getting this to work, I don't think I'm upgrading just yet)*

**Steps**

1. ```sudo ln -s /Applications/Xcode-beta.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/10.0\ \(14A5339a\)/ /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport```
1. iPhone: Settings > General > Reset > Network Settings
1. Reboot iPhone *(after it wakes back up from the network reset)*
1. Reboot Mac *(restarting Xcode alone didn't work)*

It these steps don't work for you, check out the [gist](https://gist.github.com/steipete/d9b44d8e9f341e81414e86d7ff8fb62d "gist") for other options.