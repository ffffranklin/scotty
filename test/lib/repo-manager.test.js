import test from 'tape';
import sinon from 'sinon';
import { format } from 'util';
import repoManager, {runCommand} from '../../lib/repo-manager.js';
const logSpy = sinon.spy();
const runCommandSpy = sinon.spy();
const execSpy = sinon.spy(function (comm, cb) {
  //run callback that calls log module
  const err = null;
  const data = 'test\ndata';
  try {
    cb(err, data)
  }catch (e) { }
});

let mockOpts = {
  host: '10.0.0.20',
  port: '1969',
  user: 'barUser',
  repoPath: '/new/path/to/repo'
};

const mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

// const unsetRepoManager = repoManager.__set__({
//   exec: execSpy,
//   runCommand: runCommandSpy,
//   log: logSpy
// });

test('clone repo', function (t) {
  const mockOpts = {
    localRepoPath: 'baz/bar',
    cloneRepoPath: 'foo/bar'
  }
  const cmd = 'git clone --bare baz/bar foo/bar';

  repoManager.cloneRepo(mockOpts);
  t.assert(runCommandSpy.calledOnce, 'should call run command');
  t.equal(runCommandSpy.args[0][0], cmd, 'should run command')
  runCommandSpy.resetHistory();
  t.end();
});

test('copy repo', function (t) {
  const mockOpts = {
    cloneRepoPath: 'baz/bar'
  }
  const mockConf = {
    port: 1337,
    host: 'myhost',
    repoPath: '/path'
  }
  const cmd = 'scp -r -P1337 baz/bar root@myhost:/path';

  repoManager.copyRepoToServer(mockOpts, mockConf);
  t.assert(runCommandSpy.calledOnce, 'should call run command');
  t.equal(runCommandSpy.args[0][0], cmd, 'should run command')
  runCommandSpy.resetHistory();
  t.end();
});

test('repoManager.makeRemoteServerWriteable should change permissions', function (t) {
  const mockOpts = {
    cloneRepoPath: 'test.git'
  };
  const cmd = format (
    'ssh -p%d %s@%s chmod -R g+rwX %s/%s',
    mockConf.server.port,
    mockConf.server.user,
    mockConf.server.host,
    mockConf.server.repoPath,
    mockOpts.cloneRepoPath
  );
  //todo remove unused conf arg in source
  repoManager.makeRemoteServerWriteable(mockOpts, mockConf.server);
  t.assert(runCommandSpy.calledOnce);
  t.equal(runCommandSpy.args[0][0], cmd);
  t.equal(runCommandSpy.args[0][1], 'Fixing permissions');
  runCommandSpy.resetHistory();
  t.end();
});

test('repoManager.cleanUp should remove temp repo', function (t) {
  const mockOpts = {
    cloneRepoPath: 'test.git'
  };
  const cmd = format (
    'rm -rf %s',
    mockOpts.cloneRepoPath
  );
  //todo remove unused conf arg in source
  repoManager.cleanUp(mockOpts);
  t.assert(runCommandSpy.calledOnce);
  t.equal(runCommandSpy.args[0][0], cmd);
  t.equal(runCommandSpy.args[0][1], 'Cleaning Up');
  runCommandSpy.resetHistory();
  t.end();
});

test('repoManager.remoteDelete should run remote delete via ssh', function (t) {
  const repo = 'repo.git';
  const cmd = format(
    'ssh -p%d %s@%s rm -rf %s/%s',
    mockConf.port,
    mockConf.user,
    mockConf.host,
    mockConf.repoPath,
    repo
  );
  repoManager.remoteDelete(repo, mockConf);
  t.assert(execSpy.calledOnce);
  t.equal(execSpy.args[0][0], cmd);
  execSpy.resetHistory();
  logSpy.resetHistory();
  t.end();
});

test('repoManager.remoteList should run ssh command', function (t) {
  const opts = mockOpts;
  const cmd = format('ssh %s@%s -p%d ls %s',
    opts.user,
    opts.host,
    opts.port,
    opts.repoPath
  );

  repoManager.remoteList(opts);
  t.assert(execSpy.calledOnce);
  t.assert(execSpy.calledWith(cmd));
  execSpy.resetHistory();
  logSpy.resetHistory();
  t.end();
});

test('repoManager.remoteList should call log', function(t) {
  const opts = mockOpts;

  repoManager.remoteList(opts);
  t.assert(logSpy.calledTwice);
  t.assert(logSpy.firstCall.calledWith(
    'Listing Repos stored in %s:%s',
    opts.host,
    opts.repoPath
  ));
  execSpy.resetHistory();
  logSpy.resetHistory();
  t.end()
});

test('repoManager.__runCommand should execute command', function(t) {
  // const repoManager = rewire('../../lib/repo-manager');
  const msg = 'Test command';
  const cmd = 'foobar --baz';
  let promise;

  // repoManager.__set__({
  //   exec: execSpy,
  //   log: logSpy
  // });
  runCommand(cmd, msg)()
  t.assert(logSpy.calledThrice, 'logger called');
  t.equal(logSpy.args[0][0], msg, 'logs msg');
  t.equal(logSpy.args[1][1], cmd, 'logs command');
  t.assert(execSpy.calledOnce, 'exec called');
  execSpy.resetHistory();
  logSpy.resetHistory();
  t.end();
});

