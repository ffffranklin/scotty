#! /usr/bin/env node

require('dotenv').load({silent: true});

var Config = require('../config');
var conf = new Config();
var argv = require('minimist')(process.argv.slice(2));
var log = require('../lib/log');
var scotty = require('../');
var pkg = require('../package.json');
var meow = require('meow');
var inst = scotty(conf);

var cli =  meow({
  help: [
    'Usage',
    '  $ scotty [<list|destroy|create> ...]',
    '',
    'Options',
    '  --user          SSH username',
    '  --host          Git server hostname',
    '  --port          Git server SSH port number [Default: 22]',
    '  --repoPath      Path to repo parent directory on server',
    '',
    'Examples',
    '  $ scotty list',
    '  $ scotty create repo/path --user=git',
    '  $ scotty destroy remote/path --host=10.0.0.25 --port=1022',
    '',
    'Tips',
    '  Put options in .bashrc instead of using flags for convenience'
  ],
  pkg: pkg
});

function init(cb) {
  var opts = (JSON.stringify(cli.flags) === '{}') ? null : cli.flags;
  if (argv._.length > 0) {
    cb(cli.input[0], cli.input.slice(1), opts)
  } else {
    log('scotty: No command provided');
  }
}

init(inst.run);

module.exports = {
  init: init
};
