---
author: tim
comments: true
date: 2008-11-24 23:53:00+00:00
dsq_thread_id: '117086909'
layout: post
linked_list_url: ''
slug: set-change-reset-mysql-root-password-on
title: Set / Change / Reset the MySQL root password on Ubuntu Linux (Ubuntu)
wordpress_id: 185
categories:
- Code
tags:
- HOWTO
- mysql
- ubuntu
---

This came in veeeerrryyy handy just now...  
  

  1. Stop the MySQL Server  
  
sudo /etc/init.d/mysql stop  


  2. Start the mysqld config  
  
sudo mysqld --skip-grant-tables &amp;  
  

  3. Login to the server as root  
  
mysql -u root mysql  
  

  4. Ser your NEWPASSWORD  
  
UPDATE user SET Password=PASSWORD('NEWPASSWORD') WHERE User='root'; FLUSH
PRIVILEGES; exit;

