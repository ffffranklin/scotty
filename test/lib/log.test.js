import test from 'tape';
import sinon from 'sinon';
import log from '../../lib/log.js';

test('log should call console.log', function (t) {
  const stub = sinon.stub(console, 'log');

  log();

  t.assert(stub.calledOnce);
  t.end();

  stub.restore()
});
