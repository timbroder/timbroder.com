---
author: tim
comments: true
date: 2017-01-15 09:18:00+00:00
layout: post
link: ''
slug: adding-smartspeed-to-any-audio-file

title: Adding Smart Speed to any audio file with Audacity

categories:
- Code
tags:
- 
- 
---

The [Overcast](https://geo.itunes.apple.com/us/app/overcast-podcast-player/id888422857?at=11laRZ&ct=afp15&ls=1&mt=8 "Overcast") podcast app by [Marco Arment](https://twitter.com/marcoarment "Marco Arment") has a killer feature called Smart Speed and it has ruined all audio listening for me outside of the app. Smart Speed *dynamically shortens silences in talk shows*; it saves you time, and makes them feel tighter and more produced. I wish I had it everywhere.

[Tekside](http://tekside.net/ "Tekside") is a podcast network I'm part of, and while some of our shows are heavily edited, many are not. While doing some audio work for [something else](http://heymamapodcast.com/ "something else"), my [wife](https://twitter.com/bingopajamas "wife") noticed that [Audacity](http://www.audacityteam.org/ "Audacity") (cross platform) has a crud version of this type of audio processing. Here's how to set it up.

## Setup

1. [Download Audacity](http://www.audacityteam.org/download/ "Download Audacity") & install it. But don't run it yet. (If it opened as part of install, close it)
2. If you are working with audio files already, head to "Making it work". If you are pulling in .mov files from [Skype Call Recorder](http://www.ecamm.com/mac/callrecorder/ "Skype Call Recorder") see step 3
3. Install FFMPEG: If you are on a Mac, download and install [this](http://lame3.buanzo.com.ar/FFmpeg_v0.6.2_for_Audacity_on_OSX.dmg "this") Otherwise, see [these instructions](http://manual.audacityteam.org/man/faq_installation_and_plug_ins.html#ffdown "these instructions")

## Making it work

1. Open Audacity
2. Click File -> Import Audio
3. Choose your audio recording
4. Optional: If Audacity prompts you to "Select Stream(s) to import", select all of them and hit OK ![](https://c1.staticflickr.com/6/5567/32174620192_8f027bbbef_b.jpg)
5. Select one of the audio streams and hit CMD+A to highlight all of the audio
6. Click Effect -> Truncate Silence
7. I currently have **duration** set to **0.9** and **truncate to** set to **0.5**. What this does is find any silence longer that 0.9 seconds and shorten it to 0.5 seconds ![](https://c1.staticflickr.com/1/281/32174511182_ee8cfc68db_b.jpg)
8. Hit ok & let it run
9. File -> Export *(As a WAV. You may have to hit OK a few times)*
10. Done!

I'm still figuring out which duration will work best for which shows. It depends how fast the people on it already naturally talk and flow which each other. For [Show and Tell](http://tekside.net/showandtell/ "Show and Tell"), our movie podcast, the above settings strip a 55 min recording to 48 mins and it sounds a lot tighter. 