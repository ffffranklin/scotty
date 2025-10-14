#! /usr/bin/env node

import 'colors';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

import { Config } from '../config.ts';
import scotty from '../index.ts';
import pkg from '../package.json' with { type: 'json' };
import meow  from 'meow';

const scottyInst = scotty(Config());

const cli =  meow({
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
  importMeta: import.meta,
  pkg: pkg
});

function init(cb, client=cli) {
  const opts = (JSON.stringify(client.flags) === '{}') ? null : client.flags;

  if (client.input.length > 0) {
    cb(client.input[0], client.input.slice(1), opts);
  } else {
    client.showHelp();
  }
}

if (import.meta.main) {
  init(scottyInst.run);
}

export default {
  init
}
