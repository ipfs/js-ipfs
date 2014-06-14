var fs = require('fs')
var msgproto = require('msgproto')
var multihashing = require('multihashing')

module.exports = ipfsObject

function ipfsObject(data) {
  if (!(this instanceof ipfsObject))
    return new ipfsObject(data)

  data = data || new Buffer(0)
  if (!(data instanceof Buffer))
    data = ipfsObject.encode(data)

  this.buffer = data
}


ipfsObject.prototype.data = function() {
  return this.decode().data
}

ipfsObject.prototype.links = function() {
  return this.decode().links
}

ipfsObject.prototype.decode = function() {
  return ipfsObject.codec.decode(this.buffer)
}

ipfsObject.prototype.encode = function() {
  return this.buffer
}

ipfsObject.prototype.multihash = function() {
  return multihashing(this.buffer, 'sha1')
}

ipfsObject.encode = function encode(data) {
  return ipfsObject.codec.encode(data)
}

var src = fs.readFileSync(__dirname + '/object.proto', 'utf-8')
var protos = msgproto.ProtobufCodec.fromProtoSrc(src)
ipfsObject.codec = protos.Object
