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
](http://ckeditor.com/)using this [extension](http://www.magentocommerce.com/magento-connect/Fontis/extension/586/fontis-wysiwyg-editor) 

However, the way magento ajaxes the form fields into view on the category pages breaks this functionality. 

This snippet should help anyone trying to get it to work in ```app/design/adminhtml/default/default/template/fontis/wysiwyg/wysiwyg.phtml```

```PHP
{% verbatim %}
<?php } else if($editorType == 'ckeditor') { ?>

	<script type="text/javascript" src="<?php echo $this->getJsUrl() ?>fontis/ckeditor/ckeditor.js"></script>
	<script type="text/javascript">
	var pageLoaded = false;

	function applyCKEditor() {
		if(pageLoaded) {
			var editable_areas = '<?php echo $editableAreas ?>';
			<?php if(strpos($this->helper('core/url')->getCurrentUrl(), 'catalog_category') != false): ?>
				CKEDITOR.instances = {};
			<?php endif; ?>

			<?php /* Add CKeditor to any matching textareas. */ ?>
			editable_areas.split(',').each(function(dom_id) {
			if($(dom_id)) {
				<?php /* Remove the required-entry CSS class so Magento will
				allow the contents of the editor to be submitted. */ ?>
				var loopCheck = 0;
				while($(dom_id).hasClassName('required-entry') && loopCheck < 10) {
					$(dom_id).removeClassName('required-entry');
					loopCheck += 1;
				}

				CKEDITOR.replace(dom_id, {
					width : 640,
					height: 350,
					protectedSource : ['(/{{[\s\S]*?}}/g)']
				});
			}
		});
	}
}

window.onload = function() {
pageLoaded = true;
<?php if(strpos($this->helper('core/url')->getCurrentUrl(), 'catalog_category') === false): ?>
	applyCKEditor();
<?php endif; ?>
}
</script>
<?php } ?>
{% endverbatim %}
```

in ```app/design/adminhtml/default/default/template/catalog/category/edit/form.phtml``` add this at the bottom but inside the script tag

```javascript
if(typeof applyCKEditor == 'function') {
	applyCKEditor();
}
```