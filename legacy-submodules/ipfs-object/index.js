var fs = require('fs')
var Long = require('long')
var inherits = require('inherits')
var protobuf = require('ipfs-protobuf-codec')
var bufeq = require('buffer-equal')
var multihashing = require('multihashing')

module.exports = ipfsObject

function ipfsObject(data) {
  if (!(this instanceof ipfsObject))
    return new ipfsObject(data)

  data = data || new Buffer(0)
  if (data.data && !(data.data instanceof Buffer))
    data.data = this.encodeData(data.data)

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
  return this.decodeData(this.rawData())
}

// returns the data of this object raw, encoded.
ipfsObject.prototype.rawData = function() {
  return this.decode().data
}

// returns all the links within this object
ipfsObject.prototype.links = function() {
  return this.decode().links
}

// returns the hash of the child object linked by name
ipfsObject.prototype.child = function(name) {
  var links = this.links()
  if (typeof(name) === 'number')
    return links[name].hash

  for (var i in links) {
    if (links[i].name === name)
      return links[i].hash
  }

  return undefined
}

// returns size of this object (encoded)
ipfsObject.prototype.size = function() {
  var size = this.buffer.length
  var links = this.links()
  for (var i in links) {
    var s = parseInt(links[i].size, 10) || 0
    if (s > 0) size += s
  }
  return size
}

// returns link to _this_ object
ipfsObject.prototype.link = function(name) {
  return ipfsObject.link(this.multihash(), name, this.size())
}

ipfsObject.prototype.decode = function() {
  if (!this._decoded) // cache.
    this._decoded = ipfsObject.codec.decode(this.buffer)
  return this._decoded
}

ipfsObject.prototype.encode = function() {
  return this.buffer
}

ipfsObject.prototype.multihash = function() {
  if (!this._multihash) // lazy construction.
    this._multihash = multihashing(this.buffer, 'sha1')
  return this._multihash
}

ipfsObject.prototype.equals = function(obj) {
  return bufeq(this.multihash(), obj.multihash())
}

ipfsObject.prototype.inspect = function() {
  return "<IPFS Object " + this.multihash().toString('hex') + ">"
}

ipfsObject.prototype.encodeData = function(data) {
  if (this.constructor.codec != ipfsObject.codec)
    return this.constructor.codec.encode(data)
  return new Buffer(data)
}

ipfsObject.prototype.decodeData = function(data) {
  if (this.constructor.codec != ipfsObject.codec)
    return this.constructor.codec.decode(data)
  return data
}

ipfsObject.encode = function encode(data) {
  try {
    return ipfsObject.codec.encode(data)
  } catch (e) {
    throw new Error("Encoding ipfs object: " + e)
  }
}

ipfsObject.link = function(hash, name, size) {
  var o = {}
  o.hash = assertMultihash(hash)
  if (name) o.name = name
  if (size) o.size = size
  return o
}

ipfsObject.assertMultihash = assertMultihash
function assertMultihash(hash) {
  var err = multihashing.multihash.validate(hash)
  if (err) throw err
  return hash
}

ipfsObject.coerceLink = coerceLink
function coerceLink(obj) {
  if (typeof(obj.link) == 'function')
    obj = obj.link()
  else if (obj instanceof Buffer)
    obj = ipfsObject.link(obj) // what about size + name ???
  else if (!obj.hash)
    throw new Error('Link error: must include hash property.')
  return obj
}


var src = fs.readFileSync(__dirname + '/object.proto', 'utf-8')
var protos = protobuf.fromProtoSrc(src)
ipfsObject.codec = protos.Object

// longfix decode
ipfsObject.codec.decode = (function(decode) {
  return function(buf) {
    var ret = decode.apply(this, arguments)
    for (var l in ret.links) {
      var link = ret.links[l]
      var s = link.size
      if (typeof(s) == 'object')
        link.size = new Long(s.low, s.high, s.unsigned).toString()
    }
    return ret
  }
})(ipfsObject.codec.decode)
