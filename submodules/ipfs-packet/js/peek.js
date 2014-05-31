// packet classes
var _ = require('underscore')
var Packet = require('./packet')
var Frame = require('./frame')
var PayloadFrame = require('./payload-frame')
var NetworkFrame = require('./network-frame')
var IntegrityFrame = require('./integrity-frame')
var DataMessage = require('./data-message')


// Peek is a module to introspect ipfs packets. ipfs packets are
// framed (encapsulated), e.g. integrity(network(bitswap(bitswap_data))))
// Each payload can be encoded/decoded. So, having a handle on the
// outermost frame, we need to peek in to answer some questions.

var peek = module.exports = RecursivePeek

function RecursivePeek(pkt, Types, action) {
  // default action: pluck out the packet
  action = action || function (pkt) { return pkt }

  if (!_.isArray(Types))
    Types = [Types]

  // if encoded,
  if (pkt instanceof Buffer)
    pkt = PayloadFrame.decode(pkt)

  // if packet frame, use payload packet
  if (pkt instanceof PayloadFrame)
    pkt = pkt.decodePayload(pkt)

  // if types match, try to run action
  for (var t in Types) {
    Type = Types[t]
    if (pkt instanceof Type) {
      val = action(pkt)
      if (val) return val
    }
  }

  // if frame, recurse
  if (pkt instanceof Frame)
    return RecursivePeek(pkt.decodePayload(), Types, action)
}

peek.packetType = function(pkt, Type) {
  return RecursivePeek(pkt, Type)
}

peek.network = function(pkt) {
  return peek.packetType(pkt, NetworkFrame)
}

peek.integrity = function(pkt) {
  return peek.packetType(pkt, IntegrityFrame)
}

