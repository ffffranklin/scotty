
module.exports = function scotty(conf) {

  "use strict";

  var promise = require('bluebird');
  var repoManager = require('./lib/repo-manager');
  var log = require('./lib/log');
  var _ = require('lodash');

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

      promise.resolve().then(
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
    var opts = _.extend({}, conf.server, opts) || conf.server;

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

