var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var format = require('util').format;
var scotty = rewire('../');

var mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

var lastCommand;

scotty.__set__({
  conf: mockConf,
  exec: function (command, cb) {
    lastCommand = command;
  }
});

test('scotty should have list command', function (t) {
  t.ok(scotty.__methods['list']);
  t.end();
});

test('scotty.list should run ssh command', function (t) {
  scotty.__methods.list();
  var cmd = format('ssh %s@%s -p%d ls %s',
    mockConf.server.user,
    mockConf.server.host,
    mockConf.server.port,
    mockConf.server.repoPath
  );
  t.equal(lastCommand, cmd);
  t.end();
});


test('scotty.add should call methods in correct order', function (t) {
  var calledOrder = 0;
  var inc = function increment () {
    ++calledOrder;
  }
  scotty.__repoManager.cloneRepo = function () {
    inc()
    t.equal(calledOrder, 1);
  };
  scotty.__repoManager.copyRepoToServer = function () {
    inc()
    t.equal(calledOrder, 2);
  };
  scotty.__repoManager.makeRemoteServerWriteable = function () {
    inc()
    t.equal(calledOrder, 3);
  };
  scotty.__repoManager.cleanUp = function () {
    inc()
    t.equal(calledOrder, 4);
  };
  scotty.__methods.add();
  t.end();
});

test('scotty.destroy should throw if no path is provided', function (t) {
  t.throws(scotty.__methods.destroy, new RegExp('No repo', 'i'));
  t.end();
});

test('scotty.destroy should call remote delete command', function (t) {
  var remoteDeleteSpy = sinon.spy(scotty.__repoManager, 'remoteDelete');
  scotty.__methods.destroy('test_repo');
  t.assert(remoteDeleteSpy.calledOnce);
  t.assert(remoteDeleteSpy.calledWithExactly('test_repo'));
  remoteDeleteSpy.restore();
  t.end();
});



/*
test('scotty.destroy should prompt user that command finished successfully', function (t) {
});

test('scotty.destroy should prompt user if the command finished unsuccessfully', function (t) {
});
*/
