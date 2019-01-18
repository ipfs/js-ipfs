'use strict'

// All known (non-default) IPLD formats
const IpldFormats = {
  get 'bitcoin-block' () {
    return require('ipld-bitcoin')
  },
  get 'eth-account-snapshot' () {
    return require('ipld-ethereum').ethAccountSnapshot
  },
  get 'eth-block' () {
    return require('ipld-ethereum').ethBlock
  },
  get 'eth-block-list' () {
    return require('ipld-ethereum').ethBlockList
  },
  get 'eth-state-trie' () {
    return require('ipld-ethereum').ethStateTrie
  },
  get 'eth-storage-trie' () {
    return require('ipld-ethereum').ethStorageTrie
  },
  get 'eth-tx' () {
    return require('ipld-ethereum').ethTx
  },
  get 'eth-tx-trie' () {
    return require('ipld-ethereum').ethTxTrie
  },
  get 'git-raw' () {
    return require('ipld-git')
  },
  get 'zcash-block' () {
    return require('ipld-zcash')
  }
}

module.exports = () => {
  return (codec, callback) => {
    if (IpldFormats[codec]) return callback(null, IpldFormats[codec])
    callback(new Error(`Missing IPLD format "${codec}"`))
  }
}
