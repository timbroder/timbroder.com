---
author: tim
comments: true
date: 2014-06-15 17:11:21+00:00
layout: post
slug: launch-center-pro-trello-via-ifttt
title: Launch Center Pro to Trello via IFTTT
wordpress_id: 1558
categories:
- Code
---

I previously [wrote](http://timbroder.com/2013/03/automating-adding-to-trello-on-ios.html) about automating adding to Trello from my phone using [Launch Center Pro](https://itunes.apple.com/us/app/launch-center-pro/id532016360?mt=8&at=11laRZ&ct=pro).  That method involved some scripting and [Pythonista](https://itunes.apple.com/us/app/pythonista/id528579881?mt=8&at=11laRZ&ct=pro). It was fun to figure out, but cumbersome to update.




Now that LCP has [IFTTT integration](http://www.macstories.net/reviews/launch-center-pro-2-3-extends-ios-automation/), this process can be simplified. You can chain an event from LCP through IFTTT to email a card to Trello. _Note: This will only work for 1 list per board. I haven’t figured out if there is a way to email to multiple lists on the same board._






  1. Set up the Launch Center Pro [channel](https://ifttt.com/launch_center) on IFTTT.


  2. Set up Launch Center Connect on your device  
![](https://farm4.staticflickr.com/3893/14417105171_dc5bd5d78a_z_d.jpg)


  3. In IFTTT, create a new recipe. Set the “This” to the Launch Center Pro channel. Then, choose “Trigger”


  4. Name the trigger something that will help identify it. I used “Roadmap”.  Keep note of this, you’ll need the same name later  
![](https://farm4.staticflickr.com/3921/14427559984_5b527ef1fe_m_d.jpg)


  5. On the Trello board you wish to work with: Go into the settings and click “Email-to-board Settings.” Grab the email address for that board. Choose which list the card should be added and it’s position._ The email in this screenshot is hooked up to anything._  
![](https://farm4.staticflickr.com/3881/14427446122_587019f3fe_z_d.jpg)


  6. In the “Then” of your IFTTT recipe, choose Gmail. In the To Address, add in the trello address. Leave just “{{Value 1}}” in the subject. This will become the title of the card.  If you want to add a description or other attributes of the card, use the other Values that Launch Center Pro provides. More on how email variables are used by Trello is available [here](http://blog.trello.com/create-cards-via-email/).  
![](https://farm6.staticflickr.com/5073/14425422041_9acc965248_z_d.jpg)


  7. In LCP: Add a new action -> System Actions -> IFTTT. Name can be anything. Trigger Name must match the trigger name in IFTTT. For each value you want to use, add a text prompt. In this example I’m only using Value 1.  
![](https://farm6.staticflickr.com/5537/14427367292_6f2249df85_z_d.jpg)


  8. Hit done and you are good to go! Please note: _After sending the information to IFTTT it may take up to 5 mins to appear in your board._  
![](https://farm4.staticflickr.com/3879/14233796739_efd5e6b108_z_d.jpg)  
![](https://farm6.staticflickr.com/5238/14420441225_452eec6f4d_z_d.jpg)  
![](https://farm4.staticflickr.com/3887/14428758365_d2df4fc207_m_d.jpg)


