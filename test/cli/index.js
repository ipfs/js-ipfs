/* eslint-env mocha */
'use strict'

const fs = require('fs')
const hat = require('hat')
const os = require('os')

const ipfsExec = require('../utils/ipfs-exec')

require('clarify')
require('trace')

// Tests can have a `.part` property that decides when tests gets run
// `offline` => only offline
// `online` => only online
// `standalone` => doesn't do anything, just run the tests

describe('cli', () => {
  const tests = {
    offline: [],
    online: [],
    standalone: []
  }
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'index.js')
  // .filter((file) => file === 'bitswap.js')
    .forEach((file) => {
      const t = require('./' + file)
      if (typeof t !== 'function') {
        throw new Error(`Test loaded from ${file} was not a function. Make sure you are exporting the describe-suite`)
      }
      if (t.part === 'standalone') {
        tests.standalone.push(t)
        return
      }
      if (!t.part) {
        tests.online.push(t)
        tests.offline.push(t)
        return
      }
      if (t.part === 'online') {
        tests.online.push(t)
      }
      if (t.part === 'offline') {
        tests.offline.push(t)
      }
    })
  let didTestsRun
  describe('with daemon online', () => {
    let thing = {}
    before(() => {
      const repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init').then(() => {
        return thing.ipfs('daemon')
      })
    })
    after(function cliAfterDaemonOnline () {
      this.timeout(1000 * 100)
      this.timeout = 1000 * 100
      return thing.ipfs('shutdown')
    })
    tests.online.forEach(t => {
      didTestsRun = true
      t(thing)
    })
  })
  describe('with daemon offline', () => {
    let thing = {}
    before(() => {
      console.log('before is running')
      const repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })
    tests.offline.forEach(t => {
      didTestsRun = true
      t(thing)
    })
  })
  describe('standalone cli tests', () => {
    tests.standalone.forEach(t => {
      didTestsRun = true
      t()
    })
  })
  if (!didTestsRun) {
    console.log('WARNING: Seems like no tests were run. Make sure the `part` property is correctly set')
  }
})
