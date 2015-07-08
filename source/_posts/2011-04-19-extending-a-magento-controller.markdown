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

We're ajaxing part of the Magento shopping cart so we need to modify/extend
some of the cart controller functionality.  Sometimes when modifying
controller's you have to worry about updating the routes. For this, we don't
need to, we still want all the urls to be used the same way.
app/code/local/Ai/Checkout/etc/config.xml: [xml] &lt;config&gt;
&lt;modules&gt; &lt;Ai_Checkout&gt; &lt;version&gt;0.0.1&lt;/version&gt;
&lt;/Ai_Checkout&gt; &lt;/modules&gt; ... &lt;frontend&gt; &lt;routers&gt;
&lt;checkout&gt; &lt;use&gt;standard&lt;/use&gt; &lt;args&gt;
&lt;module&gt;Ai_Checkout&lt;/module&gt;
&lt;frontName&gt;checkout&lt;/frontName&gt; &lt;/args&gt; &lt;/checkout&gt;
&lt;/routers&gt; &lt;/frontend&gt; &lt;/config&gt; [/xml]
app/code/local/Ai/Checkout/controllers/CartController.php: [php] require_once
Mage::getModuleDir('controllers', 'Mage_Checkout') . DS .
'CartController.php'; class Ai_Checkout_CartController extends
Mage_Checkout_CartController { public function updatePostAction() {
Mage::log("NEW CONTROLLER", null, 'tim.log'); try { [/php]

