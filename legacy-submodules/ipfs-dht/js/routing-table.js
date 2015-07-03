var _ = require('underscore')
var xor = require('bitwise-xor')
var Peer = require('../ipfs-peer')
var prefixLen = require('bit-prefix-len')

module.exports = RoutingTable

function RoutingTable(config) {
  this.config = _.defaults((config || {}), RoutingTable.configDefaults)

  if (!this.config.peer || !(this.config.peer instanceof Peer))
    throw new Error('routing table requires config.peer (instance of Peer)')

  if (!this.config.dht)
    throw new Error('routing table requires config.dht')

  this.peer = this.config.peer
  this.dht = this.config.dht

  this.buckets = {}
  for (var i = 0; i < this.config.addressLength; i++)
    this.buckets[i] = [] // initialize empty lists
}

RoutingTable.configDefaults = {

  // in bits. this defines the number of routing table entries
  addressLength: 256, // sha2-256

  // amount of time to wait for a ping to return before eviction
  pingWait: 3 * 1000, // 3 seconds

}

RoutingTable.prototype.updatePeer = function updatePeer(peer) {
  var bucket = this.buckets[peerDistance(this.peer, peer)]

  // if found, move to the end of list.
  var found = bucket.indexOf(peer)
  if (found >= 0) {
    bucket.splice(found, 1)
    bucket.push(peer)
  }

  // else if bucket has space, add to end.
  else if (bucket.length < this.config.bucketSize) {
    bucket.push(peer) // add to the end
  }
  // else need to ping bucket[0] and potentially evict.
  else {
    this._maybeReplacePeer(bucket, bucket[0], peer)
  }
}

RoutingTable.prototype._maybeReplacePeer = function(bucket, oldPeer, newPeer) {
  this.dht.ping(oldPeer, this.config.pingWait, function(err, conn) {
    var removed = arrayRemove(bucket, oldPeer)
    if (!removed) {
      console.log('DHT.RoutingTable: oldPeer evicted from bucket before 2nd eviction.')
      // it disappeared from the bucket _before_ this callback was called.
      // weird. maybe getting many new peers for this bucket.
      return // ignore new peer. this bucket may be changing a lot...
    }

    if (err) // failed, timeout.
      bucket.push(newPeer) // use new peer.
    else // successful ping. ignore new peer.
      bucket.push(oldPeer) // move old peer to end of the list
  })
}

RoutingTable.prototype.findClosest = function findClosest(target, num) {
  var peers = {}
  var distance = peerDistance(this.peer, target)
  var bucket = this.buckets[distance]

  // get all candidate peers
  for (var i = 0; peers.length < num; i++) {
    var prevBucket = this.buckets[distance - i] || []
    var nextBucket = this.buckets[distance + i] || []
    var peerShell = prevBucket.concat(nextBucket)
    _.each(peerShell, function (peer) {
      peers[xor(peer.id, target)] = peer
    })
  }

  // sort peers by distance
  peers = _.pairs(peers) // get (dist, peer) pairs
  peers = _.sortBy(peers, function (t) { return t[0] }) // sort on dist
  peers = _.map(peers, function (t) { return t[1] }) // get peers
  // ascending. the closer they are, the more zeros at beginning.

  return _.first(peers, num) // return only best num peers
}

function arrayRemove(arr, item) {
  var i = arr.indexOf(item)
  if (i < 0)
    return false

  arr.splice(i, 1)
  return true
}


// peerDistance is a metric of "how far away" peers are from each other.
// in kademlia, it's based on the divergence of xoring the addresses.
function peerDistance(peer1, peer2) {
  // 0 = ids are the same there.
  return prefixLen(0, xor(peer1.id || peer1, peer2.id || peer2))
}
