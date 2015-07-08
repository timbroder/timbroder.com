---
author: tim
comments: true
date: 2010-12-02 16:50:50+00:00
dsq_thread_id: '243862101'
layout: post
linked_list_url: ''
slug: magento-want-ckeditor-to-appear-on-category-edit-pages-in-magento
title: 'Magento: Want CKEditor to appear on Category edit pages in Magento?'
wordpress_id: 694
categories:
- Code
tags:
- ajax
- CKEditor
- Fontis
- magento
- php
- TinyMCE
---

It is pretty common to replace the [TinyMCE
](http://tinymce.moxiecode.com/)editor in the Magento Admin with the [CKEditor
](http://ckeditor.com/)using this [extension](http://www.magentocommerce.com
/magento-connect/Fontis/extension/586/fontis-wysiwyg-editor) However, the way
magento ajaxes the form fields into view on the category pages breaks this
functionality. This snippet should help anyone trying to get it to work in
app/design/adminhtml/default/default/template/fontis/wysiwyg/wysiwyg.phtml
[php] &lt;?php } else if($editorType == 'ckeditor') { ?&gt; &lt;script
type="text/javascript" src="&lt;?php echo $this-&gt;getJsUrl()
?&gt;fontis/ckeditor/ckeditor.js"&gt;&lt;/script&gt; &lt;script
type="text/javascript"&gt; var pageLoaded = false; function applyCKEditor() {
if(pageLoaded) { var editable_areas = '&lt;?php echo $editableAreas ?&gt;';
&lt;?php if(strpos($this-&gt;helper('core/url')-&gt;getCurrentUrl(),
'catalog_category') != false): ?&gt; CKEDITOR.instances = {}; &lt;?php endif;
?&gt; &lt;?php /* Add CKeditor to any matching textareas. */ ?&gt;
editable_areas.split(',').each(function(dom_id) { if($(dom_id)) { &lt;?php /*
Remove the required-entry CSS class so Magento will allow the contents of the
editor to be submitted. */ ?&gt; var loopCheck = 0;
while($(dom_id).hasClassName('required-entry') &amp;&amp; loopCheck &lt; 10) {
$(dom_id).removeClassName('required-entry'); loopCheck += 1; }
CKEDITOR.replace(dom_id, { width : 640, height: 350, protectedSource :
['(/{{[\s\S]*?}}/g)'] }); } }); } } window.onload = function() { pageLoaded =
true; &lt;?php if(strpos($this-&gt;helper('core/url')-&gt;getCurrentUrl(),
'catalog_category') === false): ?&gt; applyCKEditor(); &lt;?php endif; ?&gt; }
&lt;/script&gt; &lt;?php } ?&gt; [/php] in
app/design/adminhtml/default/default/template/catalog/category/edit/form.phtml
add this at the bottom but inside the script tag [php][/php] if(typeof
applyCKEditor == 'function') { applyCKEditor(); } [php][/php]

