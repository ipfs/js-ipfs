var msgproto = require('msgproto')
var integrity = require('ipfs-msgproto-integrity')
var duplexer2 = require('duplexer2.jbenet')
var segment = require('pipe-segment')
var Message = require('../ipfs-message')
var scope = require('./scoped-pair')


module.exports = wireSegment
function wireSegment() {
  // setup integrity checks (later signatures)
  var wire = msgproto.WireProtocol(Message)
  var intg = integrity.Protocol()
  connect(wire.buffers, intg.payloads)

  var enc = scope(wire.messages, intg.frames, '/payload')
  var dec = scope(intg.frames, wire.messages, '/payload')

  var o = {objectMode: true, highWaterMark: 16}
  return segment({
    // scoped because we need to convert only the payload
    messages: duplexer2(o, enc, dec),
    buffers: duplexer2(o, dec, enc),
    wire: wire,
    // messages: scope(wire.messages, intg.frames, '/payload'),
    // buffers: scope(intg.frames, wire.messages, '/payload'),
  })
}

function connect(a, b) {
  a.pipe(b).pipe(a)
}
