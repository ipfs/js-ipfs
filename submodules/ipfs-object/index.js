var fs = require('fs')
var inherits = require('inherits')
var protobuf = require('ipfs-protobuf-codec')
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

ipfsObject.inherits = function(child, parent) {
  return inherits(child, parent || ipfsObject)
}

// override this to provide custom behavior to
// objects. Lists can concatenate, for example.
ipfsObject.prototype.data = function() {
  return this.rawData()
}

ipfsObject.prototype.rawData = function() {
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
var protos = protobuf.fromProtoSrc(src)
ipfsObject.codec = protos.Object
