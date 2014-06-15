var fs = require('fs')
var ipfsObject = require('../ipfs-object')
var protobuf = require('ipfs-protobuf-codec')
var multihash = require('multihashes')
var types = require('./types')

module.exports = Commit

// a commit holds versioning information in Git style
function Commit(data) {
  if (!(this instanceof Commit))
    return new Commit(data)

  // if raw object with parent, structure commit data
  if (data.parent)
    data = commitObjectToData(data)

  // need to encode object data?
  if (data.data && data.data.type !== undefined)
    data.data = Commit.codec.encode(data.data)

  // todo: validate data
  ipfsObject.call(this, data)
}

ipfsObject.inherits(Commit)

function commitObjectToData(commit) {
  var type = commit.object.constructor.name.toLowerCase()

  var obj = { data: {}, links: [] }
  obj.data.type = types[type] // number
  obj.data.date = coerceDate(commit.date)
  obj.data.message = commit.message.toString()

  // add links [0, 1, 2] (parent, object, author)
  // todo: validate commit hashes of right types??
  obj.links.push(ipfsObject.coerceLink(commit.parent))
  obj.links.push(ipfsObject.coerceLink(commit.object))
  obj.links.push(ipfsObject.coerceLink(commit.author))
  return obj
}

function coerceDate(date) {
  if (!date)
    throw new Error('date must be a valid ISO date.')

  if (date instanceof Date)
    date = date.toISOString()
  //todo: validate date here. (or convert -> js Date -> ISOString)
  return date.toString()
}

// load protobuf
var src = fs.readFileSync(__dirname + '/git-objects.proto', 'utf-8')
Commit.codec = protobuf.fromProtoSrc(src).Commit
