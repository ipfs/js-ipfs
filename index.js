var net = require('net')
var fs = require('fs')
var stream = require('stream')
var assert = require('assert')
var request = require('request')

var API_PATH = "/api/v0/"

module.exports = function(address) {
  assert(address, 'Must specify an address')

  function send(path, args, opts, cb) {
    if(typeof args === 'function') {
      cb = args;
      args = null;
    } else if(typeof opts === 'function') {
      cb = opts;
      opts = null;
    } else if(!cb) {
      cb = function(){}
    }

    if(!path)
      return cb('Must specify a command path')
    if(!typeof path === 'string')
      return cb('Command must be a string')
    //if(args != null && !Array.isArray(args) && !(args instanceof stream.Readable))
    //  return cb('Args must be an array or reable stream')
    if(opts != null && typeof opts !== 'object')
      return cb('Opts must be an object')
    if(!typeof cb === 'function')
      return cb('Callback must be a function')

    if(Array.isArray(path)) path = path.join('/')

    if(!opts) opts = {}
    if(Array.isArray(args)) opts.arg = args

    var req = request({
      uri: 'http://' + address + API_PATH + path,
      qs: opts,
      useQuerystring: true,
      method: 'POST'
    }, function(err, res, data) {
      if(err) {
        try {
          return cb(JSON.parse(err), null, res)
        } catch(e) {
          return cb(new Error(err), null, res)
        }
      }

      try {
        return cb(null, JSON.parse(data), res)
      } catch(e) {
        return cb(null, data, res)
      }
    })

    if(args instanceof stream.Readable) args.pipe(req)
    else if(Buffer.isBuffer(args)) req.end(args)

    return req
  }

  function add(file, cb) {
    var args

    // TODO: handle multiple files, directories (one we have multipart stream support in go daemon)

    if(typeof file === 'string') {
      args = fs.createReadStream(file)

    } else if(Buffer.isBuffer(file)) {
      args = file
    }

    send('add', args, function(err, data) {
      return cb(err, data)
    })
  }

  function cat(objects, cb) {
    if(!Array.isArray(objects)) objects = [objects]

    send('cat', objects, function(err, data) {
      return cb(err, data)
    })
  }

  return {
    send: send,
    add: add,
    cat: cat
  }
}
