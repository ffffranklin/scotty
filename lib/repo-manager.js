import { format } from 'util';
import { exec } from 'child_process';
import log from './log.js';

export const runCommand = function runCommand(cmd, msg) {
  return function() {
    let res;

    log(msg);
    log('ran: %s', cmd);
    exec(cmd, function(err, data) { log(data); res(); });
    return new Promise(function(resolve) { res = resolve; });
  };
};

export default {
  cloneRepo: function cloneRepo(opts) {
    const srcPath = opts.localRepoPath;
    const destPath = opts.cloneRepoPath;
    const command = format('git clone --bare %s %s', srcPath, destPath);

    return runCommand(command, 'Cloning repo to %', destPath);
  },

  copyRepoToServer: function copyRepoToServer(opts, conf) {
    const cmd = 'scp -r -P%d %s root@%s:%s';
    const port = conf.port;
    const src = opts.cloneRepoPath;
    const host = conf.host;
    const repoPath = conf.repoPath;
    const command = format(cmd, port, src, host, repoPath);

    return runCommand(command, 'Pushing repo to server');
  },

  makeRemoteServerWriteable: function makeRemoteServerWriteable(opts, conf) {
    const command = format('ssh -p%d %s@%s chmod -R g+rwX %s/%s',
      conf.port,
      conf.user,
      conf.host,
      conf.repoPath,
      opts.cloneRepoPath
    );

    return runCommand(command, 'Fixing permissions');
  },

  cleanUp: function cleanup(opts) {
    const command = format('rm -rf %s', opts.cloneRepoPath);

    return runCommand(command, 'Cleaning Up');
  },

  remoteDelete: function(cloneRepoPath, conf) {
    const command = format('ssh -p%d %s@%s rm -rf %s/%s',
      conf.port,
      conf.user,
      conf.host,
      conf.repoPath,
      cloneRepoPath
    );

    exec(command, function(err, data) {
      log('Deleting Repo');
      log(data);
    });
  },

  remoteList: function(opts) {
    const command = format('ssh %s@%s -p%d ls %s',
      opts.user,
      opts.host,
      opts.port,
      opts.repoPath
    );

    exec(command, function(err, data) {
      log('Listing Repos stored in %s:%s', opts.host, opts.repoPath);
      log(data);
    });
  }
};
