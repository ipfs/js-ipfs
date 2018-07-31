'use strict'

const ipfs = require('ipfs')
const path = require('path')
const os = require('os')
const promisify = require('promisify-es6')
const {
  race,
  waterfall
} = require('async')
const core = require('../../src/core')
const isWebWorker = require('detect-webworker')

const createMfs = promisify((cb) => {
  let node = ipfs.createNode({
    repo: path.join(os.tmpdir(), `ipfs-mfs-tests-${Math.random()}`),
    mfs: {
      // https://github.com/Joris-van-der-Wel/karma-mocha-webworker/issues/4
      // There is no IPFS node running on the main thread so run it on the
      // worker along with the tests
      repoOwner: isWebWorker
    }
  })

  waterfall([
    (done) => race([
      (next) => node.once('error', next),
      (next) => node.once('ready', next)
    ], (error) => done(error, node)),
    (node, done) => {
      const mfs = core(node)
      mfs.node = node

      done(null, mfs)
    }
  ], cb)
})

module.exports = {
  createMfs,
  collectLeafCids: require('./collect-leaf-cids'),
  EMPTY_DIRECTORY_HASH: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
  EMPTY_DIRECTORY_HASH_BASE32: 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354'
}
