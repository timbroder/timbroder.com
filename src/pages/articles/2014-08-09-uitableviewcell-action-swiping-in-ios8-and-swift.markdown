---
author: tim
comments: true
date: 2014-08-09 20:43:58+00:00
dsq_thread_id: '2914027664'
layout: post
link: ''
slug: uitableviewcell-action-swiping-in-ios8-and-swift
title: UITableViewCell Action Swiping in iOS8 and Swift
wordpress_id: 1671
category: Code
tags:
- swift
---

Mail.app in iOS7 brought swiping cells to the inbox. The iOS8 beta added a 3rd
button to it.  Apple has also introduced an API to assist with creating this
effect: [UITableViewRowAction](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UITableViewRowAction_class/index.html).
Prior to this, I used
[SWTableViewCell](https://github.com/CEWendel/SWTableViewCell).

![](/images/2014-08-09-uitableviewcell-action-swiping-in-ios8-and-swift/14870105002_77af4bf515_b.jpg)

Below is how to get the basic functionality working. Please note that you have
to implement the 2nd function whether it has a body or not

```swift
class TIMUITableViewDelegate: NSObject, UITableViewDelegate {
    func tableView(tableView: UITableView!, editActionsForRowAtIndexPath indexPath: NSIndexPath!) -&gt; [AnyObject]! {
        var shareAction = UITableViewRowAction(style: .Normal, title: "Share") { (action, indexPath) -&gt; Void in
            tableView.editing = false
            println("shareAction")
        }
        shareAction.backgroundColor = UIColor.grayColor()
        
        var doneAction = UITableViewRowAction(style: .Default, title: "Done") { (action, indexPath) -&gt; Void in
            tableView.editing = false
            println("readAction")
        }
        doneAction.backgroundColor = UIColor.greenColor()
        
        var deleteAction = UITableViewRowAction(style: .Default, title: "Delete") { (action, indexPath) -&gt; Void in
            tableView.editing = false
            println("deleteAction")
        }
        
        return [deleteAction, doneAction, shareAction]
    }
    
    func tableView(tableView: UITableView!, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath!) {
    }

}
```

I can’t get the (-) delete indicator to appear when I put the table into edit
mode though. Setting UITableViewCell.shouldIndentWhileEditing = NO is supposed
to disable this effect. I’ve tried setting it in 3 places:

  * On the cell directly 
  * In interface builder: [http://screencast.com/t/TUg7To46vKd0 ](http://screencast.com/t/TUg7To46vKd0)
  * In the appropriate delegate method

I’ve had to add some workarounds to deal with this for now.  I’ve filed
[rdar://17969970](http://openradar.appspot.com/17969970) against this. For
now, this is how I’m handling by checking if I’m already in edit mode when I
build out the actions array. This isn’t ideal at all. I don’t even want to be
able to delete when I’m in edit mode, just reorder. Apologies for switching
back to obj-c. The delegate I’m working in is older.

```swift
- (void) endEditing
{
    self.editMode = NO;
    self.editControlButton.title = @"Reorder";
    [self setEditing:NO animated:YES];
    //[self.tableView reloadData];
}

- (void) startEditing
{
    self.editMode = YES;
    self.editControlButton.title = @"Done";
    [self.tableView setEditing:YES animated:YES];
}

#pragma - mark UITableViewDelegate

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    return YES;
}

- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return UITableViewCellEditingStyleDelete;
}

- (BOOL)tableView:(UITableView *)tableview shouldIndentWhileEditingRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSLog(@"shouldIndentWhileEditingRowAtIndexPath");
    return NO;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    TCORead *item = [self.fetchedResultsControllerDataSource selectedItem];
    manager.currentRead = item;
}

- (NSArray *)tableView:(UITableView *)tableView editActionsForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewRowAction *deleteAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleDestructive title:@"Delete" handler:^(UITableViewRowAction *action, NSIndexPath *indexPath){
        [self.tableView setEditing:NO];
    }];
    
    //workaround, rdar://17969970
    //normally don't want to be able to get into this menu when reordering
    if (!self.editMode) {
        UITableViewRowAction *shareAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleNormal title:@"Share" handler:^(UITableViewRowAction *action, NSIndexPath *indexPath){
            [self.tableView setEditing:NO];
        }];
        shareAction.backgroundColor = [UIColor grayColor];
        
        UITableViewRowAction *doneAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleDestructive title:@"Done" handler:^(UITableViewRowAction *action, NSIndexPath *indexPath){
            [self.tableView setEditing:NO];
        }];
        doneAction.backgroundColor = [UIColor greenColor];
        
        [self startEditing];
        return @[deleteAction, doneAction, shareAction];
    }
    
    return @[deleteAction];
}

- (void)tableView:(UITableView *)tableView didEndEditingRowAtIndexPath:(NSIndexPath *)indexPath
{
    [self endEditing];
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    //empty on purpose
}
```    

This post and the Radar helped me collect my thoughts to post on [Stack](http://stackoverflow.com/questions/25222872/uitableviewcell-not-respecting-shouldindentwhileediting-no). I’ve been afraid of backlash or Noob. Time to get over it.

 **Update 2014-09-11**
    

[Vanyas](http://timbroder.com/2014/08/uitableviewcell-action-swiping-in-ios8-and-swift.html#comment-1565598353) has a great sample application that addresses what I’m trying to do.  I was forcing the delete button on the right hand side myself.  Updating editingStyleForRowAtIndexPath to the below fixed my issue:

```c
- (UITableViewCellEditingStyle)tableView:(UITableView *)tableView editingStyleForRowAtIndexPath:(NSIndexPath *)indexPath
{
    //return UITableViewCellEditingStyleDelete;
    return tableView.isEditing ? UITableViewCellEditingStyleNone: UITableViewCellEditingStyleDelete;
}
```
 