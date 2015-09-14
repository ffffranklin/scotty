"use strict";

var config = {
  server: {
    host: process.env.DS_HOST,
    port: process.env.DS_HOST_SSH_PORT,
    repoPath: process.env.DS_GIT_REPO_PATH
  },
  gitUser: process.env.DS_PRIMARY_USER
};

module.exports = config;
