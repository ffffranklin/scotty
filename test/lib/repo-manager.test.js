var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var format = require('util').format;
var repoManager = rewire('../../lib/repo-manager');
var logSpy = sinon.spy();
var runCommandSpy = sinon.spy();
var execSpy = sinon.spy(function (comm, cb) {
  //run callback that calls log module
  var err = null;
  var data = 'test\ndata';
  try {
    cb(err, data)
  }catch (e) { }
});

var mockOpts = {
  host: '10.0.0.20',
  port: '1969',
  user: 'barUser',
  repoPath: '/new/path/to/repo'
};

var mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

var unsetRepoManager = repoManager.__set__({
  exec: execSpy,
  runCommand: runCommandSpy,
  log: logSpy
});

test('clone repo', function (t) {
  var mockOpts = {
    localRepoPath: 'baz/bar',
    cloneRepoPath: 'foo/bar'
  }
  var cmd = 'git clone --bare baz/bar foo/bar';

  repoManager.cloneRepo(mockOpts);
  t.assert(runCommandSpy.calledOnce, 'should call run command');
  t.equal(runCommandSpy.args[0][0], cmd, 'should run command')
  runCommandSpy.reset();
  t.end();
});

test('repoManager.makeRemoteServerWriteable should change permissions', function (t) {
  var mockOpts = {
    cloneRepoPath: 'test.git'
  };
  var cmd = format (
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
  runCommandSpy.reset();
  t.end();
});

test('repoManager.cleanUp should remove temp repo', function (t) {
  var mockOpts = {
    cloneRepoPath: 'test.git'
  };
  var cmd = format (
    'rm -rf %s',
    mockOpts.cloneRepoPath
  );
  //todo remove unused conf arg in source
  repoManager.cleanUp(mockOpts);
  t.assert(runCommandSpy.calledOnce);
  t.equal(runCommandSpy.args[0][0], cmd);
  t.equal(runCommandSpy.args[0][1], 'Cleaning Up');
  runCommandSpy.reset();
  t.end();
});

test('repoManager.remoteDelete should run remote delete via ssh', function (t) {
  var repo = 'repo.git';
  var cmd = format(
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
  execSpy.reset();
  logSpy.reset();
  t.end();
});

test('repoManager.remoteList should run ssh command', function (t) {
  var opts = mockOpts;
  var cmd = format('ssh %s@%s -p%d ls %s',
    opts.user,
    opts.host,
    opts.port,
    opts.repoPath
  );

  repoManager.remoteList(opts);
  t.assert(execSpy.calledOnce);
  t.assert(execSpy.calledWith(cmd));
  execSpy.reset();
  logSpy.reset();
  t.end();
});

test('repoManager.remoteList should call log', function(t) {
  var opts = mockOpts;
  var msg;
  repoManager.remoteList(opts);
  t.assert(logSpy.calledTwice);
  t.assert(logSpy.firstCall.calledWith(
    'Listing Repos stored in %s:%s',
    opts.host,
    opts.repoPath
  ));
  execSpy.reset();
  logSpy.reset();
  t.end()
});

test('repoManager.__runCommand should execute command', function(t) {
  var repoManager = rewire('../../lib/repo-manager');
  var msg = 'Test command';
  var cmd = 'foobar --baz';
  var promise;

  repoManager.__set__({
    exec: execSpy,
    log: logSpy
  });
  promise = repoManager.__runCommand(cmd, msg)()
  t.assert(logSpy.calledThrice, 'logger called');
  t.equal(logSpy.args[0][0], msg, 'logs msg');
  t.equal(logSpy.args[1][1], cmd, 'logs command');
  t.assert(execSpy.calledOnce, 'exec called');
  execSpy.reset();
  logSpy.reset();
  t.end();
});

