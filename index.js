var net = require('net')
var fs = require('fs')
var assert = require('assert')
var Multiaddr = require('multiaddr')

module.exports = function(address) {
  assert(address, 'Must specify an address')
  address = new Multiaddr(address)

  function request(command, args, opts, cb) {
    if(typeof args === 'function') {
      cb = args;
      args = null;
    } else if(typeof opts === 'function') {
      cb = opts;
      opts = null;
    } else if(!cb) {
      cb = function(){}
    }

    if(!command)
      return cb('Must specify a command')
    if(!typeof command === 'string')
      return cb('Command must be a string')
    if(args != null && !Array.isArray(args))
      return cb('Args must be an array')
    if(opts != null && typeof opts !== 'object')
      return cb('Opts must be an object')
    if(!typeof cb === 'function')
      return cb('Callback must be a function')

    var req = new Buffer(JSON.stringify({
      Command: command,
      Args: args,
      Opts: opts
    }))

    var socket = net.connect(address.nodeAddress(), function() {
      var data = [], length = 0

      socket.on('error', cb)

      socket.on('data', function(chunk) {
        data.push(chunk)
        length += chunk.length
      })

      socket.on('end', function() {
        var res = Buffer.concat(data, length)
        cb(null, res)
      })

      socket.write(req)
    })
  }

  function add(file, cb) {
    if(typeof file === 'string') {
      request('add', [file], cb)

    } else if(Buffer.isBuffer(file)) {
      var filename = Math.abs(Math.random() * 1e20 | 0).toString(36)
      // TOOD: delete file when done
      fs.writeFile(filename, file, function(err) {
        if(err) return cb(err)
        fs.realpath(filename, function(err, path) {
          if(err) return cb(err)
          console.log(path)
          add(path, cb)
        })
      })
    }
  }

  function cat(id, cb) {
    request('cat', [id], cb)
  }

  return {
    request: request,
    add: add,
    cat: cat
  }
}
