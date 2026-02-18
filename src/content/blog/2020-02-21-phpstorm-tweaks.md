---
title: My PhpStorm Tweaks
tags: 
- HOWTO
- PhpStorm
layout: post
date: 2020-02-21
---

We are breaking ground on a [new app](https://facebook.github.io/react-native/) at [work](https://wavemeditation.com/) and are tinkering with a few IDE's. Up until now we've standardized on Xcode and PhpStorm. [Code](https://code.visualstudio.com/) is the gold standard for react these days but I've never really given it an honest try; to get everything set up right. In the past, for "regular" react work, I've opened the react project in PhpStorm (which has all the power of WebStorm) and everything "just works". Full intellisense gives me great autocomplete, introspection, auto importing, etc. Granted, Code can do all this too, but it was nice to just open the IDE I'm familiar with and get to work. Also, at least the last time I tried, a bunch of plugins were needed. I believe most of this works OOB now

Some of my co-workers are poking around with PhpStorm to see how they like it so I'm writing out the tweaks I do to any fresh install. Laracasts has an amazing (and free!) video series on the topic: [Be Awesome in PHPStorm](https://laracasts.com/series/how-to-be-awesome-in-phpstorm)

I also just learned that you can [sync your settings](https://www.jetbrains.com/help/phpstorm/sharing-your-ide-settings.html#settings-repository) to git, so I've done that [here](https://github.com/timbroder/PhpStorm-Settings)

# Editor Settings

* Turn off `confirmExit` and `showTipsOnStartup`. They are annoying
* Hide or minimize all the toolbars unless you need them. I rely on hotkeys
* Change Editor Tab limit to 1 --> This, combined with the split editor hotkeys below, will make it so if you make a new editor window, `cmd+w` will close it instead of cycling through a history of what was in that tab. To get to recently opened files, with auto complete, use `cmd+e` instead which will open the `Recent Files` modal

# Key Maps

Full keymap file is available [here](https://github.com/timbroder/PhpStorm-Settings/blob/master/keymaps/Default%20copy.xml)

## Delete a Line

PhpStorm will copy or cut a whole line, if you don't have anything highlighted and you mash the appropriate keys. So, why not delete the line you are on?

`EditorDeleteLine ` mapped to `cmd+d`

## Split Editor Window

If you want to have 2 editor windows side by side, make as many as you want!

`SplitVertically` mapped to `alt+v`

*Note: There is probably a better binding for this, but I already use those for my window manager, [Moom](https://manytricks.com/moom/)*

## Common Default Hotkeys

* `cmd+e` opens `Recent Files`
* `cmd+shit+o` opens `Open Project Files` (`shift`, `shift` is also very useful but it can have a lot of noise depending on the type of project)
* `cmd+1` hides the sidebar

# Styles

## Theme

I go back and forth between these

* [Dracula](https://plugins.jetbrains.com/plugin/12275-dracula-theme)
* [Material](https://plugins.jetbrains.com/plugin/8006-material-theme-ui) `oceanic` or `deep ocean`
* I used to use [Solarized](https://plugins.jetbrains.com/plugin/12112-solarized-theme) Dark but I don't like it as much these days. My terminal still uses it

## Fonts

* I've used [FiraCode](https://github.com/tonsky/FiraCode/wiki/Intellij-products-instructions) forever and really like it. Can't beat how good the programming ligatures look
* JetBrains recently came out with [Mono](https://www.jetbrains.com/lp/mono/) which feels very similar to Fira. I'm using it now but the jury is still out