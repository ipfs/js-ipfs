var Packet = require('./packet')
var Frame = require('./frame')
var Peer = require('../../ipfs-peer')

module.exports = NetworkFrame

function NetworkFrame(src, dst, payload) {

  if (!(this instanceof NetworkFrame))
    return new NetworkFrame(src, dst, payload)

  Frame.apply(this, [payload])
  this.source = src && Peer(src)
  this.destination = dst && Peer(dst)
}

Packet.inherits(NetworkFrame, Frame)

NetworkFrame.prototype.toString = function() {
  var from = this.source.id.toString('hex').substr(0, 6)
  var to = this.destination.id.toString('hex').substr(0, 6)
  return "<NetworkFrame "+from+" -> "+to+">"
}

NetworkFrame.prototype.validate = function() {
  var err = Frame.prototype.validate.apply(this)
  if (err) return err

  if (!this.source || !(this.source instanceof Peer))
    return new Error("no or invalid source")

  if (!this.destination || !(this.destination instanceof Peer))
    return new Error("no or invalid destination")
}

NetworkFrame.prototype.encodeData = function() {
  var data = Frame.prototype.encodeData.apply(this)
  data.source = this.source.id
  data.destination = this.destination.id
  return data
}

NetworkFrame.prototype.decodeData = function(data) {
  Frame.prototype.decodeData.apply(this, arguments)
  this.source = Peer(data.source)
  this.destination = Peer(data.destination)
}
