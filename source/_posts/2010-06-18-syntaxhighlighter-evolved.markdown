---
author: tim
comments: true
date: 2010-06-18 17:45:25+00:00
dsq_thread_id: '109993176'
layout: post
linked_list_url: ''
slug: syntaxhighlighter-evolved
title: SyntaxHighlighter Evolved
wordpress_id: 318
categories:
- Code
tags:
- php
- wordpress
---

I'm currently in the process of migrating gpowerd.net over to this domain and
onto wordpress. [ SyntaxHighlighter
](http://alexgorbatchev.com/wiki/SyntaxHighlighter)has been upgraded quite a
bit since I [last](http://timbroder.com/2007/07/howto-post-code/) wrote about
it.  I came across a [great
plugin](http://wordpress.org/extend/plugins/syntaxhighlighter/) to handle the
code highlighting for me on wordpress.  I love the plugin, didn't have to go
into the wordpress template. It doesn't support the old pre syntax that I had
been using previously but it was simple to add in. Patch to add this to 2.3.8
is below, Thanks to [Alex ](http://www.viper007bond.com/wordpress-plugins/syntaxhighlighter/)for the plugin

    
```    
    --- syntaxhighlighter.orrig.php	2010-06-03 20:08:24.000000000 -0500
    +++ syntaxhighlighter.php	2010-06-18 12:27:35.000000000 -0500
    @@ -101,12 +101,15 @@
     			'tabsize'        => 4,
     			'toolbar'        => 1,
     			'wraplines'      => 1,
    +			'legacy'         => 0,
     		) );
    
     		// Create the settings array by merging the user's settings and the defaults
     		$usersettings = (array) get_option('syntaxhighlighter_settings');
     		$this->settings = wp_parse_args( $usersettings, $this->defaultsettings );
    
    +		if ( 1 == $this->settings['legacy'] )
    +					wp_register_script( 'syntaxhighlighter-brush-legacy',             plugins_url('syntaxhighlighter/syntaxhighlighter/scripts/shLegacy.js'),            array(),                         $this->agshver );
    
     		// Register generic hooks
     		add_filter( 'the_content',                array(&$this, 'parse_shortcodes'),                              7 );
    @@ -175,6 +178,7 @@
     			'javascript'    => 'jscript',
     			//'latex'         => 'latex',
     			'tex'           => 'latex',
    +			'legacy'        => 'legacy',
     			'matlab'        => 'matlabkey',
     			'objc'          => 'objc',
     			'obj-c'         => 'objc',
    @@ -583,6 +587,9 @@
     		echo "	SyntaxHighlighter.config.strings.noBrush = '" . $this->js_escape_singlequotes( __( "Can't find brush for: ", 'syntaxhighlighter' ) ) . "';\n";
     		echo "	SyntaxHighlighter.config.strings.brushNotHtmlScript = '" . $this->js_escape_singlequotes( __( "Brush wasn't configured for html-script option: ", 'syntaxhighlighter' ) ) . "';\n";
    
    +		if ( 1 == $this->settings['legacy'] )
    +			echo "	dp.SyntaxHighlighter.HighlightAll('code');\n";
    +
     		if ( 1 != $this->settings['autolinks'] )
     			echo "	SyntaxHighlighter.defaults['auto-links'] = false;\n";
    
    @@ -687,6 +694,7 @@
     			'tabsize'        => false,
     			'toolbar'        => false,
     			'wraplines'      => false,
    +			'legacy'         => false,
     		), $atts ) );
    
     		// Check for language shortcode tag such as [php]code[/php]
    
    
    @@ -771,6 +779,7 @@
     'smarttabs'      => 'smart-tabs',
     'tabsize'        => 'tab-size',
     'wraplines'      => 'wrap-lines',
    +			'legacy'         => 'legacy',
     );
    
     // Allowed configuration parameters and their type
    @@ -925,6 +934,7 @@
     settings['light'], 1 ); ?> /> 
    
     settings['smarttabs'], 1 ); ?> /> 
    
     settings['wraplines'], 1 ); ?> /> 
    
    +					settings['legacy'], 1 ); ?> /> 
    
     
     
    
    
    @@ -1062,6 +1072,7 @@
     $settings['smarttabs']      = ( !empty($settings['smarttabs']) )      ? 1 : 0;
     $settings['toolbar']        = ( !empty($settings['toolbar']) )        ? 1 : 0;
     $settings['wraplines']      = ( !empty($settings['wraplines']) )      ? 1 : 0;
    +			$settings['legacy']         = ( !empty($settings['legacy']) )         ? 1 : 0;
    
     if ( 'true' != $settings['padlinenumbers'] && 'false' != $settings['padlinenumbers'] )
     $settings['padlinenumbers'] = (int) $settings['padlinenumbers'];
    ```
   