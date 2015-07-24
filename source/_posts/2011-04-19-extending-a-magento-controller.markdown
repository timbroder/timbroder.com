---
author: tim
comments: true
date: 2011-04-19 21:16:46+00:00
dsq_thread_id: '283857327'
layout: post
linked_list_url: ''
slug: extending-a-magento-controller
title: Extending a Magento Controller
wordpress_id: 915
categories:
- Code
tags:
- magento
- php
---

We're ajaxing part of the Magento shopping cart so we need to modify/extend some of the cart controller functionality.  Sometimes when modifying controller's you have to worry about updating the routes. For this, we don't need to, we still want all the urls to be used the same way.

app/code/local/Ai/Checkout/etc/config.xml:

```XML
<config>
    <modules>
        <Ai_Checkout>
             <version>0.0.1</version>
        </Ai_Checkout>
    </modules>
...
    <frontend>
        <routers>
            <checkout>
                <use>standard</use>
                <args>
                    <module>Ai_Checkout</module>
                    <frontName>checkout</frontName>
                </args>
            </checkout>
        </routers>
    </frontend>    
</config>
```

app/code/local/Ai/Checkout/controllers/CartController.php:

```PHP
require_once Mage::getModuleDir('controllers', 'Mage_Checkout') . DS . 'CartController.php';

class Ai_Checkout_CartController extends Mage_Checkout_CartController
{
   public function updatePostAction()
    {
    	Mage::log(&quot;NEW CONTROLLER&quot;, null, 'tim.log');
        try {
[/php]