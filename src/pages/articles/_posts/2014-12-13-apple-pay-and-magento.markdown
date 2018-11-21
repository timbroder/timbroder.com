---
author: tim
comments: true
date: 2014-12-13 23:12:12+00:00
dsq_thread_id: '3322595670'
layout: post
link: http://www.alexanderinteractive.com/blog/2014/09/apple-pay-magento/
slug: apple-pay-and-magento
title: Apple Pay and Magento
wordpress_id: 1735
categories:
- Code
tags:
- applepay
- magento
---

**The Business of Apple Pay** (Alec Simonson)

On the outset, Apple Pay is very cool and could very well be the wave of the
future. A lot of this hinges on “what’s under the hood” in terms of Apple’s
contract with the leading credit card companies who helped with the
development. If everything is open, and companies like Samsung can let their
customers pay with NFC technology as well, I could see this as something that
will be successful, adopted, and an example of Apple leading the way. However,
if Apple goes all proprietary (as they love to do) and contractually forces
these major credit cards to only use their devices, or charges other companies
like Samsung to license their payment platform, or otherwise mandate that all
touch-to-pay via smartphone methods are hereby known as “Apple Pay,” I could
see adoption problems happening. Open standards have frequently been key to
paving the way to adoption, and this has never really been Apple’s model in
the past. For example, AirPlay is really cool and loved but does not work
outside the environs of iOS, and can therefore never reach greater than 14.8%
penetration as of this writing. So Chromecast was born, and while not nearly
as simple or feature rich, it’s open to both Android and iOS and therefore has
a much higher potential of adoption. Feature expansion will follow.

One of the aspects of Apple Pay that I think is great is that merchants aren’t
really troubled with much of everything, since most of this is really on the
backend. A new reader with NFC capabilities, and they’re off and running. Low
cost or no cost adoption. Or is it? Nobody has mentioned what Apple’s
commission is on this latest development. An article on Forbes suggested it
may be around 0.2%, giving Apple $0.20 for every $100 spent. That’s not much,
but when you consider what percentage that is of the credit card companies’
net (perhaps around 14%), it starts to look more substantial. Credit card
companies like their investors, so it’s hard to imagine them not wanting to
pass that extra cost onto merchants, who will be all-too-willing to share that
with consumers.

All of that aside, it’s very smart and forward thinking, and early adopters
will likely be looked upon with jealousy by others. From an implementation
perspective, adding Apple Pay will likely be as easy as it was to add Google+,
and merchants will do it. But the long-term prospects will rely highly on what
sort of deal Apple made….the devil is always in the details.

**The Technology of Apple Pay** (Tim Broder)

Out of the gate, Pay is native app only. This leaves Magento sites at a
disadvantage. In the future I’d like to see Apple open up this functionality
to Safari on both mobile and desktop. Pay already has one-time number
generation. This could be implemented in the browser similar to how
[1Password](https://itunes.apple.com/us/app/1password-password-
manager/id443987910?mt=12&at=11laRZ&ct=pro) can inject a credit card number
into a form. Until something like this happens, only sites with a native app
siting in front of Magento’s API will be able to take advantage.  If you are
looking to investigate this space, [meets.io](http://meets.io/), an unofficial
Magento SDK, is a great starting point.

I’ll be curious if a developer comes up with a browser dedicated to this
functionality. Tap into the Pay API and generate credit card numbers ad hoc,
and bridge between Pay and e-commerce sites. Or, take it a step further and
develop a custom keyboard for iOS 8. If allowed, it would be more seamless
than a whole seperate browser. I say “if allowed” because there are some
restrictions on what 3rd party keyboard can do. For example, they cannot touch
passwords. The stock keyboard reasserts itself when tapping on a password
field.