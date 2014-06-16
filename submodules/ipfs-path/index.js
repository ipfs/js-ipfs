var path = require('path')

module.exports = Path

function Path(data) {
  if (!(this instanceof Path))
    return new Path(data)

  if (data instanceof Buffer)
    this.buffer = data
  else if (Array.isArray(data))
    this.buffer = Path.encode(data)
  else
    this.buffer = Path.encode(data)
}

Path.prototype.toString = function() {
  return Path.decode(this.buffer)
}

Path.prototype.split = function() {
  return this.string.split(path.sep).slice(1) // remove first empty elem
}

Path.prototype.first = function() {
  return this.split().shift()
}

Path.prototype.last = function() {
  return this.split().pop()
}

Path.prototype.child = function() {
  return Path(this.split().slice(1))
}

Path.prototype.parent = function(name) {
  return Path([name].concat(this.parts))
}

Path.decode = function(buf) {
  var parts = Path.codec.decode(buf).parts
  return path.sep + parts.join(path.sep)
}

Path.encode = function(parts) {
  if (!Array.isArray(parts))
    parts = parts.split(path.sep)
  return Path.codec.encode({ parts: parts })
}
