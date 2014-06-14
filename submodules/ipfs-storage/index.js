var extend = require('xtend')
var errors = require('../ipfs-errors')
var levelup = require('levelup')

module.exports = ipfsStorage


// ipfsStorage interface. it supports multiple backends.
function ipfsStorage(opts, callback) {
  if (!(this instanceof ipfsStorage))
    return new ipfsStorage(opts)

  // setup option defaults
  opts = extend(ipfsStorage.defaults, opts || {})
  opts.levelup.db = opts.levelup.db || require('leveldown-prebuilt')

  this.opts = opts
  this.db = levelup(opts.path, extend(opts.levelup), callback)
}

ipfsStorage.defaults = {
  path: ".ipfsdb",
  levelup: {
    keyEncoding: 'binary',
    valueEncoding: 'binary',
    writeBufferSize: 1024 * 1024 * 16 // 16MB
  }
}

ipfsStorage.errors = {
  NotFoundError: errors.NotFoundError,
}

// get -- gets a value from local storage
ipfsStorage.prototype.get = function(key, cb) {
  key = encodeKey(key)

  this.db.get(key, function(err, val) {
    if (err) return cb(errors.NotFoundError)
    cb(null, val)
  })
  return errors.ReturnCallbackError
}


// put -- puts a value into local storage
ipfsStorage.prototype.put = function(key, val, cb) {
  key = encodeKey(key)

  // levelup write opts
  var writeOpts = {sync: true}

  this.db.put(key, val, writeOpts, cb)
  return errors.ReturnCallbackError
}


function encodeKey(key) {
  if (!(key instanceof Buffer))
    key = new Buffer(key.toString())
  return key
}
