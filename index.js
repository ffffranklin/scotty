import promise from 'bluebird';
import RepoManager from './lib/repo-manager.js';
import log from './lib/log.js';
import _ from 'lodash';

export default function scotty(conf) {
  const repoManager = new RepoManager();

  const methods =  {
    'list': function list(opts) {
      repoManager.remoteList(opts);
    },
    'add': function add(localRepoPath, hostRepoName) {
      // need to validate local repo path
      // need to validate that the local repo path points to a git repo
      // need to post validate the cloned repo
      let opts = {
        cloneRepoPath: hostRepoName + '.git',
        localRepoPath: localRepoPath,
        hostRepoName: hostRepoName
      };
      const prom = promise.resolve().then(
        repoManager.cloneRepo(opts)
      ).then(
        repoManager.copyRepoToServer(opts, conf.server)
      ).then(
        repoManager.makeRemoteServerWriteable(opts, conf.server)
      ).then(
        repoManager.cleanUp(opts, conf.server)
      ).then(function() {
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

  const run = function(method, args, opts) {
    let arg = args || [];
    const config = conf && conf.server || {};
    opts = _.extend({port: 22}, config, opts);

    if (Object.prototype.hasOwnProperty.call(methods, method)) {
      methods[method].apply(null, arg.concat(opts));
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

