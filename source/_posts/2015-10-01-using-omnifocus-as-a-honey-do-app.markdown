---
layout: post
title: Using Omnifocus as a Honey-Do App
date: 2015-10-01 12:40
categories:
- Productivity
tags:
- OmniFocus
- kids
---

Laura and I are trying a formal Honey-Do List. We're both very task-oriented people and we really like lists. There are a lot of things I can do to help with Charlie but have to wait until I get home from work. Vice-versa, stuff I'll think of while I'm at work that Laura should take a look at on the days she's home. 

We probably should have done this a long time ago but even suggesting that one of us ditch our to-do app of choice would have been blasphemy. I switched to [OmniFocus](http://apple.co/1CHgCmI "Omnifocus") this year and you'd have to pry it from my cold dead fingers. Laura really likes [Remember The Milk](http://apple.co/1Vqhyo8 "Remember The Milk") [RTM] but I've never cared for it. One option was just use another app just for the HoneyDo list. The front-runner would be [Wunderlist](http://apple.co/1PQawlI "WunderList"). This would work.... but meh. This would mean another slot on our coveted iPhone home screens. A space we didn't want to give up. I personally would have trouble remembering to go into it. If it's not in OmniFocus, it's not in my world.

There had to be a solution. What actually mattered? It boiled down to two things:

1. The tasks entering "our world" of to-dos
2. The other party being notified (or at least aware) that a task had been completed (or is still outstanding)

Neither OmniFocus or RTM have the ability to do 2-way sync. But, they CAN take in tasks through email addresses. Ok, there is a way for tasks to get into our respective worlds from somewhere else. Check.

The next step was to have something be the single point of entry for tasks. This entry point would also serve as the aggregate list of both our worlds. Wunderlist and Todoist both have great API's, there had to be something. There was also a good chance that [IFTTT](https://ifttt.com/ "IFTTT") or [Zapier](https://zapier.com "Zapier") could connect to everything. IFTTT was a bust, but Zapier hooked us up. I went with Wunderlist because Todoist's notifications are a premium only feature. We're not sure if we'll actually use the notifications, but I didn't feel like switching if we decided to in the future. Wunderlist could also handle shared lists, asignees, and due dates.

How to set it up:

1. Choose a trigger and action
	
	When this happens: Wunderlist; New Task
	
	Do this: OmniFocus; Create Task
	
	![](https://farm1.staticflickr.com/719/21681067339_db906f98a5_o_d.png)
	
1. Make sure your Wunderlist and Omnifocus accounts are set up

	![](https://farm6.staticflickr.com/5809/21679942520_236c324ea8_o_d.png)
	
1. Create a shared list in Wunderlist and add someone to it

	![](https://farm1.staticflickr.com/709/21680180338_e6cc122036_o_d.png)
	
1. Tell Zapier to only trigger on the list you just created. (We'll add advanced filtering later)

	![](https://farm6.staticflickr.com/5691/21680197978_0b416d2374_o_d.png)
	
1. Create the OmniFocus task. I put "BroderFam" in front so I know where it came from, the name of the task, and the due date. (I manually set the due date when I process my OmniFocus inbox)

	In the body, I set urls back to Wunderlist so I can mark the item as done in there as well as in Omnifocus. The first URL is for when I'm on my laptop and want to open the Wunderlist website. The 2nd one is a deep link to the iOS app for when I'm on my phone
	
	Keep note of the assignee ID on the first task that comes in, you'll want it for advanced filtering

	![](https://farm1.staticflickr.com/590/21245318674_4fbd5a2429_o_d.png)
	
1. Test the Zap and turn it on. Now, any task that goes into your list will go to OmniFocus. But, we don't want that. We only want the ones that are assigned to me.

	Now that you have the assigneeID from the first task, go back into the Zap and add a custom filter
	
	![](https://farm6.staticflickr.com/5658/21841976776_1f20a8cf24_o_d.png)
	
	Also go back in and remove AssigneeID from the body of the task
	
So, a little bit of double work when marking things as read. But I'm really happy with this system. Let me know in the comments if you have any trouble setting this up and I'll help
