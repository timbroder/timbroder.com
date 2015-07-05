---
author: tim
comments: true
date: 2014-06-06 15:33:35+00:00
layout: post
slug: opening-sourcetree-from-the-command-line
title: Opening SourceTree from the Command line
wordpress_id: 1550
categories:
- Code
tags:
- git
---

SourceTree is my weapon of choice for a git GUI. I do most of my git work from the command line, but it’s great to look at diffs and branch trees.




I was finding it tedious to open SourceTree with Alfred, then opening the correct project.




I use this alias to open it right from my working directory:


<table cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0px; height: auto; width: 534px; font-size: 14px; color: #333333; border-top-left-radius: 0px !important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; border-bottom-left-radius: 0px !important; border: 0px !important; bottom: auto !important; float: none !important; left: auto !important; line-height: 1.1em !important; margin: 0px !important; outline: 0px !important; overflow: visible !important; padding: 0px !important; position: static !important; right: auto !important; top: auto !important; vertical-align: baseline !important; box-sizing: content-box !important; font-family: Consolas, 'Bitstream Vera Sans Mono', 'Courier New', Courier, monospace !important; min-height: inherit !important; background-image: none !important; background-position: initial initial !important; background-repeat: initial initial !important;" border="0" >
<tbody style="height: auto; border-top-left-radius: 0px !important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; border-bottom-left-radius: 0px !important; border: 0px !important; bottom: auto !important; float: none !important; left: auto !important; line-height: 1.1em !important; margin: 0px !important; outline: 0px !important; overflow: visible !important; padding: 0px !important; position: static !important; right: auto !important; top: auto !important; vertical-align: baseline !important; width: auto !important; box-sizing: content-box !important; font-size: 1em !important; min-height: inherit !important; background-image: none !important; background-position: initial initial !important; background-repeat: initial initial !important;" >
<tr style="height: auto; border-top-left-radius: 0px !important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; border-bottom-left-radius: 0px !important; border: 0px !important; bottom: auto !important; float: none !important; left: auto !important; line-height: 1.1em !important; margin: 0px !important; outline: 0px !important; overflow: visible !important; padding: 0px !important; position: static !important; right: auto !important; top: auto !important; vertical-align: baseline !important; width: auto !important; box-sizing: content-box !important; font-size: 1em !important; min-height: inherit !important; background-image: none !important; background-position: initial initial !important; background-repeat: initial initial !important;" >

<td style="height: auto; width: 534px; border-top-left-radius: 0px !important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important; border-bottom-left-radius: 0px !important; border: 0px !important; bottom: auto !important; float: none !important; left: auto !important; line-height: 1.1em !important; margin: 0px !important; outline: 0px !important; overflow: visible !important; padding: 0px !important; position: static !important; right: auto !important; top: auto !important; vertical-align: baseline !important; box-sizing: content-box !important; font-size: 1em !important; min-height: inherit !important; background-image: none !important; background-position: initial initial !important; background-repeat: initial initial !important;" class="code" >





`alias` `sourcetree=``'open -a SourceTree'`




 






</td>
</tr>
</tbody>
</table>


Then, just “sourcetree .” from where I am
