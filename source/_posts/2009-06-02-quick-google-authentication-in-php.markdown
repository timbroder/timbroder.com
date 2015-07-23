---
author: tim
comments: true
date: 2009-06-02 15:02:00+00:00
dsq_thread_id: '110297072'
layout: post
linked_list_url: ''
slug: quick-google-authentication-in-php
title: Quick Google Authentication in PHP
wordpress_id: 205
categories:
- Code
tags:
- gdata
- HOWTO
- php
---

Here is a quick way to authenticate against Google and retrieve a protected
feed. It does not use the supported ClientLogin method but it does allow you
to get to some unsupported feeds (Reader, Bookmarks, etc) The [Zend Gdata
library](http://framework.zend.com/download/gdata) is required


```PHP
$show_list       = 'show-google-reader-sub-list';  //the hook in a page
$login          = '';
$pass          = '';
$source         = 'wordpress-google-reader-sub-list-';  //the source the api sees when logging into Google
$service         = 'reader';  
$login_url        = 'https://www.google.com/accounts/ServiceLoginAuth?service=mail'; //URL to login to google
$subscription_list_url  = 'http://www.google.com/reader/api/0/subscription/list'; //URL that holds a users subscriptions

 
$client = new Zend_Http_Client($login_url);

//connect, authenticate, and handshake with Google
$client->setCookieJar()
->setMethod(Zend_Http_Client::POST)
->setParameterPost(array(
 'continue'             => $subscription_list_url,
 'service'              => 'reader',
 'niu'                  => 1,
 'hl'                   => 'en',
 'Email'              => $login,
 'Passwd'               => $pass,
 'PersistentCookie'     => 'yes',
 'asts'                 => ''
));


$response = $client->request('POST');
$client->setUri($subscription_list_url)->setMethod(Zend_Http_Client::GET);
$response = $client->request()->getBody();

if ($client->request()->getStatus() == 400) {
?>Unable to login with supplied Google login/password```
```