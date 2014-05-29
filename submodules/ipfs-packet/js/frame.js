var Packet = require('./packet')

module.exports = Frame

// A Frame is a packet that carries another Packet
// as a payload. This is usually a PacketFrame.
// It provides nice helpers for encoding/decoding.
function Frame(payload) {
  if (!(this instanceof Frame))
    return new Frame(payload)

  Packet.apply(this)
  this.payload = payload
  this.payloadType = Frame.defaultPayloadType
}

Packet.inherits(Frame, Packet)

Frame.defaultPayloadType = Packet

Frame.prototype.encodePayload = function() {
  var payload = this.payload

  if (payload instanceof Packet)
    payload = payload.encode()

  if (payload instanceof Buffer)
    return payload

  throw new Error('invalid payload')
}

Frame.prototype.decodePayload = function() {
  var payload = this.payload

  if (payload instanceof Buffer)
    payload = this.payloadType.decode(payload)

  if (payload instanceof Packet)
    return payload

  throw new Error('invalid payload')
}

Frame.prototype.encodeData = function() {
  // no super because Packet doesn't do anything.
  return {
    payload: this.encodePayload()
  }
}

Frame.prototype.decodeData = function(data) {
  // no super because Packet doesn't do anything.
  this.payload = data.payload
}

Frame.prototype.validate = function() {
  // no super because Packet doesn't do anything.
  if (!this.payload)
    return new Error('Frame: no payload')

  if (!(this.payload instanceof Buffer) && !(this.payload instanceof Packet))
    return new Error('payload must be Buffer or Packet')
}
