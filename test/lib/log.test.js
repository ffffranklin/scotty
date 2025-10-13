import test from 'tape';
import sinon from 'sinon';
import log from '../../lib/log.js';

test('log should call console.log', function (t) {
  const stub = sinon.stub();
  // const unsetRewire = log.__set__({
  //   console: {
  //     log: stub
  //   }
  // });

  log();
  t.assert(stub.calledOnce);
  // unsetRewire();
  t.end();
});
