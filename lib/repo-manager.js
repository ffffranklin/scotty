import { format, promisify } from 'node:util';
import { exec } from 'node:child_process';
import log from './log.js';


export default class RepoManager {
  __log = (...args)=> log(...args);

  __asyncExec = promisify(exec);

  __runCommand(cmd, msg) {
    return async ()=> {
      this.__log(msg);
      this.__log('ran: %s', cmd);

      try {
        const { stdout } = await this.__asyncExec(cmd)
        this.__log(stdout)
      } catch (e) {
        console.error(e)
      }
    };
  }

  cloneRepo(opts) {
    const srcPath = opts.localRepoPath;
    const destPath = opts.cloneRepoPath;
    const command = format('git clone --bare %s %s', srcPath, destPath);

    return this.__runCommand(command, 'Cloning repo to %', destPath);
  }

  copyRepoToServer(opts, conf) {
    const cmd = 'scp -r -P%d %s root@%s:%s';
    const port = conf.port;
    const src = opts.cloneRepoPath;
    const host = conf.host;
    const repoPath = conf.repoPath;
    const command = format(cmd, port, src, host, repoPath);

    return this.__runCommand(command, 'Pushing repo to server');
  }

  makeRemoteServerWriteable(opts, conf) {
    const command = format('ssh -p%d %s@%s chmod -R g+rwX %s/%s',
      conf.port,
      conf.user,
      conf.host,
      conf.repoPath,
      opts.cloneRepoPath
    );

    return this.__runCommand(command, 'Fixing permissions');
  }

  cleanUp(opts) {
    const command = format('rm -rf %s', opts.cloneRepoPath);

    return this.__runCommand(command, 'Cleaning Up');
  }

  remoteDelete(cloneRepoPath, conf) {
    const command = format('ssh -p%d %s@%s rm -rf %s/%s',
      conf.port,
      conf.user,
      conf.host,
      conf.repoPath,
      cloneRepoPath
    );

    return this.__runCommand(command, 'Deleting Repo');
  }

  remoteList(opts) {
    const command = format('ssh %s@%s -p%d ls %s',
      opts.user,
      opts.host,
      opts.port,
      opts.repoPath
    );

    return this.__runCommand(command, format('Listing Repos stored in %s:%s', opts.host, opts.repoPath));
  }
};
