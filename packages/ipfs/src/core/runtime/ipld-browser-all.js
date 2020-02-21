'use strict'
const mergeOptions = require('merge-options')

module.exports = (blockService, options) => {
  options = options || {}

  return mergeOptions.call(
    // ensure we have the defaults formats even if the user overrides `formats: []`
    { concatArrays: true },
    {
      blockService: blockService,
      formats: [
        require('ipld-dag-cbor'),
        require('ipld-dag-pb'),
        require('ipld-raw'),
        require('ipld-bitcoin'),
        require('ipld-ethereum').ethAccountSnapshot,
        require('ipld-ethereum').ethBlock,
        require('ipld-ethereum').ethBlockList,
        require('ipld-ethereum').ethStateTrie,
        require('ipld-ethereum').ethStorageTrie,
        require('ipld-ethereum').ethTx,
        require('ipld-ethereum').ethTxTrie,
        require('ipld-git'),
        require('ipld-zcash')
      ]
    }, options)
}
