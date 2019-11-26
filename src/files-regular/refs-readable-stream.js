/* eslint-env mocha */
'use strict'

const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => (path, params) => {
    const stream = ipfs.refsReadableStream(path, params)
    return getStream.array(stream)
  }
  require('./refs-tests')(createCommon, '.refsReadableStream', ipfsRefs, options)
}
