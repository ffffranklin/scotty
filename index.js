#! /usr/bin/env node

"use strict";

require('dotenv').load({silent: true});

var Promise = require('bluebird');
var repoManager = require('./lib/repo-manager');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var format = require('util').format;
var log = function log() {
  return console.log.apply(null, arguments);
};
var Config = require('./config');
var conf = new Config();

var scotty = function scotty() {

  var methods =  {
    'list': function list(opts) {
      var command = format('ssh %s@%s -p%d ls %s',
        opts.server.user,
        opts.server.host,
        opts.server.port,
        opts.server.repoPath
      );

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
    },
    'destroy': function destroy(path) {
      if (!path) { throw 'scott: No repo path provided'; }
      repoManager.remoteDelete(path);
    }
  };

  var run = function(method, args, opts) {
    var args = args || [];
    var opts = opts || conf;

    if (methods.hasOwnProperty(method)) {
      methods[method].apply(null, args.concat(opts));
    } else {
      log('scotty: FATAL_ERROR: Method "%s" does not exist', method);
    }
  };

  return {
    __conf: conf,
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
