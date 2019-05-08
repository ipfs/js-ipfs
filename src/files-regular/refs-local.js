/* eslint-env mocha */
'use strict'

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => (cb) => ipfs.refs.local(cb)
  require('./refs-local-tests')(createCommon, '.refs.local', ipfsRefsLocal, options)
}
