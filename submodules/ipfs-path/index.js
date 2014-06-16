var fs = require('fs')
var map = require('lodash.map')
var path = require('path')
var bufeq = require('buffer-equal')
var base58 = require('base58-native').base58Check
var protobuf = require('ipfs-protobuf-codec')
var multihash = require('multihashes')

module.exports = Path

function Path(data) {
  if (!(this instanceof Path))
    return new Path(data)

  if (data instanceof Buffer && arguments.length == 1) {
    this.buffer = data
    return
  }

  if (!Array.isArray(data))
    data = Array.prototype.slice.call(arguments, 0)

  data = cleanPathInput(data)
  this.buffer = Path.encode(data)
}

Path.prototype.inspect = function() {
  return "<IPFS Path "+ this.toString() +">"
}

Path.prototype.toString = function() {
  return Path.decode(this.buffer)
}

Path.prototype.split = function() {
  return this.toString().split(path.sep).slice(1) // remove first empty elem
}

Path.prototype.bufsplit = function() {
  return Path.codec.decode(this.buffer).parts
}

Path.prototype.first = function() {
  return this.split().shift()
}

Path.prototype.last = function() {
  return this.split().pop()
}

Path.prototype.child = function(name) {
  return Path(this.bufsplit().concat([name]))
}

Path.prototype.parent = function() {
  var a = this.bufsplit()
  return Path(a.slice(0, a.length - 2))
}

Path.prototype.prepend = function(p) {
  p = Path(p)
  return Path(p.bufsplit().concat(this.bufsplit()))
}

Path.prototype.append = function(p) {
  p = Path(p)
  return Path(this.bufsplit().concat(p.bufsplit()))
}

Path.prototype.slice = function() {
  var a = this.bufsplit()
  return Path(a.slice.apply(a, arguments))
}

Path.prototype.equals = function(p) {
  return bufeq(this.buffer, p.buffer)
}

Path.decode = function(buf) {
  var parts = Path.codec.decode(buf).parts
  parts = map(parts, decodePathComponent)
  return path.sep + parts.join(path.sep)
}

Path.encode = function(parts) {
  if (!Array.isArray(parts))
    parts = parts.split(path.sep)
  parts = map(parts, encodePathComponent)
  return Path.codec.encode({ parts: parts })
}

function cleanPathInput(input) {
  return map(input, encodePathComponent)
}

function encodePathComponent(e) {
  if (e instanceof Buffer)
    return e

  if (e && typeof(e.multihash) === 'function')
    return e.multihash()

  if (typeof(e) === 'string' || e instanceof String)
    return new Buffer(e)

  throw new Error("invalid path component: " + e)
}

function decodePathComponent(e) {
  if (!multihash.validate(e)) // if no errors (is multihash)
    return base58.encode(e)

  return e.toString()
}

var src = fs.readFileSync(__dirname + '/path.proto', 'utf-8')
Path.codec = protobuf.fromProtoSrc(src).Path
