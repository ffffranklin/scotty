import test from 'tape';
import sinon from 'sinon';
import _ from 'lodash';

const mockConf = {
  server: {
    host: '10.0.0.15',
    port: '1337',
    user: 'fooUser',
    repoPath: '/path/to/repo'
  }
};

import scottyModule from '../index.js';
const scotty = scottyModule(mockConf);

test('scotty should have list command', function (t) {
  t.ok(scotty.__methods['list']);
  t.end();
});

test('scotty.run should apply args and default config to method', function(t) {
  const spyName = 'fooSpy';
  const spy = scotty.__methods[spyName] = sinon.stub();
  const args = ['arg1', 'arg2'];

  scotty.run(spyName, args);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], mockConf.server]);
  delete scotty.__methods[spyName];
  t.end();
});

test('scotty.run should apply args and merge custom config to method', function(t) {
  const spyName = 'barSpy';
  const spy = scotty.__methods[spyName] = sinon.stub();
  const args = ['arg1', 'arg2'];
  const opts = { user: 'customUser'};
  const mergedOpts = _.extend({}, mockConf.server, opts);

  scotty.run(spyName, args, opts);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], mergedOpts]);
  delete scotty.__methods[spyName];
  t.end();
});

test('scotty.run should set port 22 as default port', function(t) {
  const spyName = 'fooBarSpy';
  // const scotty = require('../')(null);
  const spy = scotty.__methods[spyName] = sinon.stub();
  const args = ['arg1', 'arg2'];

  scotty.run(spyName, args);
  t.assert(spy.calledOnce);
  t.deepEqual(spy.args[0], [args[0], args[1], {port:22}]);
  delete scotty.__methods[spyName];
  t.end();
});


test('scotty.list should call remote list command', function (t) {
  const remoteListSpy = sinon.spy(scotty.__repoManager, 'remoteList');
  scotty.__methods.list(mockConf);
  t.assert(remoteListSpy.calledOnce);
  t.assert(remoteListSpy.calledWithExactly(mockConf));
  remoteListSpy.restore();
  t.end();
});


test('scotty.add should call methods in correct order', function (t) {
  let calledOrder = 0;
  const inc = function increment () {
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
  scotty.__methods.add('test', 'test-test');
  t.end();
});

test('scotty.add should print repo origin update instructions', function(t) {
  const logSpy = sinon.stub();
  const localPath = 'test';
  const hostPath = 'test-test';
  // const unwire = scottyModule.__set__({
  //   log: logSpy
  // });
  scotty.__repoManager.cloneRepo = sinon.stub().returns(sinon.stub());
  scotty.__repoManager.copyRepoToServer = sinon.stub().returns(sinon.stub());
  scotty.__repoManager.makeRemoteServerWriteable = sinon.stub().returns(sinon.stub());
  scotty.__repoManager.cleanUp = sinon.stub().returns(sinon.stub());
  scotty.__methods.add(localPath, hostPath).then(function () {
    t.assert(logSpy.called);
    t.deepEqual(logSpy.args[0], [
      "Repo Ready Captain!\r\nUpdate your remote origin with\r\ngit remote add origin ssh://%s@%s:%d%s/%s",
      mockConf.server.user,
      mockConf.server.host,
      mockConf.server.port,
      mockConf.server.repoPath,
      hostPath + '.git'
    ])
    unwire();
    t.end()
  });
});

test('scotty.destroy should throw if no path is provided', function (t) {
  t.throws(scotty.__methods.destroy, new RegExp('No repo', 'i'));
  t.end();
});

test('scotty.destroy should call remote delete command', function (t) {
  const remoteDeleteSpy = sinon.stub(scotty.__repoManager, 'remoteDelete');
  scotty.__methods.destroy('test_repo');
  t.assert(remoteDeleteSpy.calledOnce);
  t.assert(remoteDeleteSpy.calledWithExactly('test_repo', mockConf.server));
  remoteDeleteSpy.restore();
  t.end();
});



/*
test('scotty.destroy should prompt user that command finished successfully', function (t) {
});

test('scotty.destroy should prompt user if the command finished unsuccessfully', function (t) {
});
*/
