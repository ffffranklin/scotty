var test = require('tape');
var sinon = require('sinon');
var rewire = require('rewire');
var log = rewire('../../lib/log');

test('log should call console.log', function (t) {
  var stub = sinon.stub();
  var unsetRewire = log.__set__({
    console: {
      log: stub
    }
  });

  log();
  t.assert(stub.calledOnce);
  unsetRewire();
  t.end();

});
