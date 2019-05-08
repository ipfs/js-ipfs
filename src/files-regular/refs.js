/* eslint-env mocha */
'use strict'

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => ipfs.refs.bind(ipfs)
  require('./refs-tests')(createCommon, '.refs', ipfsRefs, options)
}
