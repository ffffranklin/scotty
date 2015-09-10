require('dotenv').load({silent: true});

var args = process.argv.slice(2);

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
      var childProcess = require('child_process');
      var host = process.env.DS_HOST;      
      var port = process.env.DS_HOST_SSH_PORT;
      var repoPath = process.env.DS_GIT_REPO_PATH;
      var command = 'ssh root@' + host + ' -p' + port + ' ls ' + repoPath;
      childProcess.exec(command, function (err, data) {
        console.log(data);
      });
      
    }
  }

  var run = function (method, args) {
    if (methods.hasOwnProperty(method)) {
      methods[method].call(this, args);
    } else {
      console.error('Method "%s" does not exist', method);
    }
  }

  return {
    __methods: methods,
    run: run
  }
  
}

if (envNotConfigured.length > 0) {
  console.error('Environment variables not set');
  envNotConfigured.forEach(function logMissingConfig(name) {
    console.log(' - Missing %s', name);
  });
}

if (args.length > 0) {
  scotty().run(args[0], args.slice(1));
} else {
  console.log('No command provided');
}

module.exports = scotty;
