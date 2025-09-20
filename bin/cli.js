#! /usr/bin/env node

'use strict';

require('colors');
require('dotenv').load({silent: true});

var Config = require('../config');
var conf = new Config();
var log = require('../lib/log');
var scotty = require('../')(conf);
var pkg = require('../package.json');
var meow = require('meow');

var cli =  meow({
  help: `
    Usage
      $ ${'scotty'.red.bold} ${'[COMMAND]'.green.bold} ${'[OPTIONS]'.magenta.bold}

    ${'Commands'.white.bold}
      ${'list'.white.bold}
        Lists the repo folders
      ${'add'.white.bold}
        Clone your local repo to the server as a bare repo
      ${'destroy'.white.bold}
        Delete remote repo

    ${'Options'.white.bold}
      --${'user'.green}          SSH username
      --${'host'.green}          Git server hostname
      --${'port'.green}          Git server SSH port number [Default: 22]
      --${'repoPath'.green}      Path to repo parent directory on server

    ${`Examples`.white.bold}
      $ scotty list
      $ scotty add repo/path --user=git
      $ scotty destroy remote/path --user=git --host=10.0.0.25 --port=1022 --repoPath=/volume1/git

    ${'Tips'.white.bold}
      Put options in .bashrc instead of using flags for convenience
  `,
  pkg: pkg
});

function init(cb) {
  var opts = (JSON.stringify(cli.flags) === '{}') ? null : cli.flags;
  if (cli.input.length > 0) {
    cb(cli.input[0], cli.input.slice(1), opts);
  } else {
    cli.showHelp();
  }
}

if (require.main === module) {
  init(scotty.run);
}

module.exports = {
  init: init
};
