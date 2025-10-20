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

Or specify custom strategies:
```
node main.js ./strategies/combat_strategy.js ./strategies/dumb_strategy.js
```

Features
========
All card abilities from the Star Realms base game are now fully implemented:
- Basic stats: trade, combat, authority, card draw
- Faction ally abilities
- Base and outpost mechanics
- Scrap abilities
- Advanced abilities: Destroy Base, Next Ship to Top, Discard Then Draw, Scrap Trade Row, Next Ship No Cost, Draw Card for Each Blob, All Ships Combat, If At Least Two Bases, Draw Then Scrap, Scrap Then Draw

Strategies
==========
Two example strategies are included:
- **dumb_strategy**: Simple random choices
- **combat_strategy**: Prioritizes combat and The Blob faction

You can create custom strategies by implementing the strategy interface.

Develop
=======

Test specs are located in the spec folder.  They are written in Jasmine and can be executed with jasmine-node.
```
sudo npm install jasmine-node -g
jasmine-node spec
```
