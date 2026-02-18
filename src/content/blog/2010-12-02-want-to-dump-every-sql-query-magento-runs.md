---
author: tim
comments: true
date: 2010-12-02 22:35:04+00:00
dsq_thread_id: '243505474'
layout: post
link: ''
slug: want-to-dump-every-sql-query-magento-runs
title: Want to dump every SQL query Magento runs?
wordpress_id: 697
category: Code
tags:
- magento
- php
- SQL
- Zend
---

In: ```lib/Zend/DB/Adapter/Adapter.php```

```PHP
public function query($sql, $bind = array())
{
	// connect to the database if needed
	$this->_connect();

	// is the $sql a Zend_Db_Select object?
	if ($sql instanceof Zend_Db_Select) {
		if (empty($bind)) {
			$bind = $sql->getBind();
		}

		$sql = $sql->assemble();
	}
	
	$time_start = microtime(true);

	// make sure $bind to an array;
	// don't use (array) typecasting because
	// because $bind may be a Zend_Db_Expr object
	if (!is_array($bind)) {
		$bind = array($bind);
	}

	// prepare and execute the statement with profiling
	$stmt = $this->prepare($sql);
	$stmt->execute($bind);

	// return the results embedded in the prepared statement object
	$stmt->setFetchMode($this->_fetchMode);

	$time_end = microtime(true);
	$time = $time_end - $time_start;

	echo "SQL[$time | $sql ]" . "\n<br />\n";
	return $stmt;
}
```