var _ = require('underscore')
var Packet = require('./packet')
var Frame = require('./frame')

module.exports = PacketFrame


// PacketFrame is the encapsulating frame
// that carries around every other type of
// packet. This is a sort of meta packet.
function PacketFrame(payload, type) {
  if (!(this instanceof PacketFrame))
    return new PacketFrame(payload, type)

  if (!type && payload instanceof Packet)
    type = codeFromName(nameFromType(payload.constructor))

  if (payload && !type)
    throw new Error('must have valid type')

  Frame.apply(this, [payload])
  this.type = payloadType(type)
  this.payloadType = this.type.Cls
}

Packet.inherits(PacketFrame, Frame)

PacketFrame.prototype.validate = function() {
  var err = Frame.prototype.validate.apply(this)
  if (err) return err

  if (!this.data.type || !payloadType(this.data.type.code))
    return new Error("invalid payload type")

  if (!this.data.payload || this.data.payload.length < 1)
    return new Error("empty payload")
}

PacketFrame.prototype.encodeData = function() {
  var data = Frame.prototype.encodeData.apply(this)
  data.type = this.type.code
  return data
}

PacketFrame.prototype.decodeData = function(data) {
  Frame.prototype.decodeData.apply(this, arguments)
  this.type = payloadType(data.type)
  this.payloadType = this.type.Cls
}


// register payloadPacketType classes here.
PacketFrame.payloadPacketTypes = {}

// switch Frame defaultPacketType.
Frame.defaultPayloadType = PacketFrame

function nameFromType(Type) {
  var types = pkt.PacketFrame.payloadPacketTypes
  for (var name in types) {
    if (types[name] === Type)
      return name
  }
}

function nameFromCode(code) {
  return _.invert(PacketFrame.schema.proto.PayloadType)[code]
}

function codeFromName(name) {
  return PacketFrame.schema.proto.PayloadType[name]
}

function payloadType(code) {
  var name = nameFromCode(code)
  return {
    code: code,
    name: name,
    Cls: PacketFrame.payloadPacketTypes[name],
  }
}
