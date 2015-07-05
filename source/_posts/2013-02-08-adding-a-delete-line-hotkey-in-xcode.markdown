---
author: tim
comments: true
date: 2013-02-08 15:49:20+00:00
layout: post
slug: adding-a-delete-line-hotkey-in-xcode
title: Adding a Delete Line hotkey in Xcode
wordpress_id: 1291
categories:
- Code
tags:
- xcode
---

When I switched from eclipse to sublime text 2, the first hotkey I moved over was cmd+d to delete a line. I use it pretty heavily.  After using Xcode for a few months it was driving me crazy that it didn't have delete line as an option under hotkeys. Thanks to [stackoverflow](http://stackoverflow.com/questions/5834096/how-do-i-create-a-delete-line-keyboard-shortcut-in-xcode-4-the-xcode-3-solution/12678985#12678985) for the solve.

To add a new custom key binding, we have to edit the Key Binding plist file:

(close Xcode)

[c]

sudo vi /Applications/Xcode.app/Contents/Frameworks/IDEKit.framework/Resources/IDETextKeyBindingSet.plist

[/c]

Add this text just ABOVE the close of the `<dict>` at the bottom of this file:

[xml]
<key>Custom</key>
    <dict>
      <key>Delete Current Line In One Hit</key>
      <string>moveToEndOfLine:, deleteToBeginningOfLine:, deleteToEndOfParagraph:</string>
    </dict>
[/xml]

Note that:



	
  * This is _inside_ the existing `<dict>` so there is a `</dict></plist>` after this

	
  * This associates the named action "Delete Current Line In One Hit" to the three key actions in the string. I played around with different options here to get the right combination. For instance, if you try moveToBeginningOfLine, deleteToEndOfLine instead of vice versa, then using it on empty lines will delete the line _and_ the entire next line. Which is unpleasant


Save this and open XCode

	
  1. Open XCode Preferences

	
  2. Select Key Bindings

	
  3. Click on All

	
  4. In the SEarch box type "Delete" and search for "Delete Current Line in One Hit"

	
  5. Add your new binding.


I use cmd+d, so I had to map duplicate to something else first
