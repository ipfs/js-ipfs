var protobuf = require('protobufjs')
var protobufStream = require('protobufjs-stream')
var ps = protobuf.loadProtoFile('messages.proto')
var mapv = require('map-values')
var protos = ps.result.messages
var schemas = mapv(protos, protobufStream)
schemas.DataMessage.encode({payload: new Buffer('abababab', 'hex')})
var b = schemas.DataMessage.encode({payload: new Buffer('ababababcd', 'hex')})
schemas.DataMessage.decode(b)


var bufeq = function(a, b) { return a <= b && a >= b; }
var msgeq = function(a, b) { return bufeq(a.encode(), b.encode()); }
var pkt = require('./')

var dm = pkt.DataMessage(new Buffer('abcd', 'hex'))
msgeq(pkt.DataMessage.decode(dm.encode()), dm)

var nf = pkt.NetworkFrame('1102aaaa', '1102bbbb', dm)
msgeq(pkt.NetworkFrame.decode(nf.encode()), nf)

var tf = pkt.IntegrityFrame(nf, 'sha1')
msgeq(pkt.IntegrityFrame.decode(tf.encode()), tf)

var pf = pkt.PayloadFrame(tf)
msgeq(pkt.PayloadFrame.decode(pf.encode()), pf)

var p = pf.encode()
msgeq(pkt.peek.network(p), nf)
msgeq(pkt.peek.integrity(p), tf)
msgeq(pkt.peek.packetType(p, pkt.DataMessage), dm)
