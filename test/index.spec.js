var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var scotty = rewire('../');

var lastCommand;

scotty.__set__({
  env: {
    host: '__host__',
    port: '1337',
    repoPath: '__repoPath__'
  },
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
  t.equal(lastCommand, 'ssh root@__host__ -p1337 ls __repoPath__');
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

test('repoManager.remoteDelete should run remote delete via ssh', function (t) {
  var runCommandSpy = sinon.spy(scotty, '__runCommand');
  scotty.__repoManager.remoteDelete('repo.git');
  t.equal(lastCommand, 'ssh -p1337 root@__host__ rm -rf __repoPath__/repo.git');
  t.end();
});

/*
test('scotty.destroy should prompt user that command finished successfully', function (t) {
});

test('scotty.destroy should prompt user if the command finished unsuccessfully', function (t) {
});
*/
