'use strict'

const core = require('../../src/core')
const isWebWorker = require('detect-webworker')
const {
  MemoryDatastore
} = require('interface-datastore')
const Ipld = require('ipld')
const Repo = require('ipfs-repo')
const BlockService = require('ipfs-block-service')

const createMfs = async () => {
  const repo = new Repo(`test-repo-${Date.now()}`, {
    lock: 'memory',
    storageBackends: {
      root: MemoryDatastore,
      blocks: MemoryDatastore,
      keys: MemoryDatastore,
      datastore: MemoryDatastore
    }
  })

  await repo.init({})
  await repo.open()

  const bs = new BlockService(repo)

  const ipld = new Ipld({
    blockService: bs
  })

  const mfs = core({
    ipld,
    datastore: repo.datastore,
    blocks: bs,

    // https://github.com/Joris-van-der-Wel/karma-mocha-webworker/issuses/4
    // There is no IPFS node running on the main thread so run it on the
    // worker along with the tests
    repoOwner: isWebWorker
  })

  mfs.ipld = ipld

  return mfs
}

module.exports = createMfs
