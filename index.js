'use strict';

var promise = require('bluebird');
var repoManager = require('./lib/repo-manager');
var log = require('./lib/log');
var _ = require('lodash');

module.exports = function scotty(conf) {

  var methods =  {
    'list': function list(opts) {
      repoManager.remoteList(opts);
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

      var prom = promise.resolve().then(
        repoManager.cloneRepo(opts)
      ).then(
        repoManager.copyRepoToServer(opts, conf.server)
      ).then(
        repoManager.makeRemoteServerWriteable(opts, conf.server)
      ).then(
        repoManager.cleanUp(opts, conf.server)
      ).then(function () {
        log(
          [
            'Repo Ready Captain!\r\n',
            'Update your remote origin with\r\n',
            'git remote add origin ssh://%s@%s:%d%s/%s'
          ].join(''),
          conf.server.user,
          conf.server.host,
          conf.server.port,
          conf.server.repoPath,
          opts.cloneRepoPath
        );
      });
      return prom;
    },
    'destroy': function destroy(path) {
      if (!path) { throw 'scott: No repo path provided'; }
      repoManager.remoteDelete(path, conf.server);
    }
  };

  var run = function(method, args, opts) {
    var args = args || [];
    var config = conf && conf.server || {};
    var opts = _.extend({port: 22}, config, opts);

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

