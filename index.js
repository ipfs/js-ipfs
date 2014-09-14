var net = require('net')
var multiaddr = require('multiaddr')

function request(address, command, args, opts, cb) {
  if(typeof args === 'function') {
    cb = args;
    args = null;
  } else if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  } else if(!cb) {
    cb = function(){}
  }

  if(!address)
    return cb(new Error('Must specify an address'))
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

module.exports = {
  request: request
}
