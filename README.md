[![Build Status](https://travis-ci.org/josschne/starrealms.svg?branch=master)](https://travis-ci.org/josschne/starrealms)

starrealms
==========

A simulator for the card game Star Realms

Usage
=====

Install node.js from http://nodejs.org/#download

From the command line
```
node main.js
```

Not Yet Working
===============
- Scrap Abilities
- Destroy Base
- Fleet HQ's "All Ships Get 1 Combat"
- Embassy Yacht's "If at least two bases"
- Next Ship to Top
- Scrap Trade Row
- Next Ship No Cost
- Draw Card for Each Blob
- Scrap a Card
- Stealth Needle's "Copy Ship"
- Mech World's "Ally for All"
- Machine Base's "Draw then Scrap"
- Brain World's "Scrap and Draw"

TODO
=====
11858 - Seed for "special" game where trade row is too expensive for starting hands to buy anything


Develop
=======

Test specs are located in the spec folder.  They are written in Jasmine and can be executed with jasmine-node.
```
sudo npm install jasmine-node -g
jasmine-node spec
```
