/* eslint-env mocha */
'use strict'

const pullToPromise = require('pull-to-promise')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => {
    const stream = ipfs.refs.localPullStream()

    return pullToPromise.any(stream)
  }
  require('./refs-local-tests')(createCommon, '.refs.localPullStream', ipfsRefsLocal, options)
}
