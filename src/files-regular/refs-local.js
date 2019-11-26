/* eslint-env mocha */
'use strict'

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => ipfs.refs.local()
  require('./refs-local-tests')(createCommon, '.refs.local', ipfsRefsLocal, options)
}
