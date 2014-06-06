var bufeq = require('buffer-equal')
var Packet = require('./packet')
var Frame = require('./frame')

module.exports = NonceFrame

function NonceFrame(payload, nonce) {

  if (!(this instanceof NonceFrame))
    return new NonceFrame(payload, nonce)

  if (nonce && !(nonce instanceof Buffer))
    throw new Error('nonce must be a Buffer')

  Frame.apply(this, [payload])
  this.nonce = nonce
}

Packet.inherits(NonceFrame, Frame)

NonceFrame.prototype.validate = function() {
  var err = Frame.prototype.validate.apply(this)
  if (err) return err

  if (!this.nonce || !(this.nonce instanceof Buffer))
    return new Error('nonce requied, to be a buffer.')

  return false
}

NonceFrame.prototype.encodeData = function() {
  var data = Frame.prototype.encodeData.apply(this)
  data.nonce = this.nonce
  return data
}

NonceFrame.prototype.decodeData = function(data) {
  Frame.prototype.decodeData.apply(this, arguments)
  this.nonce = data.nonce
}

NonceFrame.prototype.toString = function() {
  var hash = this.nonce.toString('hex').substr(0, 6)
  return "<NonceFrame 0x"+hash+">"
}
