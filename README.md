[![Build Status](https://travis-ci.org/josschne/starrealms.svg?branch=master)](https://travis-ci.org/josschne/starrealms)

starrealms
==========

A simulator for the card game Star Realms

Usage
=====

Install node.js from http://nodejs.org/#download

From the command line
```
node main.js ./strategy.js ./strategy.js
```

Not Yet Working
===============
- Destroy Base
- Next Ship to Top
- Recycling Station's "Discard Then Draw"
- Battle Pod / Blob Destroyer's "Scrap Trade Row"
- Blob Carrier's "Next Ship No Cost"
- Blob World's "Draw Card for Each Blob"
- Fleet HQ's "All Ships Get 1 Combat"
- Embassy Yacht's "If at least two bases"
- Machine Base's "Draw then Scrap"
- Brain World's "Scrap then Draw"

Develop
=======

Test specs are located in the spec folder.  They are written in Jasmine and can be executed with jasmine-node.
```
sudo npm install jasmine-node -g
jasmine-node spec
```
