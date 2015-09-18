var test = require('tape');
var sinon = require('sinon');
var rewire = require('rewire');
var cli = rewire('../../bin/cli');

test('cli.init should pass input and opts to scotty', function passInputAndOptions(t) {
  var scotty = sinon.stub();
  var mockCli = {
    input: ['test', 'arg1', 'arg2'],
    flags: {
      'one': 'val',
      'two': 'val'
    }
  };

  cli.__set__({
    cli: mockCli
  });
  cli.init(scotty);
  t.deepEqual(scotty.args[0], [
    mockCli.input[0],
    mockCli.input.slice(1),
    mockCli.flags
  ]);
  t.end();
});

test('cli.init should pass null options if flags are empty', function nullOptions(t) {
  var scotty = sinon.stub();
  var mockCli = {
    input: ['test', 'arg1', 'arg2'],
    flags: {}
  };

  cli.__set__({
    cli: mockCli
  });
  cli.init(scotty);
  t.deepEqual(scotty.args[0], [
    mockCli.input[0],
    mockCli.input.slice(1),
    null
  ]);
  t.end();
});