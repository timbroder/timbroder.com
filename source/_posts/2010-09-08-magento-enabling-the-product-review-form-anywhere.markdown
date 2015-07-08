---
author: tim
comments: true
date: 2010-09-08 18:03:07+00:00
dsq_thread_id: '243618106'
layout: post
linked_list_url: ''
slug: magento-enabling-the-product-review-form-anywhere
title: 'Magento:: Enabling the Product Review form anywhere'
wordpress_id: 647
categories:
- Code
tags:
- magento
- php
---

the form code lives in
app/design/frontend/yourtemplate/default/template/review/form.phtml in
catalog.xml enable it with: [xml]&lt;block type="review/form"
name="product.info.review_form" as="review_form"
template="review/form.phtml"/&gt;[/xml] and in your template: [php]&lt;?php
echo $this-&gt;getChildHtml('review_form'); ?&gt;[/php]

