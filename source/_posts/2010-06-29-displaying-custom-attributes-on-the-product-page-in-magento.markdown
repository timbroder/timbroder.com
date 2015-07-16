---
author: tim
comments: true
date: 2010-06-29 16:27:47+00:00
dsq_thread_id: '112507942'
layout: post
linked_list_url: ''
slug: displaying-custom-attributes-on-the-product-page-in-magento
title: Displaying Custom Attributes on the Product Page in Magento
wordpress_id: 551
categories:
- Code
tags:
- HOWTO
- magento
- php
---

At some point you may not want to use the canned attributes.phtml groupings
that magento provides, or you just want to cherry pick which attributes to
show on your product listing page template/catalog/product/view.phtml


```PHP
$_product = $this->getProduct();

//For the attribute bike_specs_rear_shock

$_product->getResource()->getAttribute('bike_specs_rear_shock')->getStoreLabel(); //label
$_product->getbike_specs_rear_shock(); //value

```
