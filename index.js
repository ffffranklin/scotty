#! /usr/bin/env node

require('dotenv').load({silent: true});

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

  var methods =  {
    'list': function list() {
      var command = 'ssh root@' + env.host + ' -p' + env.port + ' ls ' + env.repoPath;
      exec(command, function (err, data) {
        console.log(data);
      });
    },
    'add': function add (localRepoPath, hostRepoName) {
      var cloneRepoPath = hostRepoName + '.git';
      var host = process.env.DS_HOST;      
      var port = process.env.DS_HOST_SSH_PORT;
      var repoPath = process.env.DS_GIT_REPO_PATH;
      // need to validate local repo path
      // need to validate that the local repo path points to a git repo
      // need to post validate the cloned repo
      var command1 = 'git clone --bare ' + localRepoPath + ' ' + cloneRepoPath;
      var command2 = 'scp -r -P' + port + ' ' + cloneRepoPath + ' root@' + host + ':' + repoPath;
      var command3 = 'ssh -p' + port + ' root@' + host + ' chmod -R g+rwX' + repoPath + '/' + cloneRepoPath
      var command4 = 'rm -rf ' + cloneRepoPath;

      console.log('Cloning repo to %', cloneRepoPath);

      exec(command1, function (err, data) {

        console.log(data);

        console.log('Pushing repo to server');

        exec(command2, function (err, data) {

          console.log(data);

          console.log('Fixing permissions');

          exec(command3, function (err, data) {

            console.log(data);

            console.log('Cleaning up');

            exec(command4, function (err, data) {
              console.log(data);
            });
          });

        });

      });

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

