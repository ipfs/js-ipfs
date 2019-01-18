'use strict'

const IPLD_FORMATS_CID = 'QmZaSX7mMriaBfvTvYdSS2kRdai3qUSMZ7edZnw4qzLPX2'



module.exports = self => {
  const IpldFormats = {}

  function createLoader (codec, path) {

  }

  // All known (non-default) IPLD formats
  const IpldFormatLoaders = {
    'bitcoin-block' (callback) {
      if (IpldFormats['bitcoin-block']) {
        return callback(null, IpldFormats['bitcoin-block'])
      }

      self.cat(`/ipfs/${IPLD_FORMATS_CID}/ipld-bitcoin@0.1.9/index.min.js`, (err, data) => {
        if (err) return callback(err)
        const fn = new Function(data.toString()) // eslint-disable-line no-new-func
        fn()
        IpldFormats['bitcoin-block'] = window.IpldBitcoin
        callback(null, IpldFormats['bitcoin-block'])
      })
    },
    'git-raw' (callback) {
      if (IpldFormats['git-raw']) {
        return callback(null, IpldFormats['git-raw'])
      }

      console.log(`Loading from /ipfs/${IPLD_FORMATS_CID}/ipld-git@0.2.2/index.min.js`)

      self.cat(`/ipfs/${IPLD_FORMATS_CID}/ipld-git@0.2.2/index.min.js`, (err, data) => {
        if (err) return callback(err)
        console.log('Loaded format git-raw')
        const fn = new Function(data.toString()) // eslint-disable-line no-new-func
        fn()
        console.log('window.IpldGit', window.IpldGit)
        IpldFormats['git-raw'] = window.IpldGit
        callback(null, IpldFormats['git-raw'])
      })
    },
    'zcash-block' (callback) {
      if (IpldFormats['zcash-block']) {
        return callback(null, IpldFormats['zcash-block'])
      }

      self.cat(`/ipfs/${IPLD_FORMATS_CID}/ipld-zcash@0.1.6/index.min.js`, (err, data) => {
        if (err) return callback(err)
        const fn = new Function(data.toString()) // eslint-disable-line no-new-func
        fn()
        IpldFormats['zcash-block'] = window.IpldZcash
        callback(null, IpldFormats['zcash-block'])
      })
    }
  }

  return (codec, callback) => {
    if (IpldFormatLoaders[codec]) return IpldFormatLoaders[codec](callback)
    callback(new Error(`Missing IPLD format "${codec}"`))
  }
}
