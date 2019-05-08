/* eslint-env mocha */
'use strict'

const concat = require('concat-stream')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => {
    return (path, params, cb) => {
      const stream = ipfs.refsReadableStream(path, params)
      stream.on('error', cb)
      stream.pipe(concat((refs) => cb(null, refs)))
    }
  }
  require('./refs-tests')(createCommon, '.refsReadableStream', ipfsRefs, options)
}
