import test from 'tape';
import { Config }  from '../config.js';

const conf = Config();

test('config has critical properties', function(t) {
  const oldEnv = process.env;

  process.env = Object.assign(process.env, {
    DS_HOST: 'my-host',
    DS_HOST_SSH_PORT: 1337,
    DS_PRIMARY_USER: 'user',
    DS_GIT_REPO_PATH: '/path/to/repos'
  });

  t.ok(conf.server.host);
  t.ok(conf.server.port);
  t.ok(conf.server.user);
  t.ok(conf.server.repoPath);

  t.end();

  Object.assign(process.env, oldEnv);
});

