var _ = require('underscore')
var inherits = require('inherits')
var multihash = require('multihashes')
// var protobuf = require('protocol-buffers')
// var proto2json = require('proto2json')
var protobuf = require('protobufjs')
var protobufStream = require('protobufjs-stream')
var mapv = require('map-values')

var pkt = module.exports = {}

// encoders/decoders
// pkt.protos = proto2json.parse(fs.readFileSync('messages.proto', 'utf-8'))
// pkt.schemas = mapv(pkt.protos.messages, function(v, k) { return protobuf(v) })
pkt.protos = protobuf.loadProtoFile('messages.proto').result.messages
pkt.schemas = mapv(pkt.protos, protobufStream)

// packet classes
pkt.Packet = require('./js/packet')
pkt.Frame = require('./js/frame')
pkt.PacketFrame = require('./js/packet-frame')
pkt.NetworkFrame = require('./js/network-frame')
pkt.IntegrityFrame = require('./js/integrity-frame')
pkt.DataMessage = require('./js/data-message')

// utilities
pkt.peek = require('./js/peek')

// Register classes with PacketFrame, so that it can
// instantiate them when decoding.
for (var name in pkt) {
  if (/(Message|Frame)$/.test(name))
    pkt.PacketFrame.payloadPacketTypes[name] = pkt[name]
}

// Setup imported schemas. Done here, instead of in
// each message file to avoid import N times.
for (var name in pkt.schemas) {
  if (pkt[name])
    pkt[name].schema = pkt.schemas[name]
  // else
  //   console.log('ignoring schema: ' + name)
}
