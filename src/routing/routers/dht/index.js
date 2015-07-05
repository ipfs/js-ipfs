/*
 * DHT routing plugin for router
 */

var KBucket = require('k-bucket')

exports = module.exports = DHT

function DHT (peerSelf) {
  var self = this

  if (!(self instanceof DHT)) {
    throw new Error('DHT must be called with new')
  }

  var kBucket = new KBucket({
    localNodeId: peerSelf.id.toBytes(),
    numberOfNodesPerKBucket: 20 // same as go-ipfs
  })

  kBucket.on('ping', function (oldContacts, newContact) {
    console.log('kbucket ping')
    // 1. ping each oldContact
    // 2. those who respond should be readded (kBucket.add)
    // 3. those who didn't respond should be removed (kBucket.remove)
    // 4. if at least one is removed, then newContact can be added (kBucket.add)
  })

  self.addPeer = function (peer) {
    kBucket.add({
      id: peer.id.toBytes(),
      peer: peer
    })
  }

  self.candidatesToId = function (id) {
    return kBucket.closest({
      id: id.toBytes(),
      n: 3
    })
  }
}
