---
author: tim
comments: true
date: 2016-06-09 10:25:00+00:00
layout: post
link: ''
slug: github-file-and-link-tricks

title: Github File and Link Tricks

categories:
- Code
tags:
- github
- productivity
---

2 tricks I learned today that I'd like to share: reliably linking to a specific line and searching for files using fuzzy matching.

# Reliably link to a specific line 

Say you are on the master branch, and you want to reference a line in a file. This could either be for a conversation you are having at that moment, answering a question in a PR, or adding information to a ticket. At that point in time, your link will work great. But, what about when that file gets changed tomorrow? More lines get added higher up, above the link, and the line that the link it pointing to, now points to something else!

You can easily have github switch to the latest commit for the file you are viewing. Just press 'y'. Then, when you link to a line, you are linking to THAT version of the file. You reference will always be intact.

# Search for files using fuzzy matching 

When you are browsing through files, there is a button in the upper right that says "Find file". I'm sure it's been there forever, but I just noticed it. 

This brings you to a full file tree that you can search using fuzzy matching. Just like if you were in your IDE quick-opening a file!
