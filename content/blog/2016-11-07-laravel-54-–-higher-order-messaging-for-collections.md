---
layout: post
title: Laravel 5.4 – Higher Order Messaging For Collections
slug: laravel-54-higher-order-messaging-for-collections
date: 2016-11-07 09:59
link: https://laravel-news.com/2016/11/higher-order-messaging/
redirect_from:
  - "/2016/11/laravel-54-–-higher-order-messaging-for-collections/"
---

Two words: HELL, YES

> The best way of showcasing this new feature is through code samples. Pretend you have a collection and you want to perform an operation on each of the items:

```php
$invoices->each(function($invoice) {
  $invoice->pay();
});
```
 
> With this new feature you will be able to simplify this into:

```php
$invoices->each->pay();
```

via [Laravel News](https://laravel-news.com/2016/11/higher-order-messaging/ "Laravel News")
