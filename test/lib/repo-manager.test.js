var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var format = require('util').format;
var repoManager = rewire('../../lib/repo-manager');
var logSpy = sinon.spy();
var execStub = sinon.spy(function (comm, cb) {
  //run callback that calls log module
  var err = null;
  var data = 'test\ndata';
  cb(err, data)
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

repoManager.__set__({
  exec: execStub,
  conf: mockConf,
  log: logSpy
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
  repoManager.remoteDelete(repo);
  t.assert(execStub.calledOnce);
  t.equal(execStub.args[0][0], cmd);
  execStub.reset();
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
  t.assert(execStub.calledOnce);
  t.assert(execStub.calledWith(cmd));
  execStub.reset();
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
  execStub.reset();
  logSpy.reset();
  t.end()
});

