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

test('scotty.run should apply args and default config to method', function(t) {
  var spyName = 'fooSpy';
  var spy = scotty.__methods[spyName] = sinon.spy();
  var args = ['arg1', 'arg2'];

  scotty.run(spyName, args);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], mockConf]);
  delete scotty.__methods[spyName];
  t.end();
});

test('scotty.run should apply args and custom config to method', function(t) {
  var spyName = 'barSpy';
  var spy = scotty.__methods[spyName] = sinon.spy();
  var args = ['arg1', 'arg2'];
  var opts = { foo: 'bar'};

  scotty.run(spyName, args, opts);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], opts]);
  delete scotty.__methods[spyName];
  t.end();
});


test('scotty.list should run ssh command', function (t) {
  var opts = {
    server: {
      host: '10.0.0.20',
      port: '1969',
      user: 'barUser',
      repoPath: '/new/path/to/repo'
    }
  };
  scotty.__methods.list(opts);
  var cmd = format('ssh %s@%s -p%d ls %s',
    opts.server.user,
    opts.server.host,
    opts.server.port,
    opts.server.repoPath
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
