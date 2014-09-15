var net = require('net')
var fs = require('fs')
var assert = require('assert')
var Multiaddr = require('multiaddr')
var temp = require('temp')

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
      temp.open('ipfs', function(err, t) {
        if(err) return cb(err)
        fs.write(t.fd, file, 0, file.length, null, function(err) {
          console.log('wrote temp file', t.path)
          if(err) return cb(err)
          fs.close(t.fd, function(err) {
            if(err) return cb(err)
            add(t.path, cb)
          })
        })
      })
    }
  }

  function cat(id, cb) {
    request('cat', [id], cb)
  }

  function peers(cb) {
    request('peers', [], cb)
  }

  return {
    request: request,
    add: add,
    cat: cat,
    peers: peers
  }
}

temp.track()
setInterval(temp.cleanup, 60 * 1000)
