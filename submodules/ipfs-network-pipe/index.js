var dgrams = require('dgram-stream')
var Message = require('../ipfs-message')
var segment = require('pipe-segment')
var segcodec = require('pipe-segment-codec')
var msgproto = require('msgproto')
var integrity = require('ipfs-msgproto-integrity')
var scopred = require('scoped-transform-stream')

module.exports = netPipe

function netPipe(opts, peerbook) {
  opts = opts || {}

  function connect(a, b) {
    a.pipe(b).pipe(a)
  }

  // setup network socket
  var socks = dgrams('udp4')
  socks.bind(6130)

  // address translation node dgram <-> peerid
  var addrts = addrSegment()
  connect(addrts.encoded, socks)

  // scoped transform pipeline (payloads)
  var wire = wireSegment()
  connect(wire.remote, addrts.decoded)

  // wrap msg codec
  var wrapmsg = wrapMessages()
  connect(wrapmsg.encoded, wire.local)

  return segment({
    wire: wire,
    messages: wrapmsg.decoded,
  })
}

function wrapMessages() {
  return segcodec(wrap, unwrap) // encode, decode

  function wrap(msg) {
    // pull out the dst, for the dgram stream
    return { payload: msg, to: msg.destination }
  }

  function unwrap(data) {
    return data.payload
  }
}

function wireSegment() {
  // setup integrity checks (later signatures)
  var intg = integrity.Protocol()
  var wire = msgproto.WireProtocol(Message)
  connect(intg.payloads, wire.buffers)

  return segment({
    // scoped because we need to convert only the payload
    local: scoped(wire.frames, '/payload'),
    remote: scoped(intg.frames, '/payload'),
  })
}

function addrSegment(peerbook) {
  if (!peerbook)
    throw new Error('addrSegment requires peerbook')

  return segcodec(encode, decode)

  function encode(data) {
    var peer = peerbook.get(data.to)
    var addr = item.peer.networkAddress('udp')
    if (!addr)
      throw new Error('ipfs net pipe: no udp addr for peer ' + item.peer.id)
    data.to = addr.nodeAddress()
    return data
  }

  function decode(data) {
    var addr = multiaddr.fromNodeAddress(data.to, 'udp')
    var peer = peerbook.getByAddress(addr)
    if (!peer)
      throw new Error('ipfs net pipe: no peer for udp addr ' + item.peer.id)
    data.to = peer.id
    return data
  }
}
