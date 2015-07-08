---
author: tim
comments: true
date: 2014-05-31 16:14:22+00:00
dsq_thread_id: '2726415845'
layout: post
linked_list_url: None
slug: reordering-nsfetchedresultscontroller
title: Reordering a NSFetchedResultsController
wordpress_id: 1531
categories:
- Code
tags:
- CoreData
- ios
---

I’m working with a NSFetchedResultsController backed UITableView.  Up until
now I’ve just been ordering the items by the time they were added.

I’m moving on to Delete and Edit.  Editing the content itself isn’t needed,
once an item is added to this list, it can’t be changed. Deleting is
straightforward in

[c]- (void)controller:(NSFetchedResultsController *)controller
didChangeObject:(id)anObject atIndexPath:(NSIndexPath *)indexPath
forChangeType:(NSFetchedResultsChangeType)type newIndexPath:(NSIndexPath
*)newIndexPath { [/c]

With reordering, I have a conundrum.  I have an
[approach](http://stackoverflow.com/a/2013070/647343) for the actual re-order
that will have the View and the data playing nice. But, now I need to persist
the order.  I don’t have a property in Core Data for this (yet).  I’m trying
to figure out what to set this property to. The brute force approach is to use
the indexPath of the cell.  I have concerns with this.  Adding an item
automatically puts it at the top of the list. This would give it an index of 0
(I only have 1 section).  But, then I would have to update the order property
of every other item in the list. The same goes for moving: each item and every
item in between (I can luckily skip the outer bounds) will have to be updated.
I don’t like this. There has to be a better way, I just need to figure it out.

Some kind of indexPath+hash? indexPath+integer?

Eventually I’ll reach a list size where I run into performance problems with
the brute force approach. The cop out would be to limit the size of the list.
I don’t want to do that either.  I don’t know if I’ll go to the extreme of
Brent Simmons’ data set of [30,000 items from Daring Fireball’s
archive](http://inessential.com/2013/10/05/vesper_sync_diary_2_core_data), but
I want to shoot for that.

I’ll update this post with my progress

**Update** 2014-05-31 01:02 PM

[This](http://stackoverflow.com/a/1648504) is a great starting point for
dealing with reordering. I was on the right track with only dealing with the
differences between items that get moved.  Dragging an item way down on a list
may(?) not happen much, it’s annoying to do. I think I’m going with that
assumption for now.  I still don’t feel great about the number of updates for
an insert…

Batch fetch/update/save is my starting point

**Update** 2014-06-06 04:04 PM

It looks like iOS 8 might have better bulk update support. Downloading [this](
http://devstreaming.apple.com/videos/wwdc/2014/225xxgzhqylosff/225/225_hd_what
s_new_in_core_data.mov?dl=1) session now

> [@inessential](https://twitter.com/inessential)
[@brentsimmons](https://twitter.com/brentsimmons) You might like the Core Data
video. new NSBatchUpdateRequest api with a “mark all as read” example as the
demo

>

> -- solsberg (@solsberg) [June 6,
2014](https://twitter.com/solsberg/statuses/474993780186447872)

