var segcodec = require('pipe-segment-codec')
var multiaddr = require('multiaddr')

module.exports = addrSeg
function addrSeg(peerbook) {
  if (!peerbook)
    throw new Error('addrSegment requires peerbook')

  return segcodec(encode, decode)

  function encode(data) {
    var peer = peerbook.get(data.to)
    if (!peer)
      throw new Error('ipfs net pipe: peerbook has no peer for id ' + data.to.toString('hex'))
    var addr = peer.networkAddress('udp')
    if (!addr)
      throw new Error('ipfs net pipe: no udp addr for peer ' + item.peer.id)
    data.to = addr.nodeAddress()
    return data
  }

  function decode(data) {
    var addr = multiaddr.fromNodeAddress(data.from, 'udp')
    var peer = peerbook.getByAddress(addr)
    if (!peer)
      throw new Error('ipfs net pipe: no peer for udp addr ' + item.peer.id)
    data.from = peer.id
    return data
  }
}