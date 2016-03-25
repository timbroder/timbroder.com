---
layout: post
title: Testing UIViewController Transitions with Quick and Swift 
date: 2016-01-31 14:57
categories:
- Code
tags:
- swift
- testing
- quick
---

*The examples below are using the [Quick](https://github.com/Quick/Quick "Quick") test framework, but the principals we're going to talk about can be used in any setup.*

We have some complicated logic further down our user registration flow. I want to make sure that the right UIViewControllers are appearing when they are supposed to. I've been reading a [few](http://swiftandpainless.com/testing-if-a-view-controller-got-pushed/ "few") [different](https://www.natashatherobot.com/ios-testing-view-controllers-swift/ "different") [approaches](http://www.iosmike.com/2014/08/unit-testing-viewcontrollers-in-swift.html "approaches") on how to handle this. Below is where I've ended up, and I'm pretty happy with it.

For simplicity's sake, I'm going to show how to test if the user has tapped "Login" or "Register" on our opening screen. We can assume we have a LoadingViewController which represents the first screen. On this screens are two buttons, which correspond to these actions:

```swift
@IBAction func tapLogin(sender: AnyObject) {
    self.navigationController?.pushViewController(self.storyboard?.instantiateViewControllerWithIdentifier("loginview") as! LoginViewController, animated: true)
}

@IBAction func tapRegister(sender: AnyObject) {
    self.navigationController?.pushViewController(self.storyboard?.instantiateViewControllerWithIdentifier("registerview") as! RegisterViewController, animated: true)
}
```

We also have a UINavigationController taking care of the view hierarchy. I also want to use the transitions and IDs already set up in the Storyboard.

Let's start by referencing the UINavigationController and the UIViewController we're going to start with.

```swift
class LandingScreenUITests: QuickSpec {
    override func spec() {
        describe("Landing Screen") {
            
            var viewController: LoadingViewController!
            var navigationController: UINavigationController!
            
            
        }
    }
}
```

Next, we're going to instantiate the storyboard, both controllers, and push the VC onto the view hierarchy

```swift
beforeEach {
    let storyboard = UIStoryboard(name: "Main", bundle: NSBundle(forClass: self.dynamicType))
    viewController = storyboard.instantiateViewControllerWithIdentifier("loadingview") as! LoadingViewController
    navigationController = storyboard.instantiateViewControllerWithIdentifier("navigationcontroller") as! UINavigationController
    
    navigationController.pushViewController(viewController, animated: false)
    
    let _ =  viewController.view
}
```

Two gotchas to watch out for here:

1. Make sure Main.Storyboard is available in your Test target
2. Make sure to use the ```self.dynamicType``` bundle above

Missing either of these may result in a weird casting error:

```
Could not cast value of type 'MyApp.LoadingViewController' (0x10b9f5e50) to MyAppUITests.LoadingViewController' (0x11f894370).
```

Finally, lets call the appropriate methods on our initial UIViewController, and test the type of the UIViewController that has been put on the top of the hierarchy. *Note: I use ```toEventually``` here to wait for the transition animation*

```swift
describe("User wants to log in") {
    it("taps Login") {
        viewController.tapLogin(self)
        expect(navigationController.visibleViewController).toEventually(beAKindOf(LoginViewController))
    }
}

describe("User wants to register") {
    it("taps Register") {
        viewController.tapRegister(self)
        expect(navigationController.visibleViewController).toEventually(beAKindOf(RegisterViewController))
    }
}
```

For reference, here is the whole test class together:

```swift
import Foundation
import Quick
import Nimble
@testable import MyApp

class LandingScreenUITests: QuickSpec {
    override func spec() {
        describe("Landing Screen") {
            
            var viewController: LoadingViewController!
            var navigationController: UINavigationController!
            
            beforeEach {
                let storyboard = UIStoryboard(name: "Main", bundle: NSBundle(forClass: self.dynamicType))
                viewController = storyboard.instantiateViewControllerWithIdentifier("loadingview") as! LoadingViewController
                navigationController = storyboard.instantiateViewControllerWithIdentifier("navigationcontroller") as! UINavigationController
                
                navigationController.pushViewController(viewController, animated: false)
                
                let _ =  viewController.view
            }

            describe("User wants to log in") {
                it("taps Login") {
                    viewController.tapLogin(self)
                    expect(navigationController.visibleViewController).toEventually(beAKindOf(LoginViewController))
                }
            }
            
            describe("User wants to register") {
                it("taps Register") {
                    viewController.tapRegister(self)
                    expect(navigationController.visibleViewController).toEventually(beAKindOf(RegisterViewController))
                }
            }
        }
    }
}
```

*Many thanks to the blog posts referenced at the top of this post*
