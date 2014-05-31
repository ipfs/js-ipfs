var pkt = require('./')

var bufeq = function(a, b) { return a <= b && a >= b; }
var msgeq = function(a, b) { return bufeq(a.encode(), b.encode()); }
var tmsgeq = function(a, b) {
  if (msgeq(a, b))
    return true

  console.log(a)
  console.log(b)
  throw new Error('msgs not equal.')
}

var dm = pkt.DataMessage(new Buffer('abcd', 'hex'))
tmsgeq(pkt.DataMessage.decode(dm.encode()), dm)

var nf = pkt.NetworkFrame('1102aaaa', '1102bbbb', dm)
tmsgeq(pkt.NetworkFrame.decode(nf.encode()), nf)

var tf = pkt.IntegrityFrame(nf, 'sha1')
tmsgeq(pkt.IntegrityFrame.decode(tf.encode()), tf)

var pf = pkt.PayloadFrame(tf)
tmsgeq(pkt.PayloadFrame.decode(pf.encode()), pf)

var p = pf.encode()
tmsgeq(pkt.peek.network(p), nf)
tmsgeq(pkt.peek.integrity(p), tf)
tmsgeq(pkt.peek.packetType(p, pkt.DataMessage), dm)

console.log('ok')
