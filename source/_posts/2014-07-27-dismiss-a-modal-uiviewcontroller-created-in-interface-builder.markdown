---
author: tim
comments: true
date: 2014-07-27 22:31:11+00:00
dsq_thread_id: '2878223721'
layout: post
linked_list_url: ''
slug: dismiss-a-modal-uiviewcontroller-created-in-interface-builder
title: Dismiss a Modal UIViewController created in Interface Builder
wordpress_id: 1626
categories:
- Code
tags:
- interfacebuilder
- swift
---

There are a [number](http://stackoverflow.com/questions/2796438
/uibarbuttonitem-target-action-not-working) of posts on this
[subject](http://stackoverflow.com/questions/7719237/add-a-custom-selector-
to-a-uibarbuttonitem) on Stack. They involve re-instantiating (this seems
slower to me) or yanking the view from a UIButton (this feels dirty).

I’d rather just update the UIBarButtonItem that I already have:



[![2014-07-27_1826](https://farm6.staticflickr.com/5566/14575059147_d33d111203
_b.jpg)](https://www.flickr.com/photos/timothybroder/14575059147 "View
'2014-07-27_1826' on Flickr.com" )

All I needed to do, was attach the appropriate target and action to the
UIBarButtonItem:

    
    
    class SettingsTableViewController : UITableViewController {
        
        @IBOutlet weak var doneBarButton: UIBarButtonItem!
        
        init(coder aDecoder: NSCoder!) {
            super.init(coder: aDecoder)
        }
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
            doneBarButton.target = self
            doneBarButton.action = "donePressed:"
        }
        
        @IBAction func donePressed(b:UIBarButtonItem) {
            self.dismissViewControllerAnimated(true, completion: {})
        }
    }
    

