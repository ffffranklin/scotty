#! /usr/bin/env node

"use strict";

require('dotenv').load({silent: true});

var Promise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var format = require('util').format;
var log = function log() {
  return console.log.apply(null, arguments);
};
var config = require('./config');
var env = config.server;

var scotty = function scotty() {

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
      var port = env.port;
      var src = opts.cloneRepoPath;
      var host = env.host;
      var repoPath = env.repoPath;
      var command = format(cmd, port, src, host, repoPath);

      return runCommand(command, 'Pushing repo to server');
    },
    makeRemoteServerWriteable: function makeRemoteServerWriteable(opts) {
      var cmd = 'ssh -p%d root@%s chmod -R g+rwX %s';
      var port = env.port;
      var host = env.host;
      var targetPath = format('%s/%s', env.repoPath, opts.cloneRepoPath);
      var command = format(cmd, port, host, targetPath);

      return runCommand(command, 'Fixing permissions');
    },
    cleanUp: function cleanup(opts) {
      var command = format('rm -rf %s', opts.cloneRepoPath);

      return runCommand(command, 'Cleaning Up');
    }
  };

  var methods =  {
    'list': function list() {
      var cmd = 'ssh root@%s -p%d ls %s';
      var host = env.host;
      var port = env.port;
      var targetPath = env.repoPath;
      var command = format(cmd, host, port, targetPath);

      exec(command, function(err, data) {
        log(data);
      });
    },
    'add': function add(localRepoPath, hostRepoName) {
      // need to validate local repo path
      // need to validate that the local repo path points to a git repo
      // need to post validate the cloned repo
      var opts = {
        cloneRepoPath: hostRepoName + '.git',
        localRepoPath: localRepoPath,
        hostRepoName: hostRepoName
      };

      Promise.resolve().then(
        repoManager.cloneRepo(opts)
      ).then(
        repoManager.copyRepoToServer(opts)
      ).then(
        repoManager.makeRemoteServerWriteable(opts)
      ).then(
        repoManager.cleanUp(opts)
      );
    }
  };

  var run = function(method, args) {
    if (methods.hasOwnProperty(method)) {
      methods[method].apply(null, args);
    } else {
      log('scotty: FATAL_ERROR: Method "%s" does not exist', method);
    }
  };

  return {
    __methods: methods,
    __repoManager: repoManager,
    run: run
  };
};

var inst = module.exports = scotty();

if (argv._.length > 0) {
  inst.run(argv._[0], argv._.slice(1));
} else {
  log('scotty: No command provided');
}
