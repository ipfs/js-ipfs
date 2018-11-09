/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const os = require('os')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

function off (tests) {
  describe('daemon off (directly to core)', () => {
    let thing = {}
    let repoPath

    before(function () {
      this.timeout(60 * 1000)

      repoPath = os.tmpdir() + '/ipfs-' + hat()
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
    let thing = {}

    let ipfsd
    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(60 * 1000)

      df.spawn({
        type: 'js',
        exec: `./src/cli/bin.js`,
        initOptions: { bits: 512 },
        config: { Bootstrap: [] }
      }, (err, node) => {
        expect(err).to.not.exist()
        ipfsd = node
        thing.ipfs = ipfsExec(node.repoPath)
        thing.ipfs.repoPath = node.repoPath
        done()
      })
    })

    after(function (done) {
      this.timeout(15 * 1000)
      ipfsd.stop(done)
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
