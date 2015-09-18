var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var format = require('util').format;
var repoManager = rewire('../../lib/repo-manager');

var mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

repoManager.__set__({
  conf: mockConf
});

test('repoManager.remoteDelete should run remote delete via ssh', function (t) {
  var execStub = sinon.stub();
  var unsetRewire = repoManager.__set__({
    exec: execStub
  });
  var repo = 'repo.git';
  var cmd = format(
    'ssh -p%d %s@%s rm -rf %s/%s',
    mockConf.server.port,
    mockConf.server.user,
    mockConf.server.host,
    mockConf.server.repoPath,
    repo
  );
  repoManager.remoteDelete(repo);
  t.assert(execStub.calledOnce);
  t.assert(execStub.calledWith(cmd));
  unsetRewire();
  t.end();
});