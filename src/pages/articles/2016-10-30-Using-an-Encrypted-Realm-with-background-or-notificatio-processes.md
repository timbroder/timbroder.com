---
author: tim
comments: true
date: 2016-10-30 13:54:00+00:00
layout: post
link: ''
slug: using-an-encrypted-realm-with-background-or-notificatio-processes

title: Using an Encrypted Realm in a background or notification processes?

category: Code
tags:
- swift
- realm
- encryption
---


*Note: This post's primary purpose is to help me think through this problem. I have no prescribed solution at the end of it. The conversation will continue on [Stack Overflow](http://stackoverflow.com/q/40332246/647343 "Stack Overflow"). I will update this post once I have a final approach.* 

Realm has a great [write up](https://realm.io/docs/swift/latest/#encryption "write up") and [sample code](https://github.com/realm/realm-cocoa/blob/master/examples/ios/swift-2.2/Encryption/ViewController.swift "sample code") for encrypting your database. This documentation and sample work as intended, until you try to decrypt realm when:

1. A user has a password on their phone
2. The device is locked
3. Your app is trying to do work with Realm when a remote notification comes in

This happens because we can't access the keychain to get (or create) the key to en/decrypt the Realm. The default ```kSecAttrAccessible``` value is ```kSecAttrAccessibleWhenUnlocked```

There are a few options as I see them: 

1. Change ```kSecAttrAccessible``` to ```kSecAttrAccessibleAlways```. I don't like this because it's a) too open and b) it was [slated to be deprecated in iOS 9](http://stackoverflow.com/questions/32112678/ksecattraccessiblealways-deprecated-in-ios-9#comment53491023_32600761 "slated to be deprecated in iOS 9")
2. Change ```kSecAttrAccessible``` to ```kSecAttrAccessibleAfterFirstUnlock``` or ```kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly```. This is better but still feels too open to *me*, even though the [docs](https://developer.apple.com/reference/security/ksecattraccessibleafterfirstunlockthisdeviceonly "docs") state: *This is recommended for items that need to be accessed by background applications*
3. Create a second, non-encrypted Realm to use as a staging database. Store notification data here, then when the app wakes up from user interaction (the device would be unlocked), move the data from the staging Realm into the encrypted real one. This doesn't feel right either, as we'll have data temporarily not encrypted
4. Combine 2 and 3 and encrypt the staging Realm, and protect it's key with ```kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly```
5. ??

I'm currently trying to decide if #2, if #3 is worth putting the time into, or if I can come up with a #5
