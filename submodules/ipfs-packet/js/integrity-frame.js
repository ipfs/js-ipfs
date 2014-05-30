var Packet = require('./packet')
var Frame = require('./frame')
var multihash = require('multihashes')
var multihashing = require('multihashing')

module.exports = IntegrityFrame

function IntegrityFrame(payload, checksumFn, checksum) {

  if (!(this instanceof IntegrityFrame))
    return new IntegrityFrame(payload, checksumFn, checksum)

  Frame.apply(this, [payload])
  this.checksumFn = checksumFn && IntegrityFrame.coerceChecksumFn(checksumFn)
  this.checksum = checksum
}

Packet.inherits(IntegrityFrame, Frame)

IntegrityFrame.coerceChecksumFn = function(checksumFn) {
  return multihash.coerceCode(checksumFn)
  // will throw if not valid func. programmer error
}

IntegrityFrame.prototype.calculateChecksum = function() {
  if (!this.checksumFn)
    throw new Error('no checksum function.')

  var payload = this.encodePayload()
  return multihashing(payload, this.checksumFn)
}

IntegrityFrame.prototype.validateChecksum = function() {
  if (!this.checksum)
    return new Error("no checksum");

  // fill in checksumFn if we have a checksum.
  if (!this.checksumFn)
    this.checksumFn = multihash.decode(this.checksum).code

  var sum = this.calculateChecksum()
  if (!bufEq(this.checksum, sum))
    return new Error("checksum incorrect. "
      + "expected: " + sum.toString('hex') +
      ", got: " + this.checksum.toString('hex'))
}

IntegrityFrame.prototype.validate = function() {
  var err = Frame.prototype.validate.apply(this)
  if (err) return err

  return this.validateChecksum()
}

IntegrityFrame.prototype.encodeData = function() {
  var data = Frame.prototype.encodeData.apply(this)
  // if no checksum, calculate it. else trust it.
  // (should call validate if you cant trust it.)
  this.checksum = this.checksum || this.calculateChecksum()
  data.checksum = {hash: this.checksum}
  return data
}

IntegrityFrame.prototype.decodeData = function(data) {
  Frame.prototype.decodeData.apply(this, arguments)
  this.checksum = data.checksum.hash
  // this.checksumFn will be set when we validate.
}

IntegrityFrame.prototype.toString = function() {
  var ok = (this.validateChecksum() == undefined) ? 'ok' : 'fail';
  var hash = this.checksum.toString('hex').substr(0, 6)
  var fn = this.checksumFn
  return "<IntegrityFrame 0x"+fn+" "+hash+" "+ok+">"
}

function bufEq(a, b) { return a >= b && a <= b; }
