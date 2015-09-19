'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var log = require('./log');

var runCommand = function runCommand(cmd, msg) {
  return function() {
    var res;

    log(msg);
    log('ran: %s', cmd);
    exec(cmd, function(err, data) { log(data); res(); });
    return new Promise(function(resolve) { res = resolve; });
  };
};

var repoManager = {

  cloneRepo: function cloneRepo(opts) {
    var srcPath = opts.localRepoPath;
    var destPath = opts.cloneRepoPath;
    var command = format('git clone --bare %s %s', srcPath, destPath);

    return runCommand(command, 'Cloning repo to %', destPath);
  },

  copyRepoToServer: function copyRepoToServer(opts, conf) {
    var cmd = 'scp -r -P%d %s root@%s:%s';
    var port = conf.port;
    var src = opts.cloneRepoPath;
    var host = conf.host;
    var repoPath = conf.repoPath;
    var command = format(cmd, port, src, host, repoPath);

    return runCommand(command, 'Pushing repo to server');
  },

  makeRemoteServerWriteable: function makeRemoteServerWriteable(opts, conf) {
    var command = format('ssh -p%d %s@%s chmod -R g+rwX %s/%s',
      conf.port,
      conf.user,
      conf.host,
      conf.repoPath,
      opts.cloneRepoPath
    );

    return runCommand(command, 'Fixing permissions');
  },

  cleanUp: function cleanup(opts, conf) {
    var command = format('rm -rf %s', opts.cloneRepoPath);

    return runCommand(command, 'Cleaning Up');
  },

  remoteDelete: function(cloneRepoPath, conf) {
    var command = format('ssh -p%d %s@%s rm -rf %s/%s',
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

    var command = format('ssh %s@%s -p%d ls %s',
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

module.exports = repoManager;