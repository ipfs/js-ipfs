/* eslint-env mocha */
'use strict'

const concat = require('concat-stream')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => {
    return (cb) => {
      const stream = ipfs.refs.localReadableStream()
      stream.on('error', cb)
      stream.pipe(concat((refs) => cb(null, refs)))
    }
  }
  require('./refs-local-tests')(createCommon, '.refs.localReadableStream', ipfsRefsLocal, options)
}
