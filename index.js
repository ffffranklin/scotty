var args = process.argv.slice(2);

var scotty = function () {

  var methods =  {
    'list': function list (options) {

    }
  }

  var run = function (method, args) {
    if (methods.hasOwnProperty(method)) {
      methods[method].call(this, args);
    } else {
      console.error('Method "%s" does not exist', method) 
    }
  }

  return {
    __methods: methods,
    run: run
  }
  
}

if (args.length > 0) {
  scotty().run(args[0], args.slice(1))
}

module.exports = scotty
