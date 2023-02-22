---
author: tim
comments: true
date: 2014-08-04 22:28:26+00:00
dsq_thread_id: '2900953510'
layout: post
link: ''
slug: restore-time-machine-backup-synology-nas
title: How to Restore a Time Machine Backup From a Synology NAS
wordpress_id: 1649
category: Code
tags:
- HOWTO
---

My Sunday morning started off like this:

> “There’s an error with the EFI system partition’s file system.” Well today’s
off to a great start // [@siracusa](https://twitter.com/siracusa) — Tim Broder
(@timothybroder) [August 3,
2014](https://twitter.com/timothybroder/statuses/495938712375939073)

My laptop wouldn’t finish booting. 

All I got was a backlit, black, screen.  I
went through numerous combinations of booting with option, cmd+R, cmd+shift+R,
un-mounting, ejecting. In all methods, trying in vain to get the Disk Utility
to verify and [repair](http://www.cultofmac.com/264991/repair-verify-hard-drive-command-line-os-x-tips/) the hard drive. I tried from Recovery Mode and
a fresh OSX install on a USB hard drive. The things I saw on my screen
included:

  * The aforementioned [black screen](https://discussions.apple.com/message/18177363)
  * A backlit, white, screen
  * A gray screen with a flashing [Folder](http://support.apple.com/kb/TS1440?viewlocale=en_US&locale=en_US) with a question mark in it
  * “Live file system repair is [not supported](https://discussions.apple.com/thread/5739421?tstart=0)”
  * There’s an error with the EFI system partition’s file system.”
  * Clean installs were failing: "[An Error](https://discussions.apple.com/thread/5467959?tstart=0) occurred while preparing the installation.  Try running this application again.”
  * “Verified failure: [unrecognized](http://forums.macrumors.com/showthread.php?t=1667862) file system”

After a few hours I moved from “I need to fix this” to “I need to get my
laptop back up.” 

Ok let’s do a clean install: "An Error occurred while
preparing the installation.  Try running this application again.” 

Crap. 

At
this point I booked a genius bar appointment for the next day just in case. 3
clean installs failed. Took a break to think about it…. I got back into Disk
Utility and formatted the partition. Then deleted/recreated the partitions.
Formatted again (why not?). At this point a clean install worked. Ok… Seems
like the drive isn’t totally dead. But, I want to do a fresh restore from my
Time Machine backup on my [NAS](http://www.amazon.com/gp/product/B008U69LC4/ref=wms_ohs_product?psc=1&tag=nyen0e-20&ie=UTF8). I normally also have a
SuperDuper! backup. I didn’t. That’s a story for another time. Apple doesn’t
quite support NAS Time Machine; there are a few hoops you have to jump
through:

1. Get into recovery mode (Boot while holding cmd+R)
1. Open the terminal
1. Go to Volumes
	```
	cd /Volumes
	ls -la
	```
1. Make a place to mount the NAS
	```mkdir synology```
1. Double check it’s there
	```ls -la```
1. Mount your NAS. This is the IP of it in my house. This should be the IP you use to get to the admin console. My Admin is: http://192.168.1.205:5000
You’ll also need to know what share your Time Machine back is in. For me, it has it’s own drive, represented by “timstimemachine”. I’ll go into the details of my NAS setup in a future post
	```mount -t afp afp://admin:[password]@192.168.1.205/timstimemachine synology```
1. Check you see files in the synology folder
	```
	cd synology
	ls -la
	```
1. Even though we’re mounted, we won’t see this backup in Time Machine Restore just yet. Use hdid (hard drive image driver) to mount the sparse bundle image
	```hdid [your back-up name].sparsebundle```
1. If your drive or the backup was encrypted, You’ll need to enter it’s password at this time
1. Make sure your backup is still mounted
	```ls -la```
1. Ok, quit the Terminal and load up Time Machine Restore
1. You should see the backup we just mounted
1. Start the restore. It can take a while. Mine is around 360 gigs and it estimated 16 hours. It took a lot less than that but it finished when I was sleeping so I don’t have an accurate time.

Sunday was a stressful day. Hopefully this can help you.