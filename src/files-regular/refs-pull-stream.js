/* eslint-env mocha */
'use strict'

const pullToPromise = require('pull-to-promise')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => (path, params) => {
    const stream = ipfs.refsPullStream(path, params)

    return pullToPromise.any(stream)
  }
  require('./refs-tests')(createCommon, '.refsPullStream', ipfsRefs, options)
}
