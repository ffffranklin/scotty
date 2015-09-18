var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var format = require('util').format;
var scotty = rewire('../../');
var lastCommand;

var mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

scotty.__set__({
  conf: mockConf,
  exec: function (command, cb) {
    lastCommand = command;
  }
});

test('repoManager.remoteDelete should run remote delete via ssh', function (t) {
  var runCommandSpy = sinon.spy(scotty, '__runCommand');
  var repo = 'repo.git';
  var cmd = format(
    'ssh -p%d %s@%s rm -rf %s/%s',
    mockConf.server.port,
    mockConf.server.user,
    mockConf.server.host,
    mockConf.server.repoPath,
    repo
  );
  scotty.__repoManager.remoteDelete(repo);
  t.equal(lastCommand, cmd);
  t.end();
});