var rewire = require('rewire');
var test = require('tape');
var Config = rewire('../config'); 

Config.__set__("process", {
  env: {
    DS_HOST: 'my-host',
    DS_HOST_SSH_PORT: 1337,
    DS_PRIMARY_USER: 'user',
    DS_GIT_REPO_PATH: '/path/to/repos'
  }
});

var conf = new Config();

test('config has critical properties', function(t) {
  t.ok(conf.server.host);
  t.ok(conf.server.port);
  t.ok(conf.server.user);
  t.ok(conf.server.repoPath);
  t.end();
});

