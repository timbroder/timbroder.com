---
author: tim
comments: true
date: 2011-01-04 21:35:38+00:00
dsq_thread_id: '246419229'
layout: post
link: ''
slug: want-to-trace-the-call-stack-in-magento
title: Want to trace the call stack in Magento?
wordpress_id: 736
category: Code
tags:
- HOWTO
- magento
- php
---

Update: This code is also available on [Github](https://github.com/broderboy/magento-callstack "Github") as a Mageno module

This has helped me immensely in situations like "Where is this getting called from??!?"

Create a helper like so:

```PHP
class Timbroder_Stack_Helper_Callstack extends Mage_Core_Helper_Abstract
{
	private function get_callstack($delim=&quot;\n&quot;) {
	  $dt = debug_backtrace();
	  $cs = '';
	  foreach ($dt as $t) {
	    $cs .= $t['file'] . ' line ' . $t['line'] . ' calls ' . $t['function'] . &quot;()&quot; . $delim;
	  }

	  return $cs;
	}

	public function toLog() {
		Mage::log($this-&gt;get_callstack());
	}

	public function toFirePhp() {
		$stack = $this-&gt;get_callstack();
		foreach (explode(&quot;\n&quot;, $stack) as $line) {
			Mage::helper('firephp')-&gt;send($line);
		}
	}
}
```

That can be called from anywhere:

``PHP
Mage::helper('stack/callstack')-&gt;toFirePhp();
Mage::helper('stack/callstack')-&gt;toLog();
```

I've also wrapped this into a module that you can drop right into your project.  Details here: [https://bitbucket.org/broderboy/magento_callstack/src](https://bitbucket.org/broderboy/magento_callstack/src "https://bitbucket.org/broderboy/magento_callstack/src")

Example output:

```
.../app/code/community/Timbroder/Stack/Helper/Callstack.php line 16 calls get_callstack()
.../app/design/frontend/mongoose/default/template/catalog/cms/bikes_bmx.phtml line 12 calls toLog()
.../app/design/frontend/mongoose/default/template/catalog/cms/bikes.phtml line 21 calls require_once()
.../app/code/core/Mage/Core/Block/Template.php line 212 calls include()
.../app/code/core/Mage/Core/Block/Template.php line 239 calls fetchView()
.../app/code/core/Mage/Core/Block/Template.php line 253 calls renderView()
.../app/code/core/Mage/Core/Block/Abstract.php line 668 calls _toHtml()
.../app/code/core/Mage/Core/Model/Email/Template/Filter.php line 190 calls toHtml()
.../lib/Varien/Filter/Template.php line 134 calls call_user_func()
.../app/code/core/Mage/Core/Model/Email/Template/Filter.php line 501 calls filter()
.../app/code/core/Mage/Cms/Block/Page.php line 100 calls filter()
.../app/code/core/Mage/Core/Block/Abstract.php line 668 calls _toHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 513 calls toHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 460 calls _getChildHtml()
.../app/code/local/Mage/Page/Block/Html/Wrapper.php line 52 calls getChildHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 668 calls _toHtml()
.../app/code/core/Mage/Core/Block/Text/List.php line 43 calls toHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 668 calls _toHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 513 calls toHtml()
.../app/code/core/Mage/Core/Block/Abstract.php line 464 calls _getChildHtml()
.../app/design/frontend/mongoose/default/template/page/1column.phtml line 55 calls getChildHtml()
.../app/code/core/Mage/Core/Block/Template.php line 212 calls include()
.../app/code/core/Mage/Core/Block/Template.php line 239 calls fetchView()
.../app/code/core/Mage/Core/Block/Template.php line 253 calls renderView()
.../app/code/core/Mage/Core/Block/Abstract.php line 668 calls _toHtml()
.../app/code/core/Mage/Core/Model/Layout.php line 529 calls toHtml()
.../app/code/local/Mage/Core/Controller/Varien/Action.php line 389 calls getOutput()
.../app/code/core/Mage/Cms/Helper/Page.php line 130 calls renderLayout()
.../app/code/core/Mage/Cms/Helper/Page.php line 52 calls _renderPage()
.../app/code/core/Mage/Cms/controllers/PageController.php line 45 calls renderPage()
.../app/code/local/Mage/Core/Controller/Varien/Action.php line 418 calls viewAction()
.../app/code/core/Mage/Core/Controller/Varien/Router/Standard.php line 254 calls dispatch()
.../app/code/core/Mage/Core/Controller/Varien/Front.php line 177 calls match()
.../app/code/core/Mage/Core/Model/App.php line 304 calls dispatch()
.../app/Mage.php line 598 calls run()
.../index.php line 155 calls run()
```

Thanks to [nextide](http://www.nextide.ca/node/518) for some of the code