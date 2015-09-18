```
                     
                     
 _   _  ____/__/_    
/_)_(__(_) (__(__(_/_
                .-/  
               (_/   
```

[![Build Status](https://secure.travis-ci.org/ffffranklin/scotty.svg?branch=master)](https://travis-ci.org/ffffranklin/scotty)
[![Dependency Status](https://david-dm.org/ffffranklin/scotty.svg)](https://david-dm.org/ffffranklin/scotty)
[![Test Coverage](https://codeclimate.com/github/ffffranklin/scotty/badges/coverage.svg)](https://codeclimate.com/github/ffffranklin/scotty/coverage)
[![Code Climate](https://codeclimate.com/github/ffffranklin/scotty/badges/gpa.svg)](https://codeclimate.com/github/ffffranklin/scotty)

The Scotty CLI is used to manage Git repositories remotely from the command line

## FYIs

 * **Synology Diskstation:**  This utility was originaly made to support a workflow that uses the Git Server Add-on for Synology's diskstation.  Now there's no reason it shouldn't work for a vanilla remotely hosted Git Server; I'm just sayin'.

## Installation

The NPM package requires that you have ssh installed as it depends on it heavily.  It also depends on environment variables for your Git Server.

 1. Install the NPM package
 ```
 $ npm install -g scotty
 ```
 
 2. Add environment variables
  * `DS_HOST` Host name or IP that your server can be accessed from the client machine
  * `DS_HOST_PORT` Host port that your server can be access from
  * `DS_PRIMARY_USER` The user that has read/write access to the git repos directory
  * `DS_GIT_REPO_PATH` The path to the parent directory of your git repos on the Git Server
  * **Example**
   ```
   DS_HOST=10.0.0.1
   DS_HOST_SSH_PORT=1022
   DS_PRIMARY_USER=git
   DS_GIT_REPO_PATH=/volume1/git
   ```

## Methods

### list

`list` will simply list the repo folders on your server

```
$ scotty list
```

### create

`create` will clone your local repo to the server as a bare repo that you can continue to work from

```
$ scotty create [repo_path] [new_repo_path]
```

### destroy

`destroy`  will delete the remote repo.  It takes one argument which is the complete directory name on the server.  The best way to get the name on the server is with the `scotty list` command

```
$ scotty destroy [repo_path]
```
