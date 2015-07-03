var fs = require('fs')
var ipfsObject = require('../ipfs-object')
var protobuf = require('ipfs-protobuf-codec')
var multihash = require('multihashes')

module.exports = List

// a list holds: [ <link to list or object>, ... ]
function List(data) {
  if (!(this instanceof List))
    return new List(data)

  // if array, assume [ object, ... ]  or [ multihash Buffer, ... ]
  if (Array.isArray(data))
    data = listArrayToData(data)

  // need to encode list data?
  if (data.data && Array.isArray(data.data.items))
    data.data = List.codec.encode(data.data)

  // todo: validate data
  ipfsObject.call(this, data)
}

ipfsObject.inherits(List)


// turn data an array of ipfsObjects into corresponding list data
function listArrayToData(array) {
  var data = { data: { items: [] }, links: [] }
  var links = {}

  for (var i in array) {
    var val = array[i]
    var link = val.link()
    link.name = "" + i
    data.links.push(link)
    data.data.items.push(data.links.length - 1)
  }

  return data
}

var src = fs.readFileSync(__dirname + '/git-objects.proto', 'utf-8')
List.codec = protobuf.fromProtoSrc(src).List
