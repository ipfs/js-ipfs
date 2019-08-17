/* eslint-env mocha */
'use strict'

const hat = require('hat')

const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const os = require('os')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()
const path = require('path')

function off (tests) {
  describe('daemon off (directly to core)', function () {
    this.timeout(60 * 1000)
    const thing = {}
    let repoPath

    before(function () {
      this.timeout(60 * 1000)

      repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })

    after(function () {
      this.timeout(20 * 1000)
      return clean(repoPath)
    })

    tests(thing)
  })
}

function on (tests) {
  describe('daemon on (through http-api)', function () {
    this.timeout(60 * 1000)
    const thing = {}

    let ipfsd
    before(async function () {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(60 * 1000)

      ipfsd = await df.spawn({
        type: 'js',
        exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
        initOptions: { bits: 512 },
        config: { Bootstrap: [] }
      })
      thing.ipfs = ipfsExec(ipfsd.repoPath)
      thing.ipfs.repoPath = ipfsd.repoPath
    })

    after(function () {
      if (ipfsd) {
        this.timeout(15 * 1000)
        return ipfsd.stop()
      }
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
