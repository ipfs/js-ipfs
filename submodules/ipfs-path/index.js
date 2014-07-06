var fs = require('fs')
var map = require('lodash.map')
var path = require('path')
var bufeq = require('buffer-equal')
var base58 = require('base58-native')
var protobuf = require('ipfs-protobuf-codec')
var multihash = require('multihashes')

module.exports = Path


// for now, Path is always absolute.
// for now, Path buffers are encoded with base58check
function Path(data) {
  if (!(this instanceof Path))
    return new Path(data)

  if (arguments.length > 1)
    data = Array.prototype.slice.call(arguments, 0)

  if (data instanceof Path)
    data = data.parts
  else if (typeof(data) === 'string' || data instanceof String)
    data = splitStringPath(data)
  else if (!Array.isArray(data))
    data = [data]

  data = cleanPathInput(data)

  if (data.length > Path.MAX_DEPTH)
    throw new Error('path depth max ' + Path.MAX_DEPTH + ' exceeded')

  this.parts = data
}

// what's a sane limit here? TODO
Path.MAX_DEPTH = 128

Path.prototype.inspect = function() {
  return "<IPFS Path "+ this.toString() +">"
}

Path.prototype.toString = function() {
  return '/' + this.parts.join('/')
}

Path.prototype.length = function() {
  return this.parts.length
}

Path.prototype.isRoot = function() {
  return this.parts.length == 0
}

Path.prototype.first = function() {
  return this.parts[0]
}

Path.prototype.last = function() {
  return this.parts[this.parts.length - 1]
}

Path.prototype.child = function(name) {
  return Path(this.parts.concat([name]))
}

Path.prototype.parent = function() {
  return this.slice(0, a.length - 2)
}

Path.prototype.prepend = function(p) {
  return Path(p).concat(this)
}

Path.prototype.append = function(p) {
  return this.concat(p)
}

Path.prototype.slice = function() {
  return Path(this.parts.slice.apply(this.parts, arguments))
}

Path.prototype.concat = function(p) {
  return Path(this.parts.concat(Path(p).parts))
}

Path.prototype.equals = function(p) {
  return this.toString() == p.toString()
}

function splitStringPath(p) {
  // normalize, which is platform dependent.
  p = p.split('/')
  p = path.join.apply(path, p)
  p = path.normalize(p).split(path.sep)

  // for now all ipfs paths are absolute, w/o trailing slash
  if (p[0] == '') p.shift()
  if (p[p.length - 1] == '') p.pop()
  return p
}

function cleanPathInput(input) {
  return map(input, cleanPathComponent)
}

function cleanPathComponent(e) {
  if (e && typeof(e.multihash) === 'function')
    e = e.multihash()

  if (e instanceof Buffer)
    return Path.encodeBinary(e)

  if (typeof(e) === 'string' || e instanceof String) {
    if (e.indexOf(path.sep) >= 0)
      throw new Error("invalid path component: has path sep: " + e)
    return e
  }

  throw new Error("invalid path component: " + e)
}

Path.encodeBinary = function(buf) {
  return base58.encode(buf)
}

Path.decodeBinary = function(s) {
  return base58.decode(s)
}
