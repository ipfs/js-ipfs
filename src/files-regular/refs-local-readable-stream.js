/* eslint-env mocha */
'use strict'

const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => {
    const stream = ipfs.refs.localReadableStream()
    return getStream.array(stream)
  }
  require('./refs-local-tests')(createCommon, '.refs.localReadableStream', ipfsRefsLocal, options)
}
