var wtr = require('write-transform-read.jbenet')
var ptr = require('json-pointer')
var through2 = require('through2')

module.exports = Scope

// this here until https://github.com/mafintosh/write-transform-read/pull/1
// is merged and scoped-transform-stream is fixed to use it.
function Scope(writable, readable, path) {
  var transform = wtr(writable, readable)
  return through2.obj(function(data, enc, cb) {
    transform(ptr(data, path), function(err, result) {
      if (err) return cb(err)
      ptr(data, path, result) // replace
      cb(null, data)
    }, function(cb) {
      stream.end(cb)
    })
  })
}