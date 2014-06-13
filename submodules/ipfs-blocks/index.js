var errors = require('ipfs-errors')
var multihashes = require('multihashes')

module.exports = ipfsBlocks

// ipfs-blocks is the block service for ipfs.
// it's really just an interface around bitswap.
function ipfsBlocks(storage, bitswap) {
  if (!bitswap) throw new Error('bitswap module required')
  this.bitswap = bitswap
}

ipfsBlocks.errors = {
  RequiresKeyMultihashError: RequiresKeyMultihashError,
  RequiresCallbackError: RequiresCallbackError,
  ReturnCallbackError: ReturnCallbackError,
}

ipfsBlocks.prototype.getBlock = function blocksGet(key, callback) {
  validateKey(key)
  validateCallback(callback)

  this.bitswap.getBlock(key, callback)
  return errors.ReturnCallbackError
}

ipfsBlocks.prototype.putBlock = function blocksPut(block, callback) {
  validateBlock(block)
  validateCallback(callback)

  this.bitswap.putBlock(block, callback)
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

function validateCallback(key) {
  if (!callback || !typeof(callback) == 'function')
    throw errors.RequiresCallbackError
}
