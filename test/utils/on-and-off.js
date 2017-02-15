/* eslint-env mocha */
'use strict'

const Factory = require('../utils/ipfs-factory-daemon')
const expect = require('chai').expect
const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const os = require('os')

function off (tests) {
  describe('daemon off (directly to core)', () => {
    let thing = {}
    let repoPath

    before(() => {
      repoPath = os.tmpdir() + '/ipfs-' + Math.random().toString().substring(2, 8)
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })

    after((done) => {
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
      this.timeout(20 * 1000)

      factory = new Factory()

      factory.spawnNode((err, node) => {
        expect(err).to.not.exist
        thing.ipfs = ipfsExec(node.repoPath)
        thing.ipfs.repoPath = node.repoPath
        done()
      })
    })

    after((done) => factory.dismantle(done))

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
