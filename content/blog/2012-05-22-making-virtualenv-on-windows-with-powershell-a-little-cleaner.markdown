---
author: tim
comments: true
date: 2012-05-22 15:27:45+00:00
dsq_thread_id: '699887861'
layout: post
link: ''
slug: making-virtualenv-on-windows-with-powershell-a-little-cleaner
title: Making virtualenv on windows with powershell a little cleaner
wordpress_id: 1090
category: Code
tags:
- django
- powershell
- python
- virtualenv
- windows
---

While I code on a mac at home, I can't live without my giant dual screens and
solid state drive at work so I'm on a windows 7 box.  Most of the time it's
fine, does everything I need, and I'm happy.  I became full of rage for the
first time last week trying to properly get virtualenv to play nice with
powershell.  (If you code on windows and are in the terminal a lot, switch to
powershell, its great and comes with windows 7. There is a download for
Windows XP) I'm not going to recap how to set up virtualenv for your project
as there is a great walk through on that
[here](http://www.saltycrane.com/blog/2009/05/notes-using-pip-and-virtualenv-django/).  The issue on windows is around when you want to activate your
project.  Powershell has a restricted execution policy turned on by default.
The manual way around this is to run powershell as an administrator, and run
this: [code] Set-ExecutionPolicy Unrestricted [/code] Works, but that's an
extra click.  You can also change this value permanently in the registry at
the key listed below, but that didn't seem to stick when opening powershell
through [launchy](http://www.launchy.net/) [code]
HKLM\Software\Microsoft\PowerShell\1\ShellIds\Microsoft.PowerShell [/code]
Enter my hacked up solution. Create a shortcut for powershell with these
parameters: 

```
Target: %SystemRoot%\syswow64\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy
Unrestricted Start In: %HOMEDRIVE%%HOMEPATH% 
```

Then, if your workspace and projects are set up relatively the same, you can create a powershell script (or a cmd script if not using powershell), named workon.ps1 that looks
something like this: 

```
$ENV:PYTHONPATH="" 
cd C:\Users\tbroder\workspace\$args\ .\myenv\Scripts\activate
```

I threw
this in my C:\Python26\Scripts folder.  It assumes your project lives in a
workspace folder, that your project name is a single word, and that all of
your virtualenvs are called myenv.  Example of using it below: 

```
Windows PowerShell Copyright (C) 2009 Microsoft Corporation. All rights reserved. PS
C:\Users\tbroder&gt; workon gsb (myenv) PS C:\Users\tbroder\workspace\gsb&gt;
```