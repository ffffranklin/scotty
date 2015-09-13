#! /usr/bin/env node

'use strict';

require('dotenv').load({silent: true});

var Promise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var format = require('util').format;
var log = function log() {
  return console.log.apply(this, arguments);
};
var env = {
  host: process.env.DS_HOST,
  port: process.env.DS_HOST_SSH_PORT,
  repoPath: process.env.DS_GIT_REPO_PATH
};

var envNotConfigured = (function listMissingConfig(env) {
  var result = [];
  var required = [
    'DS_HOST',
    'DS_HOST_SSH_PORT',
    'DS_PRIMARY_USER',
    'DS_GIT_REPO_PATH'
  ];

  required.forEach(function(name) {
    if (!env.hasOwnProperty(name)) {
      result.push(name);
    }
  });
  return result;
})(process.env);

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
      var command = format('git clone --bare %s %s', opts.localRepoPath, opts.cloneRepoPath);

      return runCommand(command, 'Cloning repo to %', opts.cloneRepoPath);
    },
    copyRepoToServer: function copyRepoToServer(opts) {
      var command = format('scp -r -P%d %s root@%s:%s', env.port, opts.cloneRepoPath, env.host, env.repoPath);

      return runCommand(command, 'Pushing repo to server');
    },
    makeRemoteServerWriteable: function makeRemoteServerWriteable(opts) {
      var command = format('ssh -p%d root@%s chmod -R g+rwX%s/%s', env.port, env.host, env.repoPath,  opts.cloneRepoPath);

      return runCommand(command, 'Fixing permissions');
    },
    cleanUp: function cleanup(opts) {
      var command = format('rm -rf %s', opts.cloneRepoPath);

      return runCommand(command, 'Cleaning Up');
    }
  };

  var methods =  {
    'list': function list() {
      var command = format('ssh root@%s -p%d ls %s', env.host, env.port, env.repoPath);

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

      Promise.resolve()
        .then(repoManager.cloneRepo(opts))
        .then(repoManager.copyRepoToServer(opts))
        .then(repoManager.makeRemoteServerWriteable(opts))
        .then(repoManager.cleanUp(opts));
    }
  };

  var run = function(method, args) {
    if (methods.hasOwnProperty(method)) {
      methods[method].apply(this, args);
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

if (envNotConfigured.length > 0) {
  log('scotty: FATAL_ERROR: Environment variables not set');
  envNotConfigured.forEach(function logMissingConfig(name) {
    log(' - Missing %s', name);
  });
}

if (argv._.length > 0) {
  inst.run(argv._[0], argv._.slice(1));
} else {
  log('scotty: No command provided');
}
