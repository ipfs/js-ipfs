var through2 = require('through2')
var transDuplex = require('duplex-transform')
var Pkt = require('../../ipfs-packet')

var IS = module.exports = IntegrityStream
IS.WrapStream = WrapStream
IS.UnwrapStream = UnwrapStream

// integrity stream "wraps" (pipes) a duplex packet stream
// with integrity checksums + verification
function IntegrityStream(checksumFn, stream) {
  return transDuplex.obj(WrapStream(checksumFn), stream, UnwrapStream())
}


function WrapStream(checksumFn) {
  checksumFn = Pkt.IntegrityFrame.coerceChecksumFn(checksumFn)
  return through2.obj(write)

  function write (packet, enc, next) {
    this.push(Pkt.PayloadFrame(Pkt.IntegrityFrame(packet, checksumFn)))
    next()
  }
}


// acceptFns is a list of functions to accept as valid.
// if acceptFns is undefined, all functions in multihash accepted
function UnwrapStream(acceptFns) {
  if (acceptFns)
    throw new Error('accepting specific functions not implemented yet')
  return through2.obj(write)

  function write(packet, enc, next) {
    var integrity = packet.decodePayload()
    var err = integrity.validate()
    if (err) {
      this.emit('invalid', { packet: integrity, error: err })
    } else {
      // ok, it's good. unwrap.
      this.push(integrity.decodePayload())
    }
    next()
  }
}
