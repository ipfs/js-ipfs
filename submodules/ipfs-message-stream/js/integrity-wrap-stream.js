var Pkt = require('../../ipfs-packet')
var through2 = require('through2')

module.exports = function(checksumFn) {
  checksumFn = Pkt.IntegrityFrame.coerceChecksumFn(checksumFn)
  return through2.obj(write)

  function write (packet, enc, next) {
    this.push(Pkt.PacketFrame(Pkt.IntegrityFrame(packet, checksumFn)))
    next()
  }
}
