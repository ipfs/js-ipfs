var _ = require('underscore')
var ipfs = require('../.')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')
var multihashing = require('multihashing')
var multiaddr = require('multiaddr')
var transDuplex = require('duplex-transform')

function setupPeer(addr) {
  addr = multiaddr(addr)
  var p = Peer(multihashing(addr.buffer, 'sha1'))
  p.addresses.push(addr)
  return p
}

var peers = _.map(process.argv.slice(2), setupPeer)
var self = peers.shift()

var node = ipfs({
  identity: self,
  peerbook: peers,
})

function encode(data, enc, next) {
  // send to all peers
  for (var p in peers) {
    this.push({
      to: peers[p],
      payload: Pkt.DataMessage(new Buffer(data.toString())),
    })
  }
  next()
}

function decode(data, enc, next) {
  data = data.decodePayload() // DataMessage
  this.push(data.payload)
  next()
}

var pktizer = transDuplex.obj(encode, node.network, decode)
process.stdin.pipe(pktizer).pipe(process.stdout)
