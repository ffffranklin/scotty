import test from 'tape';
import sinon from 'sinon';
import { format } from 'node:util';
import RepoManager from '../../lib/repo-manager.ts';

const repoManager = new RepoManager();
const logSpy = sinon.stub(repoManager, '__log');
const runCommandStub = sinon.stub(repoManager, '__runCommand');
const asyncExecStub = sinon.stub(repoManager, '__asyncExec');

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

test('clone repo', function (t) {
  const mockOpts = {
    localRepoPath: 'baz/bar',
    cloneRepoPath: 'foo/bar'
  }
  const cmd = 'git clone --bare baz/bar foo/bar';

  repoManager.cloneRepo(mockOpts);
  t.assert(runCommandStub.calledOnce, 'should call run command');
  t.equal(runCommandStub.args[0][0], cmd, 'should run command')
  runCommandStub.resetHistory()
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
  t.assert(runCommandStub.calledOnce, 'should call run command');
  t.equal(runCommandStub.args[0][0], cmd, 'should run command')
  runCommandStub.resetHistory()
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
  t.assert(runCommandStub.calledOnce);
  t.equal(runCommandStub.args[0][0], cmd);
  t.equal(runCommandStub.args[0][1], 'Fixing permissions');
  runCommandStub.resetHistory();
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
  t.assert(runCommandStub.calledOnce);
  t.equal(runCommandStub.args[0][0], cmd);
  t.equal(runCommandStub.args[0][1], 'Cleaning Up');
  runCommandStub.resetHistory();
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
  t.assert(runCommandStub.calledOnce);
  t.equal(runCommandStub.args[0][0], cmd);
  runCommandStub.resetHistory();
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
  t.assert(runCommandStub.calledOnce);
  t.assert(runCommandStub.calledWith(cmd));
  runCommandStub.resetHistory();
  t.end();
});

test('repoManager.remoteList should call log', function(t) {
  const opts = mockOpts;

  repoManager.remoteList(opts);
  t.assert(runCommandStub.calledOnce);
  t.equal(runCommandStub.args[0][1], `Listing Repos stored in ${opts.host}:${opts.repoPath}`);
  runCommandStub.resetHistory();
  t.end()
});

test('repoManager.__runCommand should execute asyncExec command', function(t) {
  const msg = 'Test command';
  const cmd = 'foobar --baz';

  runCommandStub.restore();
  asyncExecStub.resolves('success')

  repoManager.__runCommand(cmd, msg)().then(()=> {
    t.assert(logSpy.calledThrice, 'logger called');
    t.equal(logSpy.args[0][0], msg, 'logs msg');
    t.equal(logSpy.args[1][1], cmd, 'logs command');
    t.assert(asyncExecStub.calledOnce, 'exec called');
    logSpy.resetHistory();
    asyncExecStub.resetHistory();
    t.end();
  })
});

