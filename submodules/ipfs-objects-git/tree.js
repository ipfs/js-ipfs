var fs = require('fs')
var ipfsObject = require('../ipfs-object')
var protobuf = require('ipfs-protobuf-codec')
var types = require('./types')

module.exports = Tree

// a tree holds a map of names to objects in Git style
function Tree(data) {
  if (!(this instanceof Tree))
    return new Tree(data)

  // if raw object with entries, structure commit data
  if (!(data instanceof Buffer) && !data.data)
    data = treeObjectToData(data)

  // need to encode object data?
  if (data.data && data.data.entries !== undefined)
    data.data = Tree.codec.encode(data.data)

  // todo: validate data
  ipfsObject.call(this, data)
}

ipfsObject.inherits(Tree)

function treeObjectToData(tree) {
  var data = { data: { entries: [] }, links: [] }
  var links = {}

  for (var key in tree) {
    var val = tree[key]
    var type = types[val.constructor.name.toLowerCase()]
    var link = val.link()
    link.name = key
    data.links.push(link)
    data.data.entries.push({ index: (data.links.length - 1), type: type })
  }

  return data
}

// load protobuf
var src = fs.readFileSync(__dirname + '/git-objects.proto', 'utf-8')
Tree.codec = protobuf.fromProtoSrc(src).Tree
