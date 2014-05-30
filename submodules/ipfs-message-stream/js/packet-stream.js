var inherits = require('inherits');
var defaults = require('defaults');
var Duplex = require('stream').Duplex
          || require('readable-stream').Duplex;
var DgramStream = require('dgram-stream')
var Peer = require('../../ipfs-peer')
var Pkt = require('../../ipfs-packet')

module.exports = PacketStream;

function PacketStream(dgrams, source, opts) {
  if (!(this instanceof PacketStream))
    return new PacketStream(dgrams, source, opts);

  if (!dgrams)
    throw new Error("ipfs-stream requires 'dgrams' argument.")

  if (!(dgrams instanceof DgramStream))
    dgrams = DgramStream(dgrams)

  if (!source)
    throw new Error("ipfs-stream requires 'source' argument.")

  if (!(source instanceof Peer))
    source = Peer(source)

  var self = this;

  opts = defaults(opts, {highWaterMark: 16})
  opts.objectMode = true
  Duplex.call(this, opts);
  this.readable = true
  this.writable = true
  this.dgrams = dgrams
  this.source = source

  this.dgrams.on('data', function(dgram) {
    self.emit('data', dgram2ipfs(dgram))
  })

  this.dgrams.on('end', function() {
    self.emit('end')
  })

}

inherits(PacketStream, Duplex);

PacketStream.prototype._write = function (ipfsPacket, enc, next) {
  if (ipfsPacket === null)
    return this.end();

  if (!(ipfsPacket instanceof Pkt.Packet))
    return this.emit('error', new Error('packet must be a Packet.'))

  this.dgrams.write(ipfs2dgram(ipfsPacket))
  next()
};

PacketStream.prototype._read = function () {}

function ipfs2dgram(ipfsPkt) {
  var net = Pkt.peek.network(ipfsPkt)
  return {
    to: peerDgramAddr(net.destination),
    // from: peerDgramAddr(source),
    payload: ipfsPkt.encode(),
  }
}

function dgram2ipfs(dgramPkt) {
  return Pkt.PacketFrame.decode(dgramPkt.payload)
}

function peerDgramAddr(peer) {
  var addr = peer.networkAddress('udp4')
  if (!addr)
    throw new Error('no dgram addr for peer: ' + peer)

  return Peer.addrUrlToObject(addr)
}
