var fs = require('fs')
var ipfsObject = require('../ipfs-object')
var protobuf = require('ipfs-protobuf-codec')

module.exports = Block

// a block just holds a bunch of encoded data.
// the standard Object already does everything we want.
function Block(data) {
  if (!(this instanceof Block))
    return new Block(data)

  ipfsObject.call(this, data)
}

ipfsObject.inherits(Block)

var src = fs.readFileSync(__dirname + '/git-objects.proto', 'utf-8')
Block.codec = protobuf.fromProtoSrc(src).Block
