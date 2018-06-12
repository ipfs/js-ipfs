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

const createMfs = promisify((cb) => {
  let node = ipfs.createNode({
    repo: path.join(os.tmpdir(), `ipfs-mfs-tests-${Math.random()}`)
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
  EMPTY_DIRECTORY_HASH: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
}
