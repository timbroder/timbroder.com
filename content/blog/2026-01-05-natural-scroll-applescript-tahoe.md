---
title: Updating Natural Scroll using AppleScript in Tahoe
layout: post
slug: natural-scroll-applescript-tahoe
date: 2026-01-05
category: Code
tags:
- applescript
---

For [ever](https://www.google.com/search?q=alfred+update+natural+scroll+site:www.alfredforum.com) and [ever](https://www.google.com/search?q=applescript+update+natural+scroll), Mac OS has not handled natural scrolling and switching between a mouse and a trackpad gracefully, or at least the way I want it. Without some kind of intervention, scrolling feels backwards on the opposite input mechanism. The "right" way to fix this is to use [UnnaturalScrollWheels](https://github.com/ther0n/UnnaturalScrollWheels) and never have to think about it. But, that doesn't help locked-down work machines.

I've used an applescript in a shortcut to fix this for a while but Tahoe broke it. After some debugging with Claude over lunch, here is the new one:

```
-- Open trackpad settings directly
open location "x-apple.systempreferences:com.apple.Trackpad-Settings.extension"

tell application "System Events"
	tell application process "System Settings"
		
		-- Wait for window to be ready
		repeat until window 1 exists
			delay 0.1
		end repeat
		
		-- Wait for the tab group to exist
		repeat until exists tab group 1 of group 1 of group 3 of splitter group 1 of group 1 of window 1
			delay 0.1
		end repeat
		
		-- Click "Scroll & Zoom" tab (radio button 2)
		click radio button 2 of tab group 1 of group 1 of group 3 of splitter group 1 of group 1 of window 1
		
		delay 0.2
		
		-- Click "Natural scrolling" checkbox
		click checkbox "Natural scrolling" of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1 of window 1
		
		delay 0.1
		
	end tell
end tell

-- Quit System Settings
tell application "System Settings" to quit
```
