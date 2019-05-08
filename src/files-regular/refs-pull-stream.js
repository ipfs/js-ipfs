/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => {
    return (path, params, cb) => {
      const stream = ipfs.refsPullStream(path, params)
      pull(stream, pull.collect(cb))
    }
  }
  require('./refs-tests')(createCommon, '.refsPullStream', ipfsRefs, options)
}
