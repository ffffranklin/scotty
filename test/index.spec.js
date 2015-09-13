var test = require('tape');
var rewire = require('rewire');
var scotty = rewire('../');

var listCommand;

scotty.__set__({
  env: {
    host: '__host__',
    port: '__port__',
    repoPath: '__repoPath__'
  },
  exec: function (command, cb) {
    listCommand = command;
  }
});

test('scotty should have list command', function (t) {
  t.ok(scotty.__methods['list']);
  t.end();
});

test('scotty.list should run ssh command', function (t) {
  scotty.__methods.list();
  t.equal(listCommand, 'ssh root@__host__ -p__port__ ls __repoPath__');
  t.end();
});
