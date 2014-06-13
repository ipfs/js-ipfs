var errors = require('ipfs-errors')
var multihashes = require('multihashes')
var multihashing = require('multihashing')

module.exports = ipfsBlocks

// bitswap peers have:
// - wants, a list of needed blocks
// - ledger, a shared ledger

function ipfsBitswap(storage) {
  if (!storage) throw new Error('storage module required')
  this.storage = storage  // storage module
  this.peers = {}         // { peerid : Peer }
  this.want = {}          // { blockhash : priority }
  this.callbacks = {}     // { blockhash : [ get callbacks ] }
}

ipfsBlocks.errors = {
  RequiresCallbackError: RequiresCallbackError,
  ReturnCallbackError: ReturnCallbackError,
}

// getBlock -- retrieves the block named by key.
// tries local storage first, then adds it to our need list.
ipfsBitswap.prototype.getBlock = function bitswapGet(key, callback) {
  var self = this

  // try local storage first
  this.storage.get(key, storageCallback)
  return errors.ReturnCallbackError

  function storageCallback(err, value) {
    if (err) {
      // if not a "not found" error, bail.
      if (err !== self.storage.errors.NotFoundError)
        return callback(err)

      // add it to our need list.
      self.needBlock(key, 1, callback)
      return
    }

    // we got the value, return it.
    callback(null, value)
  }
}

// putBlock -- adds a block.
// adds to local storage, and notes we have it.
ipfsBitswap.prototype.putBlock = function bitswapPut(block, callback) {
  // note the new block, perhaps it's wanted.
  this.haveBlock(block.key(), block)

  // add to local storage
  this.storage.put(block.key(), block.buffer, callback)
  return errors.ReturnCallbackError
}

// haveBlock -- notes the acquisition of a new block
// run through connected nodes and see if any need it.
ipfsBitswap.prototype.haveBlock = function haveBlock(block) {
  for (var p in this.peers) {
    var peer = this.peers[p]
    if (peer.wants[block.hash()])
      this._considerSend(peer, block)
  }
}

// needBlock -- notes the necesity of a block
// add it to our want list for future announcements.
ipfsBitswap.prototype.needBlock = function haveBlock(block, priority, callback) {
  var h = block.hash()

  // add to our want list
  if (!this.want[h] || this.want[h] > priority)
    this.want[h] = priority

  // register the callback waiting
  if (!this.callbacks[h])
    this.callbacks[h] = []
  this.callbacks[h].push(_.once(callback))

  // (handle timeouts...)
}
