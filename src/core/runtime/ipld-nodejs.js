'use strict'
const mergeOptions = require('merge-options')
const multicodec = require('multicodec')
const log = require('debug')('ipfs:ipld')

// All known (non-default) IPLD formats
const IpldFormats = {
  get [multicodec.BITCOIN_BLOCK] () {
    return require('ipld-bitcoin')
  },
  get [multicodec.ETH_ACCOUNT_SNAPSHOT] () {
    return require('ipld-ethereum').ethAccountSnapshot
  },
  get [multicodec.ETH_BLOCK] () {
    return require('ipld-ethereum').ethBlock
  },
  get [multicodec.ETH_BLOCK_LIST] () {
    return require('ipld-ethereum').ethBlockList
  },
  get [multicodec.ETH_STATE_TRIE] () {
    return require('ipld-ethereum').ethStateTrie
  },
  get [multicodec.ETH_STORAGE_TRIE] () {
    return require('ipld-ethereum').ethStorageTrie
  },
  get [multicodec.ETH_TX] () {
    return require('ipld-ethereum').ethTx
  },
  get [multicodec.ETH_TX_TRIE] () {
    return require('ipld-ethereum').ethTxTrie
  },
  get [multicodec.GIT_RAW] () {
    return require('ipld-git')
  },
  get [multicodec.ZCASH_BLOCK] () {
    try {
      // TODO: zcash is no longer installed by default by ipfs until
      // https://github.com/ipld/js-ipld-zcash/issues/24 is resolved
      return require('ipld-zcash')
    } catch (err) {
      log('failed to require ipld-zcash (`npm i ipld-zcash` in your project if you want this format to work)', err)
      return null
    }
  }
}

module.exports = (blockService, options, log) => {
  options = options || {}

  return mergeOptions.call(
    // ensure we have the defaults formats even if the user overrides `formats: []`
    { concatArrays: true },
    {
      blockService: blockService,
      loadFormat: (codec) => {
        log('Loading IPLD format', codec)
        if (IpldFormats[codec]) {
          return IpldFormats[codec]
        } else {
          throw new Error(`Missing IPLD format "${codec}"`)
        }
      }
    }, options)
}
