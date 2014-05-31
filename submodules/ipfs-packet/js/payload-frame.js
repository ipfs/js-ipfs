var _ = require('underscore')
var Packet = require('./packet')
var Frame = require('./frame')

module.exports = PayloadFrame


// PayloadFrame is the encapsulating frame
// that carries around every other type of
// packet. This is a sort of meta packet.
function PayloadFrame(payload, type) {
  if (!(this instanceof PayloadFrame))
    return new PayloadFrame(payload, type)

  if (!type && payload instanceof Packet)
    type = codeFromName(nameFromType(payload.constructor))

  if (payload && !type)
    throw new Error('must have valid type')

  type = payloadType(type)
  Frame.apply(this, [payload, type.Cls])
  this.type = type
}

Packet.inherits(PayloadFrame, Frame)

PayloadFrame.prototype.validate = function() {
  var err = Frame.prototype.validate.apply(this)
  if (err) return err

  if (!this.data.type || !payloadType(this.data.type.code))
    return new Error("invalid payload type")

  if (!this.data.payload || this.data.payload.length < 1)
    return new Error("empty payload")
}

PayloadFrame.prototype.encodeData = function() {
  var data = Frame.prototype.encodeData.apply(this)
  data.type = this.type.code
  return data
}

PayloadFrame.prototype.decodeData = function(data) {
  Frame.prototype.decodeData.apply(this, arguments)
  this.type = payloadType(data.type)
  this.payloadType = this.type.Cls
}

PayloadFrame.prototype.toString = function() {
  return "<PayloadFrame "+ this.payloadType.name +">"
}



// register payloadPacketType classes here.
PayloadFrame.payloadPacketTypes = {}

// switch Frame defaultPacketType.
Frame.defaultPayloadType = PayloadFrame

function nameFromType(Type) {
  var types = PayloadFrame.payloadPacketTypes
  for (var name in types) {
    if (types[name] === Type)
      return name
  }
}

function nameFromCode(code) {
  return _.invert(PayloadFrame.schema.proto.PayloadType)[code]
}

function codeFromName(name) {
  return PayloadFrame.schema.proto.PayloadType[name]
}

function payloadType(code) {
  var name = nameFromCode(code)
  return {
    code: code,
    name: name,
    Cls: PayloadFrame.payloadPacketTypes[name],
  }
}
