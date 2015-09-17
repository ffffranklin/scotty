module.exports = function Config() {

  "use strict";

  return {
    server: {
      host: process.env.DS_HOST,
      port: process.env.DS_HOST_SSH_PORT,
      user: process.env.DS_PRIMARY_USER,
      repoPath: process.env.DS_GIT_REPO_PATH
    }
  };

};
