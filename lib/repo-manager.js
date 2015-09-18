'use strict';

var Config = require('../config');
var format = require('util').format;
var conf = new Config();
var exec = require('child_process').exec;
var log = function log() {
  return console.log.apply(null, arguments);
};

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

  copyRepoToServer: function copyRepoToServer(opts) {
    var cmd = 'scp -r -P%d %s root@%s:%s';
    var port = conf.server.port;
    var src = opts.cloneRepoPath;
    var host = conf.server.host;
    var repoPath = conf.server.repoPath;
    var command = format(cmd, port, src, host, repoPath);

    return runCommand(command, 'Pushing repo to server');
  },

  makeRemoteServerWriteable: function makeRemoteServerWriteable(opts) {
    var command = format('ssh -p%d %s@%s chmod -R g+rwX %s/%s',
      conf.server.port,
      conf.server.user,
      conf.server.host,
      conf.server.repoPath,
      opts.cloneRepoPath
    );

    return runCommand(command, 'Fixing permissions');
  },

  cleanUp: function cleanup(opts) {
    var command = format('rm -rf %s', opts.cloneRepoPath);

    return runCommand(command, 'Cleaning Up');
  },

  remoteDelete: function(cloneRepoPath) {
    var command = format('ssh -p%d %s@%s rm -rf %s/%s',
      conf.server.port,
      conf.server.user,
      conf.server.host,
      conf.server.repoPath,
      cloneRepoPath
    );

    exec(command, function(err, data) {
      log('Deleting Repo');
      log(data);
    });
  },

  remoteList: function(opts) {

    var command = format('ssh %s@%s -p%d ls %s',
      opts.server.user,
      opts.server.host,
      opts.server.port,
      opts.server.repoPath
    );

    exec(command, function(err, data) {
      log('Listing Repos stored in %s:%s', opts.server.host, opts.server.repoPath);
      log(data);
    });
  }

};

module.exports = repoManager;