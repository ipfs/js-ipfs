var errors = require('../ipfs-errors')
var bufeq = require('buffer-equal')

module.exports = Block

function Block(buf) {
  if (!(this instanceof Block))
    return new Block(buf)

  if (!buf || !(buf instanceof Buffer))
    throw new Error('requires buf Buffer')

  // if (buf.length > Block.MaxLength)
  //   throw errors.MaxSizeExceededError

  this.buffer = buf
  this._hash = undefined
}

Block.name == 'ipfsBlock'

Block.MaxLength = 4000 // in bytes

Block.errors = {
  RequiresValueBufferError: errors.RequiresValueBufferError,
  MaxSizeExceededError: errors.MaxSizeExceededError,
}

Block.hash = function(d) {
  return multihashing(d, 'sha1')
}

Block.prototype.hash = function() {
  if (!this._hash)
    this._hash = Block.hash(this.buffer)
  return this._hash
}

Block.prototype.hashEquals = function(other) {
  return bufeq(this.buffer, other.buffer)
}

Block.prototype.equals = function(other) {
  return this.hashEquals(other.hash())
}

Block.prototype.key = function() {
  return this.hash()
}
