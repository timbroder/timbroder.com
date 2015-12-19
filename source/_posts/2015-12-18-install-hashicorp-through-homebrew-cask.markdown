---
layout: post
title: Installing Vagrant and other Hashicorp products using brew cask on OSX
date: 2015-12-18 19:12
link: https://github.com/hashicorp/otto/issues/121
---

Came accross this awesome gem today while setting up a new laptop

```bash
➜  ~  vagrant
zsh: command not found: vagrant
➜  ~  brew cask install vagrant
==> Downloading https://releases.hashicorp.com/vagrant/1.7.4/vagrant_1.7.4.dmg
Already downloaded: /Library/Caches/Homebrew/vagrant-1.7.4.dmg
==> Running installer for vagrant; your password may be necessary.
==> Package installers may write to any location; options such as --appdir are ignored.
==> installer: Package name is Vagrant
==> installer: Installing at base path /
==> installer: The install was successful.
🍺  vagrant staged at '/opt/homebrew-cask/Caskroom/vagrant/1.7.4' (6 files, 82M)
➜  ~  vagrant
Usage: vagrant [options] <command> [<args>]

    -v, --version                    Print the version and exit.
    -h, --help                       Print this help.

Common commands:
     box             manages boxes: installation, removal, etc.
     connect         connect to a remotely shared Vagrant environment
     destroy         stops and deletes all traces of the vagrant machine
     global-status   outputs status Vagrant environments for this user
     halt            stops the vagrant machine
     help            shows the help for a subcommand
     init            initializes a new Vagrant environment by creating a Vagrantfile
     login           log in to HashiCorp's Atlas
     package         packages a running vagrant environment into a box
     plugin          manages plugins: install, uninstall, update, etc.
     provision       provisions the vagrant machine
     push            deploys code in this environment to a configured destination
     rdp             connects to machine via RDP
     reload          restarts vagrant machine, loads new Vagrantfile configuration
     resume          resume a suspended vagrant machine
     share           share your Vagrant environment with anyone in the world
     ssh             connects to machine via SSH
     ssh-config      outputs OpenSSH valid configuration to connect to the machine
     status          outputs status of the vagrant machine
     suspend         suspends the machine
     up              starts and provisions the vagrant environment
     version         prints current and latest Vagrant version

For help on any individual command run `vagrant COMMAND -h`

Additional subcommands are available, but are either more advanced
or not commonly used. To see all subcommands, run the command
`vagrant list-commands`.

➜  ~
```
