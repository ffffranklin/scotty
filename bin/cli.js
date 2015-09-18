#! /usr/bin/env node

require('dotenv').load({silent: true});

var Config = require('../config');
var conf = new Config();
var argv = require('minimist')(process.argv.slice(2));
var scotty = require('../');
var inst = scotty(conf);

if (argv._.length > 0) {
  inst.run(argv._[0], argv._.slice(1));
} else {
  log('scotty: No command provided');
}
