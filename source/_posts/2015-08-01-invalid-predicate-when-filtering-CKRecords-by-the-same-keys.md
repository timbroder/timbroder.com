---
layout: post
title: Invalid predicate when filtering CKRecords by the same keys?
date: 2015-08-01 20:19
---

Originally posted on [StackOverflow](http://stackoverflow.com/questions/31441807/invalid-predicate-when-filtering-ckrecords-by-the-same-keys "StackOverflow")

I have a CKRecord type "Follow" which stores the user's ID and the ID of a friend they follow. (Assume that a user can only follow 1 person and the logic around that is handled elsewhere). 

Screenshot of record definition in CloudKit

![](https://farm1.staticflickr.com/313/20186044436_b4629376af_z_d.jpg)

I want to query the Follow records to confirm that two users follow each other and are in fact, friends.

These are the base queries. Each works fine on it's own

```swift
let followPredicate = NSPredicate(format: "userID == %@ AND followsID == %@", userId, followsID)
let followedPredicate = NSPredicate(format: "followsID == %@ AND userID == %@", userId, followsID)
```

I want to combine these two predicates and query once, so that if two records come back, it's assumed that the different users follow each other

I've tried to combine them both manually and by using a NSCompoundPredicate:

```swift
let friendPredicate = NSCompoundPredicate(type: NSCompoundPredicateType.OrPredicateType, subpredicates: [followPredicate, followedPredicate])
let friendPredicate = NSPredicate(format: "(followsID == %@ AND userID == %@) OR (userID == %@ AND followsID == %@)", userId, followsID, userId, followsID)
```

I then use the query here:

```swift
let friendQuery = CKQuery(recordType: "Follow", predicate: friendPredicate)
```

In both versions of friendPredicate above, I get an Invalid Predicate Exception.

```
*** Terminating app due to uncaught exception 'CKException', reason: 'Invalid predicate: (userID == "_1570bb2652d0658c12320bcd658e5898" AND followsID ==
"_fb7ebeb0841f6411099ad094424d66ac") OR (followsID == 
"_1570bb2652d0658c12320bcd658e5898" AND userID == 
"_fb7ebeb0841f6411099ad094424d66ac") 
(Error Domain=CKErrorDomain Code=12 "Invalid predicate (userID == 
"_1570bb2652d0658c12320bcd658e5898" AND followsID == 
"_fb7ebeb0841f6411099ad094424d66ac") OR (followsID == 
"_1570bb2652d0658c12320bcd658e5898" AND userID == 
"_fb7ebeb0841f6411099ad094424d66ac")" 
UserInfo=0x14e63010 {ck_isComparisonError=false, 
NSLocalizedDescription=Invalid predicate (userID == 
"_1570bb2652d0658c12320bcd658e5898" AND followsID == 
"_fb7ebeb0841f6411099ad094424d66ac") OR (followsID == 
"_1570bb2652d0658c12320bcd658e5898" AND userID == 
"_fb7ebeb0841f6411099ad094424d66ac")})'
```

*Am I approaching this wrong or making an invalid assumption?
Any help is much appreciated*