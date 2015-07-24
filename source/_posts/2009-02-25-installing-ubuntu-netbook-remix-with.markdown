---
author: tim
comments: true
date: 2009-02-25 20:51:00+00:00
dsq_thread_id: '111207570'
layout: post
link: ''
slug: installing-ubuntu-netbook-remix-with
title: Installing Ubuntu Netbook Remix (with Jaunty) on an MSI Wind
wordpress_id: 191
categories:
- Code
tags:
- HOWTO
- netbook
- ubuntu
---

I recently picked up a MSI Wind Netbook and love the damn thing. [Ubuntu
Netbook Remix](http://www.canonical.com/projects/ubuntu/unr) brings in a great
UI which makes navigating on the small screen much easier.I used Ubuntu Jaunty
Jackalope Alpha 4 as the base install, mainly because I didn't want to go
through the trouble of converting my ext3 partitions to ext4 when it comes out
on April 23rd, and the driver support is more complete.  I haven't had many
problems with it aside from a few random firefox crashes.  


![](http://1.bp.blogspot.com/_Ng3QbVQfLZ8/SaWunIJBkfI/AAAAAAAAa7c/XG8CFukv18E/s1600-h/Screenshot1.png)



![](http://3.bp.blogspot.com/_Ng3QbVQfLZ8/SaYPBBQ2EmI/AAAAAAAAa74/DBWWqZQOEko/s1600-h/partitions.png)

1. We're going to make a bootable USB stick to install Ubuntu   

2. On a separate machine, [Download ](http://www.ubuntu.com/testing/jaunty/alpha4#Download%20Alpha%204)the cd image.  If you want to use 8.10, get the iso [here](http://www.ubuntu.com/getubuntu/download) 
3. if you are already using an Ubuntu install of 8.10 or higher, skip to step 11  

4. burn the image to a cd  

5. Boot to the cd, do not install, load the demo OS
6. click System-&gt;Administration-&gt;Create a USB startup disk
7. point it to either the cd in your drive, or the iso
8. point to the correct USB stick
9. the rest of the settings can stay default
10. click Make Startup Disk
11. Insert the usb drive into your wind, power it on, and hit delete to go into the bios, change the first boot device to USB Drive
12. save and exit the bios
13. If the wind boots off of the USB stick correctly, you should see the same screen as when you had booted off the cd
14. [Install ](https://help.ubuntu.com/community/GraphicalInstall)Ubuntu
15. I made my partitions as follows:  
|30 gig recovery partition|20 gig XP partition|15 Gig Ext4 Ubuntu Partition|4
gig swap partition|the rest of the drive as an ext4 partition  
	![](http://3.bp.blogspot.com/_Ng3QbVQfLZ8/SaYPBBQ2EmI/AAAAA
AAAa74/DBWWqZQOEko/s1600-h/partitions.png)




16. That last partition is where I will mount my home directory, as well as mount from windows xp using [ext2fs ](http://www.fs-driver.org/faq.html)(I havn't actually tried this yet)
17. Add the netbook remix repositories to your system.  This can be be done in synaptic or by typing the following into a terminal  
sudo gedit /etc/apt/sources.list

18. add the following:  
deb http://ppa.launchpad.net/netbook-remix-team/ubuntu intrepid main  
deb-src http://ppa.launchpad.net/netbook-remix-team/ubuntu intrepid main

19. sudo apt-get update
20. sudo apt-get install go-home-applet   
sudo apt-get install window-picker-applet  
sudo apt-get install maximus  
sudo apt-get install human-netbook-theme

21. Select the "Human Netbook Theme" in System Preferences&gt;Apperance 
22. go into System Preferences-&gt; sessions-&gt;startup programs and confirm that "Maximus" and "window-picker-applet" are thre  

23. **Disable Compiz Effects** System Preferences-&gt;Appearance-&gt;None  

	This is what is required to get netbook remix running, I continued with the
following to tweak it some more  


24. Delete the bottom panel by right clicking on it  

25. Delete all the applets on the top panel by right clicking on them
26. Add applets to the top panel so it ends up like:  
Window Picker Applet | Trash Can |Notification Area | MixerApplet | Clock

27. I also made alt+q the hotkey to show the desktop, makes navigating to it faster. Another option is the show desktop applet button that can be added to the top bar.  Preferences-&gt;keyboard shortcuts-&gt;"Hide all normal windows....."  

More info is available
[here](http://wiki.msiwind.net/index.php/Ubuntu_8.04_Hardy_Heron).  
