var inherits = require('inherits')

module.exports = Packet

function Packet() {
  if (!(this instanceof Packet))
    return new Packet()
}

// Call validate to make sure all the data is set correctly.
Packet.prototype.validate = function() {}

// Call encodeData to get the finalized data for encoding.
Packet.prototype.encodeData = function() { return {} }

// Call decodeData to set values from decoded data.
Packet.prototype.decodeData = function(data) {}

Packet.prototype.encode = function() {
  return this.constructor.encode(this)
}

// Call Packet.encode to encode a packet object into a buffer.
Packet.prototype.encode = function() {
  if (!(this instanceof Packet))
    throw new Error('pkt must be a Packet')

  if (!this.constructor.schema)
    throw new Error('Packet has no schema: ' + this.constructor)

  return this.constructor.schema.encode(this.encodeData())
}

Packet.encode = function(pkt) {
  return pkt.encode()
}

// Call Packet.decode to decode a packet buffer into an object.
Packet.decode = function(buffer) {
  if (!(buffer instanceof Buffer))
    throw new Error('buffer must be a Buffer')

  // if (!pf.type)
  //   throw new Error('Packet.decode error: no packet type in frame.')

  // if (!pf.payload)
  //   throw new Error('Packet.decode error: no packet payload in frame.')

  if (!this.schema)
    throw new Error('Packet has no schema: ' + this)

  var p = this()
  p.decodeData(this.schema.decode(buffer))
  return p
}

Packet.inherits = function(Pkt, Parent) {
  Parent = Parent || Packet
  inherits(Pkt, Parent)
  Pkt.decode = Parent.decode
}
