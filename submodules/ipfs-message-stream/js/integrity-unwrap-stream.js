var through2 = require('through2')

module.exports = function() {
  return through2.obj({objectMode: true}, write)

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
