/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => {
    return (cb) => {
      const stream = ipfs.refs.localPullStream()
      pull(stream, pull.collect(cb))
    }
  }
  require('./refs-local-tests')(createCommon, '.refs.localPullStream', ipfsRefsLocal, options)
}
