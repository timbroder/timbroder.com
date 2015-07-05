---
author: tim
comments: true
date: 2008-09-22 22:05:00+00:00
layout: post
slug: how-to-stream-video-to-xbox-360-from
title: How to stream video to an Xbox 360 from linux
wordpress_id: 170
categories:
- Code
tags:
- HOWTO
- ubuntu
- xbox
---

There are a couple of different methods floating around to do this, but I think this is the quickest and easiest to get set up.  So far, I like this better then FTP'ing files over to my old modded xbox.  Some notes about further investigating will be at the bottom. Note: this was tested on an Ubuntu machine.



  * Make sure your 360 has all the current updates


  * Install ushare



**"sudo apt-get install ushare"**






  * if ushare complains about a missing libdlna dependency, get it from here: **"wget http://www.geexbox.org/debian/pool/main/libdlna/libdlna0_0.2.3-0ubuntu1_i386.deb"



**


* Edit the ushare configuration



**"sudo vim /etc/ushare.conf"**



update any ports or network devices you need to (I changed mine to eth1 so it would just use the wireless) as well as what folder to scan




* There is a mime-type you need to update



**"sudo vim /usr/share/mime/packages/freedesktop.org.xml"**



change **mime-type type="video/x-msvideo"** to **mime-type type="video/x-ms-wmv"**


* restart gnome (**ctrl + alt + backspace)**


* start ushare with **"ushare -x"**


* Go to the media blade on your 360 dashboard


* Press 'X' to change the source


* You should see uShare (or whatever you named the share to in the configuration)


* play videos!


* note: **to play a .mkv file, rename it to .m4v **



To Do:



  * get uShare to automatically rescan the directory (currently if I add a video to the folder, the 360 will not see it until i restart uShare)


  * get 1080p HD content to stream.  I have tried a few re-encapsulation methods so far, nothing working yet


  * this is an xbox thing, that hopefully will be fixed in the fall update, but navigating large folder trees can get annoying




