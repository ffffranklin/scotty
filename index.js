#! /usr/bin/env node

require('dotenv').load({silent: true});

var Promise = require('bluebird');
var exec = require('child_process').exec;
var args = process.argv.slice(2);
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
  required.forEach(function(name){
    if (!env.hasOwnProperty(name)) {
      result.push(name);
    }
  });
  return result;
})(process.env);

var scotty = function scotty() {

  var repoManager = {
    cloneRepo: function cloneRepo (opts) {
      var command = 'git clone --bare ' + opts.localRepoPath + ' ' + opts.cloneRepoPath;
      return function () {
        var res;
        console.log('Cloning repo to %', opts.cloneRepoPath);
        console.log('running: %s', command);
        exec(command, function (err, data) { console.log(data); res(); });
        return new Promise(function (resolve, reject) { res = resolve });
      };
    },
    copyRepoToServer: function copyRepoToServer (opts) {
      var command = 'scp -r -P' + env.port + ' ' + opts.cloneRepoPath + ' root@' + env.host + ':' + env.repoPath;
      return function () {
        var res;
        console.log('Pushing repo to server');
        console.log('running: %s', command);
        exec(command, function (err, data) { console.log(data); res();});
        return new Promise(function (resolve, reject) { res = resolve });
      };
    },
    makeRemoteServerWriteable: function makeRemoteServerWriteable (opts) {
      var command = 'ssh -p' + env.port + ' root@' + env.host + ' chmod -R g+rwX' + env.repoPath + '/' + opts.cloneRepoPath;
      return function () {
        var res;
        console.log('Fixing permissions');
        console.log('running: %s', command);
        exec(command, function (err, data) { console.log(data); res();});
        return new Promise(function (resolve, reject) { res = resolve });
      };
    },
    cleanUp: function cleanup (opts) {
      var command = 'rm -rf ' + opts.cloneRepoPath;
      return function () {
        var res;
        console.log('Cleaning Up');
        console.log('running: %s', command);
        exec(command, function (err, data) { console.log(data); res();});
        return new Promise(function (resolve, reject) { res = resolve });
      };
    }
  };

  var methods =  {
    'list': function list() {
      var command = 'ssh root@' + env.host + ' -p' + env.port + ' ls ' + env.repoPath;
      exec(command, function (err, data) {
        console.log(data);
      });
    },
    'add': function add (localRepoPath, hostRepoName) {
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
        .then(repoManager.cleanUp(opts))
    }
  }

  var run = function (method, args) {
    if (methods.hasOwnProperty(method)) {
      methods[method].apply(this, args);
    } else {
      console.error('Method "%s" does not exist', method);
    }
  }

  return {
    __methods: methods,
    __repoManager: repoManager,
    run: run
  }
  
}

var inst = module.exports = scotty();

if (envNotConfigured.length > 0) {
  console.error('Environment variables not set');
  envNotConfigured.forEach(function logMissingConfig(name) {
    console.log(' - Missing %s', name);
  });
}

if (args.length > 0) {
  inst.run(args[0], args.slice(1));
} else {
  console.log('No command provided');
}

