var test = require('tape');
var rewire = require('rewire');
var sinon = require('sinon');
var _ = require('lodash');
var format = require('util').format;

var mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

var scotty = rewire('../')(mockConf);

test('scotty should have list command', function (t) {
  t.ok(scotty.__methods['list']);
  t.end();
});

test('scotty.run should apply args and default config to method', function(t) {
  var spyName = 'fooSpy';
  var spy = scotty.__methods[spyName] = sinon.stub();
  var args = ['arg1', 'arg2'];

  scotty.run(spyName, args);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], mockConf.server]);
  delete scotty.__methods[spyName];
  t.end();
});

test('scotty.run should apply args and merge custom config to method', function(t) {
  var spyName = 'barSpy';
  var spy = scotty.__methods[spyName] = sinon.stub();
  var args = ['arg1', 'arg2'];
  var opts = { user: 'customUser'};
  var mergedOpts = _.extend({}, mockConf.server, opts);

  scotty.run(spyName, args, opts);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], mergedOpts]);
  delete scotty.__methods[spyName];
  t.end();
});

test('scotty.run should set port 22 as default port', function(t) {
  var spyName = 'fooBarSpy';
  var scotty = rewire('../')(null);
  var spy = scotty.__methods[spyName] = sinon.stub();
  var args = ['arg1', 'arg2'];

  scotty.run(spyName, args);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], {port:22}]);
  delete scotty.__methods[spyName];
  t.end();
});


test('scotty.list should call remote list command', function (t) {
  var remoteListSpy = sinon.spy(scotty.__repoManager, 'remoteList');
  scotty.__methods.list(mockConf);
  t.assert(remoteListSpy.calledOnce);
  t.assert(remoteListSpy.calledWithExactly(mockConf));
  remoteListSpy.restore();
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
  var remoteDeleteSpy = sinon.stub(scotty.__repoManager, 'remoteDelete');
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
