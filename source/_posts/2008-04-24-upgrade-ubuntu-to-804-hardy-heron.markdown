---
author: tim
comments: true
date: 2008-04-24 14:09:00+00:00
dsq_thread_id: '113969609'
layout: post
linked_list_url: ''
slug: upgrade-ubuntu-to-804-hardy-heron
title: Upgrade Ubuntu to 8.04 Hardy Heron
wordpress_id: 109
categories:
- Code
tags:
- HOWTO
- ubuntu
---

Hardy Heron came out this morning and ubuntu.com is very much down for the
count  
  
You can Still update though, click [here](http://72.14.205.104/search?q=cache:maBlktBTwPAJ:www.ubuntu.com/getubuntu/upgrading+upgrade+ubuntu&hl=en&ct=clnk&cd=1&gl=us&client=firefox-a) for the Google Cache version.  
  
Happy Updating!  
  
New Features in this release:  
  
[Install on an existing filesystem without overwriting
/home](https://wiki.ubuntu.com/UbiquityPreserveHome)  
When I moved from feisty to gutsy, I decided to do a fresh install. One of the
things I had to do was back up my home folder, and when I finished installing
gutsy I just copied it back onto my computer. This new feature will allow
people to install the new version of Ubuntu without it overwriting their home
folder.I'm sure this will come in very handy for people who like trying out
different distro's.  
  
[Hardy Hardware
Detection](https://wiki.ubuntu.com/DesktopTeam/Specs/HardyHardwareDetection)  
This is more of a bug fix than a new feature. Gutsy already has excellent
hardware support and the plan for hardy is even better and more robust
detection of hardware. Sounds good to me.  
  
[GDM Face Browser](https://wiki.ubuntu.com/DesktopTeam/Specs/GdmFaceBrowser)  
One of the changes I made to my gutsy is the GDM. I replaced the old one with
something that allows me to just click on a picture of my username and login.
This will hopefully be the default for hardy.  
  
[Auto Detection of Monitor
Frequency](https://wiki.ubuntu.com/X/AutodetectMonitorFrequency)  
While I was testing gutsy beta I had to manually configure xorg.conf to get it
to the right resolution. It wasn't fun. This should be a thing of the past
with hardy as it will automatically detect everything for you. Huzzah!  
  
[Apt Authentication
Reliability](https://wiki.ubuntu.com/AptAuthenticationReliability)  
Have you ever had an update fail for no reason? Well it actually fails because
of 'transient network failures'. The aim is to make hardy more robust against
these errors.  
  
[Redesign Restricted-Manager
Code](https://wiki.ubuntu.com/DesktopTeam/Specs/RestrictedManagerRewrite)  
They want to expand the role of the restricted manager and change it so that
other distro's can share the joy.  
[  
Handling Full Disks](https://wiki.ubuntu.com/HardyFullDiskHandling)  
I've never had this problem with Ubuntu, but if your disk gets full, things
can get quite ugly. They plan to add a notification and disk clean-up tool
when your running low on space.  
  
[Desktop
Effects](https://wiki.ubuntu.com/DesktopTeam/Specs/HardyDesktopEffects)  
Make compiz fusion more robust and easier to use.  
  
[New Theme](https://wiki.ubuntu.com/DesktopTeam/Specs/HardyTheme)  
Hardy Heron will be getting a shiny new theme, I hope they move away from the
brown theme and choose something lighter and more fresh.  
  
[Easy File Sharing](https://wiki.ubuntu.com/EasyFileSharing)  
To allow people to easily share files over a network. Not more I can say about
this.  
  
[Dual/Multi Monitor Support](https://blueprints.launchpad.net/ubuntu/+spec/multi-monitor-config)  
Currently you have to manually tweak Ubuntu if you want to use more than one
monitor. They want to fix this for hardy.  
  
[Integrate Prefetch into
Ubuntu](https://wiki.ubuntu.com/DesktopTeam/Specs/Prefetch)  
I noticed a slightly increased start up time in gutsy compared to feisty.
Hardy will use file prefetch and other optimisations to speed up boot time.  
  
[Automatix-Ubuntu Team Collaboration](https://wiki.ubuntu.com/Automatix/Ubuntu_Team_Collaboration?highlight=%20automatix%20#81830218674224151)  
Automatix was extremely helpful for me in feisty. Although I don't use it in
gutsy, its good that they are collaborating with the automatix team.  
  
[Single Click Install](https://wiki.ubuntu.com/SingleClickInstall)  
Installing software is already pretty straightforward in Ubuntu. They want to
make it even easier to install third party applications. I'm not complaining.  
  
[Apparmor Integration](https://wiki.ubuntu.com/HardyAppArmor)  
This is already a part of gutsy, the plan is to increase integration to make
Ubuntu even safer.  
  
[Firewall](https://blueprints.launchpad.net/ubuntu/+spec/ubuntu-firewall)  
Make it easier for users to configure their firewall.  
  
[Third Party Apt](https://blueprints.launchpad.net/ubuntu/+spec/third-party-apt)  
Now when you install third party apps, you have to manually add the software
repository to the sources.list. This spec makes it easy for users to install
third party software and have it update automatically.  
  
[**Revamped Logout
Screen**](https://wiki.ubuntu.com/DesktopTeam/Specs/ExitStrategy)  
They want to streamline the options you have when you click that big red
button, to make things less confusing.  
  
[Better Integrated Wine](https://blueprints.launchpad.net/ubuntu/+spec/better-
integrated-wine)  
Better Wine will make it easier for Windows users to convert, thus helping to
solve [bug #1](https://blueprints.launchpad.net/bugs/1).  
  
[Xorg 7.3](https://wiki.ubuntu.com/Xorg7.3Integration)  
This is one of the features that missed the gutsy deadline. This should make
manual configuration of xorg.conf obsolete. Another much anticipated feature
is Bullet Proof X, which will go into a graphical safe mode if anything goes
wrong with X.  
  
[Slick Boot](https://wiki.ubuntu.com/SlickBoot)  
To improve the boot and shutdown process and also make the things look nicer.

