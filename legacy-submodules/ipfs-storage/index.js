var extend = require('xtend')
var levelup = require('levelup')
var through2 = require('through2')
var errors = require('../ipfs-errors')

module.exports = ipfsStorage


// ipfsStorage interface. it supports multiple backends.
function ipfsStorage(opts, callback) {
  if (!(this instanceof ipfsStorage))
    return new ipfsStorage(opts)

  // setup option defaults
  opts = extend(ipfsStorage.defaults, opts || {})
  opts.levelup = extend(ipfsStorage.defaults.levelup, opts.levelup)
  opts.levelup.db = opts.levelup.db || require('memdown')

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
  if (!key) throw new Error('storage.get requires key')

  key = encodeKey(key)

  this.db.get(key, function(err, val) {
    if (err) return cb(errors.NotFoundError, key)
    cb(null, key, val)
  })
  return errors.ReturnCallbackError
}


// put -- puts a value into local storage
ipfsStorage.prototype.put = function(key, val, cb) {
  if (!key) throw new Error('storage.put requires key')
  if (!val) throw new Error('storage.put requires val')
  if (!isBuffer(val)) throw new Error('storage.put requires Buffer val')

  key = encodeKey(key)

  // levelup write opts
  var writeOpts = {sync: true}
  this.db.put(key, val, writeOpts, function(err, val) {
    if (err) return cb && cb(err, key)
    cb && cb(err, key, val)
  })
  return errors.ReturnCallbackError
}

// list -- lists object paths in local storage
ipfsStorage.prototype.list = function(parent, cb) {
  if (!cb && parent) {
    cb = parent
    parent = undefined
  }

  // todo: do smart things, use start + end, etc.
  var filter = function(p) {

    // add trailing slash if needed
    if (p[p.length - 1] != '/')
      p += '/'

    // if not descendant, filter out.
    if (p.indexOf(parent) != 0)
      return false

    // remove parent from key
    p = p.substr(0, parent.length)

    // if grandchild, filter out.
    if (p.indexOf('/') >= 0)
      return false

    return p // just the name
  }

  // filter out uninteresting keys
  var ks = this.db.createKeyStream()
  var ls = through2.obj(function(key, enc, next) {
    var name = filter(key)
    if (name) this.push(name)
    return next()
  })

  ks.pipe(ls)
  cb(null, ls)
  return errors.ReturnCallbackError
}

function encodeKey(key) {
  if (!(key instanceof Buffer))
    key = new Buffer(key.toString())
  return key
}

function isBuffer(val) {
  return val instanceof Buffer
}
