var extend = require('xtend')
var levelup = require('levelup')
var multihash = require('multihashes')
var errors = require('../ipfs-errors')
var Block = require('../ipfs-block')
var ipfsObject = require('../ipfs-object')

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
  if (!key) throw new Error('storage.get requires key')

  key = encodeKey(key)

  this.db.get(key, function(err, val) {
    if (err) return cb(errors.NotFoundError)
    cb(null, val)
  })
  return errors.ReturnCallbackError
}


// put -- puts a value into local storage
ipfsStorage.prototype.put = function(key, val, cb) {
  if (arguments.length < 3) {
    cb = arguments[1]
    val = arguments[0]
    key = val.multihash() || val.key
  }

  if (!key) throw new Error('storage.put requires key')
  if (!val) throw new Error('storage.put requires val')
  if (!isBuffer(val)) throw new Error('storage.put requires Buffer val')

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

// getBlock -- gets a block from local storage
ipfsStorage.prototype.getBlock = function(key, cb) {
  if (!key) throw new Error('storage.getBlock requires key')
  var err = multihash.validate(key)
  if (err) throw new Error('invalid multihash key "' + key + '": ' +err)

  return this.get(key, function(err, val) {
    if (err) return cb(err)
    cb(null, Block(val))
  })
}


// putBlock -- puts a block into local storage
ipfsStorage.prototype.putBlock = function(block, cb) {
  if (!block) throw new Error('storage.putBlock requires block')
  return this.put(block.key(), block.buffer, cb)
}


// getObject -- gets an object from local storage (block)
ipfsStorage.prototype.getObject = function(key, cb) {
  if (!key) throw new Error('storage.getObject requires key')
  return this.getBlock(key, function(err, val) {
    if (err) return cb(err)
    var obj = ipfsObject(val.buffer)
    // console.log('get object: ' + obj.inspect())
    cb(null, obj)
  })
}


// putObject -- puts an object into local storage (block)
ipfsStorage.prototype.putObject = function(object, cb) {
  if (!object) throw new Error('storage.putObject requires object')
  // console.log('put object: ' + object.inspect())
  return this.put(object.multihash(), object.buffer, cb)
}

function isBuffer(val) {
  return val instanceof Buffer
}

function isString(val) {
  return typeof(val) == 'string' || val instanceof String
}
