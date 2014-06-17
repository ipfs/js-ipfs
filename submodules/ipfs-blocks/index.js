var multihashes = require('multihashes')
var ipfsObject = require('../ipfs-object')
var ipfsBlock = require('../ipfs-block')
var errors = require('../ipfs-errors')

module.exports = ipfsBlocks

// ipfs-blocks is the block service for ipfs.
// it's really just an interface around a datastore
function ipfsBlocks(storage) {
  if (!(this instanceof ipfsBlocks))
    return new ipfsBlocks(storage)

  if (!storage) throw new Error('storage required')
  this.storage = storage
}

ipfsBlocks.errors = {
  RequiresBlockError: errors.RequiresBlockError,
  RequiresKeyMultihashError: errors.RequiresKeyMultihashError,
  RequiresCallbackError: errors.RequiresCallbackError,
  ReturnCallbackError: errors.ReturnCallbackError,
}

// blocks

ipfsBlocks.prototype.getBlock = function blocksGet(key, cb) {
  validateKey(key)
  validateCallback(cb)

  this.storage.get(key, function(err, key, val) {
    if (err) return cb(err, key)
    cb(null, key, ipfsBlock(val))
  })

  return errors.ReturnCallbackError
}

ipfsBlocks.prototype.putBlock = function blocksPut(block, cb) {
  validateBlock(block)
  validateCallback(cb)

  this.storage.put(block.key(), block.buffer, cb)
  return errors.ReturnCallbackError
}

// objects

ipfsBlocks.prototype.getObject = function(key, cb) {
  validateKey(key)
  validateCallback(cb)

  return this.getBlock(key, function(err, key, val) {
    if (err) return cb(err, key)
    var obj = ipfsObject(val.buffer)
    // console.log('get object: ' + obj.inspect())
    cb(null, key, obj)
  })
}


ipfsBlocks.prototype.putObject = function(object, cb) {
  validateObject(object)

  this.storage.put(object.multihash(), object.buffer, cb)
  return errors.ReturnCallbackError
}


function validateKey(key) {
  if (!key) throw errors.RequiresKeyMultihashError
  var err = multihashes.validate(key)
  if (err) throw err
}

function validateBlock(block) {
  if (!block || !(block.buffer && block.hash))
    throw errors.RequiresBlockError
}

function validateObject(object) {
  if (!object || typeof(object.multihash) !== 'function')
    throw errors.RequiresBlockError
}

function validateCallback(cb) {
  if (!cb || typeof(cb) !== 'function')
    throw new Error('requires callback')
}
