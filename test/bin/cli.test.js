import test from 'tape';
import sinon from 'sinon';
import rewire from 'rewire';

// const cli = rewire('../../bin/cli.js');
import cli from '../../bin/cli.js';

test('cli.init should pass input and opts to scotty', function passInputAndOptions(t) {
  const scotty = sinon.stub();
  const mockCli = {
    input: ['test', 'arg1', 'arg2'],
    flags: {
      'one': 'val',
      'two': 'val'
    }
  };

  console.log(cli)
  // cli.__set__({
  //   cli: mockCli
  // });
  cli.init(scotty);
  t.deepEqual(scotty.args[0], [
    mockCli.input[0],
    mockCli.input.slice(1),
    mockCli.flags
  ]);
  t.end();
});

test('cli.init should pass null options if flags are empty', function nullOptions(t) {
  const scotty = sinon.stub();
  const mockCli = {
    input: ['test', 'arg1', 'arg2'],
    flags: {}
  };

  // cli.__set__({
  //   cli: mockCli
  // });
  cli.init(scotty);
  t.deepEqual(scotty.args[0], [
    mockCli.input[0],
    mockCli.input.slice(1),
    null
  ]);
  t.end();
});

test('cli.init should show help when no commands passed', function showHelp(t) {
  const scotty = sinon.stub();
  const helpStub = sinon.stub();
  const mockCli = {
    input: [],
    flags: {},
    showHelp: helpStub
  };

  // cli.__set__({
  //   cli: mockCli
  // });
  cli.init(scotty);
  t.assert(helpStub.calledOnce);
  t.end();
});


