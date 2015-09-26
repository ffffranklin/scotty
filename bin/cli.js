#! /usr/bin/env node

'use strict';

require('dotenv').load({silent: true});

var Config = require('../config');
var conf = new Config();
var log = require('../lib/log');
var scotty = require('../')(conf);
var pkg = require('../package.json');
var meow = require('meow');

var cli =  meow({
  help: [
    'Usage',
    '  $ scotty [<list|destroy|add> ...]',
    '',
    'Options',
    '  --user          SSH username',
    '  --host          Git server hostname',
    '  --port          Git server SSH port number [Default: 22]',
    '  --repoPath      Path to repo parent directory on server',
    '',
    'Examples',
    '  $ scotty list',
    '  $ scotty add repo/path --user=git',
    '  $ scotty destroy remote/path --user=git --host=10.0.0.25 --port=1022 --repoPath=/volume1/git',
    '',
    'Tips',
    '  Put options in .bashrc instead of using flags for convenience'
  ],
  pkg: pkg
});

function init(cb) {
  var opts = (JSON.stringify(cli.flags) === '{}') ? null : cli.flags;
  if (cli.input.length > 0) {
    cb(cli.input[0], cli.input.slice(1), opts)
  } else {
    log('scotty: No command provided');
  }
}

init(scotty.run);

module.exports = {
  init: init
};
