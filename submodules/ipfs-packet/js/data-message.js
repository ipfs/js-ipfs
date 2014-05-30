var Packet = require('./packet')

module.exports = DataMessage

function DataMessage(payload) {
  if (!(this instanceof DataMessage))
    return new DataMessage(payload)

  Packet.apply(this)
  this.payload = payload
}

Packet.inherits(DataMessage, Packet)

DataMessage.prototype.validate = function() {
  // no super because Packet doesn't do anything.
  if (this.payload && !(this.payload instanceof Buffer))
    return new Error('DataMessage payload should be a Buffer')
}

DataMessage.prototype.encodeData = function() {
  // no super because Packet doesn't do anything.
  return {
    payload: this.payload || new Buffer('') // empty payload
  }
}

DataMessage.prototype.decodeData = function(data) {
  // no super because Packet doesn't do anything.
  this.payload = data.payload
}

DataMessage.prototype.toString = function() {
  return "<DataMessage "+ this.payload.toString().substr(0, 20) +">"
}
