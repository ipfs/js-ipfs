'use strict'

const IPLD_FORMATS_CID = 'QmP7qfTriY43hb2fUppkd5NvCSV5GxMAHM6cYHMq9uFTeX'

module.exports = self => {
  const options = self._options.ipld || {}
  const jsLoader = createIpfsJsLoader(self, `/ipfs/${options.formatsCid || IPLD_FORMATS_CID}`)

  // All known (non-default) IPLD formats
  const IpldFormatLoaders = {
    'bitcoin-block': jsLoader(
      '/ipld-bitcoin@0.1.9/index.min.js',
      () => window.IpldBitcoin
    ),
    'eth-account-snapshot': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethAccountSnapshot
    ),
    'eth-block': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethBlock
    ),
    'eth-block-list': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethBlockList
    ),
    'eth-state-trie': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethStateTrie
    ),
    'eth-storage-trie': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethStorageTrie
    ),
    'eth-tx': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethTx
    ),
    'eth-tx-trie': jsLoader(
      '/ipld-ethereum@2.0.3/index.min.js',
      () => window.IpldEthereum.ethTxTrie
    ),
    'git-raw': jsLoader(
      '/ipld-git@0.2.3/index.min.js',
      () => window.IpldGit
    ),
    'zcash-block': jsLoader(
      '/ipld-zcash@0.1.6/index.min.js',
      () => window.IpldZcash
    )
  }

  return (codec, callback) => {
    if (IpldFormatLoaders[codec]) return IpldFormatLoaders[codec](callback)
    callback(new Error(`Missing IPLD format "${codec}"`))
  }
}

// Create a module loader for the passed root path e.g. /ipfs/QmHash
function createIpfsJsLoader (ipfs, rootPath) {
  const Modules = {}

  // Create a loader for the given path that will extract a JS object from
  // the exports of the loaded module using getExport
  return (path, getExport) => {
    return callback => {
      if (Modules[path]) {
        switch (Modules[path].state) {
          case 'loading':
            return Modules[path].callbacks.push({ getExport, callback })
          case 'loaded':
            return callback(null, getExport(Modules[path].exports))
          case 'error':
            return callback(Modules[path].error)
        }
        return callback(new Error('unknown format load state'))
      }

      Modules[path] = { state: 'loading', callbacks: [{ getExport, callback }] }

      ipfs.cat(`${rootPath}${path}`, (err, data) => {
        if (err) {
          Object.assign(Modules[path], { state: 'error', error: err })
          Modules[path].callbacks.forEach(({ callback }) => callback(err))
          Modules[path].callbacks = []
          return
        }

        const exports = (new Function(data.toString()))() // eslint-disable-line no-new-func
        Object.assign(Modules[path], { state: 'loaded', exports })

        Modules[path].callbacks.forEach(({ getExport, callback }) => {
          callback(null, getExport(exports))
        })
        Modules[path].callbacks = []
      })
    }
  }
}
