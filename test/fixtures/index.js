'use strict'

const ipfs = require('ipfs')
const path = require('path')
const os = require('os')
const promisify = require('promisify-es6')
const {
  race,
  waterfall
} = require('async')
const {
  ls,
  mkdir
} = require('../../src/core')

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
      done(null, {
        ls: ls(node),
        mkdir: mkdir(node),
        node: node
      })
    }
  ], cb)
})

module.exports = {
  createMfs
}
