/* eslint-env mocha */
'use strict'

const Factory = require('../utils/ipfs-factory-daemon')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const os = require('os')

function off (tests) {
  describe('daemon off (directly to core)', () => {
    let thing = {}
    let repoPath

    before(function () {
      this.timeout(30 * 1000)
      repoPath = os.tmpdir() + '/ipfs-' + Math.random().toString().substring(2, 16)
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })

    after(function (done) {
      this.timeout(20 * 1000)
      clean(repoPath)
      setImmediate(done)
    })

    tests(thing)
  })
}

function on (tests) {
  describe('daemon on (through http-api)', () => {
    let factory
    let thing = {}

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(30 * 1000)

      factory = new Factory()

      factory.spawnNode((err, node) => {
        expect(err).to.not.exist()
        thing.ipfs = ipfsExec(node.repoPath)
        thing.ipfs.repoPath = node.repoPath
        done()
      })
    })

    after(function (done) {
      this.timeout(20 * 1000)
      factory.dismantle(done)
    })

    tests(thing)
  })
}

/*
 * CLI Utility to run the tests offline (daemon off) and online (daemon on)
 */
exports = module.exports = (tests) => {
  off(tests)
  on(tests)
}

exports.off = off
exports.on = on
