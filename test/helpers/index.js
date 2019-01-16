'use strict'

const core = require('../../src/core')
const isWebWorker = require('detect-webworker')
const promisify = require('promisify-es6')
const InMemoryDataStore = require('interface-datastore').MemoryDatastore
const Ipld = require('ipld')
const inMemoryIpld = promisify(require('ipld-in-memory').bind(null, Ipld))

const createMfs = async () => {
  let ipld = await inMemoryIpld()
  let datastore = new InMemoryDataStore()

  const mfs = core({
    ipld,
    repo: {
      datastore
    },

    // https://github.com/Joris-van-der-Wel/karma-mocha-webworker/issues/4
    // There is no IPFS node running on the main thread so run it on the
    // worker along with the tests
    repoOwner: isWebWorker
  })

  // to allow tests to verify information
  mfs.ipld = {
    get: promisify(ipld.get.bind(ipld)),
    getMany: promisify(ipld.getMany.bind(ipld)),
    put: promisify(ipld.put.bind(ipld))
  }
  mfs.datastore = datastore

  return mfs
}

module.exports = {
  createMfs,
  cidAtPath: require('./cid-at-path'),
  collectLeafCids: require('./collect-leaf-cids'),
  createShard: require('./create-shard'),
  createShardedDirectory: require('./create-sharded-directory'),
  createTwoShards: require('./create-two-shards'),
  findTreeWithDepth: require('./find-tree-with-depth'),
  printTree: require('./print-tree'),
  EMPTY_DIRECTORY_HASH: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
  EMPTY_DIRECTORY_HASH_BASE32: 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
}
