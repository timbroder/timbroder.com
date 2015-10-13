---
layout: post
title: Creating a Custom Podcast Feed Using Dropbox and Huffduffer
date: 2015-10-13 18:28
---

I use [Overcast](http://apple.co/1hyKcRq "Overcast") as my podcast client because of  it's SmartSpeed feature. This feature is now 100% free with the new 2.0 [update](http://bit.ly/1hyKfN4 "update"). SmartSpeed has spoiled me. Before Overcast I would listen to most shows at 2x. This resulted in "chipmunk voice" which I dealt with to try to get through a few more episodes each week.  Overcast let's me reduce this by speeding up playback by removing a certain % of silence. 

Sometimes I'll find other recordings, episodes, or files that I want to listen to. I don't want to see if they are already in a feed somewhere, or subscribe to a whole podcast. So, these files just sat in a dropbox folder that I'd "listen to one day". I forgot it was there. Recently, [CGPGrey](https://twitter.com/cgpgrey "CGPGrey") was talking on [Cortex](https://www.relay.fm/cortex "Cortex") about a similar problem (though with audio books). The result was this workflow below. 

I've been using it to create a custom podcast feed of random audio files that I throw in dropbox. I get a notification in Overcast when they are ready, and I can add them to my existing listening queue. Awesome

## Prerequisites

1. [Dropbox](https://itunes.apple.com/us/app/dropbox/id327630330?mt=8&at=11laRZ&ct=pro "Dropbox") (iOS App)
2. [Workflow](https://itunes.apple.com/us/app/workflow-powerful-automation/id915249334?mt=8&at=11laRZ&ct=pro "Workflow") (iOS App)
3. Any podcast client that accepts an RSS feed. ([Overcast](http://apple.co/1hyKcRq "Overcast") is 100% free)
4. [Huffduffer](https://huffduffer.com/ "Huffduffer") Account
5. You have audio files in Dropbox somewhere

## Setup

1. Setup Dropbox on iOS
2. Open [this url](https://workflow.is/workflows/8e8692c8bacd4dc39c944edb18b0dea8 "this url") in Safari
3. Tap "Get Workflow" ![](https://farm6.staticflickr.com/5690/22099535245_93b81398fb_o_d.jpg)
4. Allow Safari to open Workflow ![](https://www.flickr.com/photos/timothybroder/22099516045/in/datetaken/)
5. Open the workflow in Workflow ![](https://www.flickr.com/photos/timothybroder/22073343796/in/datetaken/)
6. Check to see if Workflow has access to Dropbox ![](https://www.flickr.com/photos/timothybroder/21911637698/in/datetaken/)
7. Hit Done
8. Go back into the workflow and run it
9. Navigate to where your audio files are in dropbox ![](https://farm6.staticflickr.com/5767/21911561790_82249be6f8_o_d.png)
10. Tap the one you want, and give it a Title ![](https://farm1.staticflickr.com/693/22109773541_ff38564705_o_d.png)
11. Go to your profile page in huffduffer and grab the RSS url for your profile
12. Add this by URL in your podcast app of choice ![](https://farm6.staticflickr.com/5658/22087276112_010ff80060_o_d.jpg)
13. You are done! ![](https://farm6.staticflickr.com/5771/22099817315_0cbdc22934_o_d.png)