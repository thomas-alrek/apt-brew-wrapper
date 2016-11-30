# apt-get wrapper for Homebrew

A silly wrapper that maps apt-get commands to the equivalent brew command

Mostly pointless, but can be usefull when copy pasting Debian/Ubuntu based scripts on macOS.

### Installation

`npm install -g apt-brew-wrapper`

### Usage

It should work almost like apt-get.

`apt-get install wget`

will automatically be translated to

`brew install wget`

`apt-get remove wget`

will be translated to

`brew uninstall wget`


