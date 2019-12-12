/* eslint-env mocha */
'use strict'

const hat = require('hat')

const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const factory = require('./factory')
const os = require('os')

const origLocale = process.env.LC_ALL

function off (tests) {
  describe('daemon off (directly to core)', function () {
    this.timeout(60 * 1000)
    const thing = {
      off: true
    }
    let repoPath

    before(function () {
      setLocaleToEnglish()
      this.timeout(60 * 1000)

      repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath

      return thing.ipfs('init')
    })

    after(async function () {
      resetLocaleToSystem()
      this.timeout(20 * 1000)
      await clean(repoPath)
    })

    tests(thing)
  })
}

function on (tests) {
  describe('daemon on (through http-api)', function () {
    this.timeout(60 * 1000)
    const df = factory({ type: 'js' })
    const thing = {
      on: true
    }

    let ipfsd
    before(async function () {
      setLocaleToEnglish()

      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(60 * 1000)

      ipfsd = await df.spawn()
      thing.ipfs = ipfsExec(ipfsd.path)
      thing.ipfs.repoPath = ipfsd.path
    })

    after(function () {
      resetLocaleToSystem()
      df.clean()
    })

    tests(thing)
  })
}

function setLocaleToEnglish () {
  Object.assign(process.env, {
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US.UTF-8',
    LC_CTYPE: 'en_US.UTF-8',
    LC_NUMERIC: 'en_US.UTF-8',
    LC_TIME: 'en_US.UTF-8',
    LC_COLLATE: 'en_US.UTF-8',
    LC_MONETARY: 'en_US.UTF-8',
    LC_MESSAGES: 'en_US.UTF-8',
    LC_PAPER: 'en_US.UTF-8',
    LC_NAME: 'en_US.UTF-8',
    LC_ADDRESS: 'en_US.UTF-8',
    LC_TELEPHONE: 'en_US.UTF-8',
    LC_MEASUREMENT: 'en_US.UTF-8',
    LC_IDENTIFICATION: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8'
  })
}

function resetLocaleToSystem () {
  Object.assign(process.env, {
    LANG: origLocale,
    LANGUAGE: origLocale,
    LC_CTYPE: origLocale,
    LC_NUMERIC: origLocale,
    LC_TIME: origLocale,
    LC_COLLATE: origLocale,
    LC_MONETARY: origLocale,
    LC_MESSAGES: origLocale,
    LC_PAPER: origLocale,
    LC_NAME: origLocale,
    LC_ADDRESS: origLocale,
    LC_TELEPHONE: origLocale,
    LC_MEASUREMENT: origLocale,
    LC_IDENTIFICATION: origLocale,
    LC_ALL: origLocale
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
