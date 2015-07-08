---
author: tim
comments: true
date: 2008-04-26 19:22:00+00:00
dsq_thread_id: '110884706'
layout: post
linked_list_url: ''
slug: fixing-nvidia-8600-gt-on-hardy-heron
title: Fixing Nvidia 8600 GT on Hardy Heron
wordpress_id: 112
categories:
- Code
tags:
- HOWTO
- ubuntu
---

After updating to Hardy I got a white screen of death upon rebooting. After
some research it turned out that this was more of an Nvidia driver issue
rather then Ubuntu. This may not have been the most correct way to fix it, but
it worked for me.

  1. Completely remove nvidia-glx-new  
  

  2. Remove nvidia-kernel-common (this also removes linux-restricted-modules), (I am not sure if step 2 is required)  
  

  3. install build-essentials  
  

  4. Download the Nvidia beta driver that came out on April 10. You can get it [here](http://www.nvidia.com/object/linux_display_ia32_173.08.html)  
  

  5. hit ctrl + alt + f1 to break out of gnome  
  

  6. "sudo /etc/init.d/gdm stop" to shutdown the X server  
  

  7. sudo sh NVIDIA-Linux-x86-173.08-pkg1.run to install the driver. If it asks you to update you're xorg.conf file, let it.  
  

  8. Reboot. ("sudo reboot") You should now be able to enable Desktop effects. YAY FISH!  
  

This issue has also been addressed on the [Ubuntu
Forums](http://ubuntuforums.org/showthread.php?t=712479) and on
[launchpad](https://bugs.launchpad.net/ubuntu/+source/linux-restricted-
modules-2.6.24/+bug/208718)  
  
Note: I have a Dell XPS M1530

