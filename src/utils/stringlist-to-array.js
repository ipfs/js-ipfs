'use strict'

// Converts a go-ipfs "stringList" to an array
// { Strings: ['A', 'B'] } --> ['A', 'B']
function stringlistToArray (res, cb) {
  cb(null, res.Strings || [])
}

module.exports = stringlistToArray
