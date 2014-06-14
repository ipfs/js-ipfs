var fs = require('fs')
var ipfsObject = require('../ipfs-object')
var protobuf = require('ipfs-protobuf-codec')

module.exports = List

// a list just holds a bunch of links to objects.
function List(data) {
  if (!(this instanceof List))
    return new List(data)

  ipfsObject.call(this, data)
}

ipfsObject.inherits(List)

// override this to provide custom behavior to objects.
// concatenate
ipfsObject.prototype.data = function() {
  return this.rawData()
}

var src = fs.readFileSync(__dirname + '/git-objects.proto', 'utf-8')
Block.codec = protobuf.fromProtoSrc(src).Block
