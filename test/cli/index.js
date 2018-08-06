/* eslint-env mocha */
'use strict'

const fs = require('fs')
const hat = require('hat')
const os = require('os')

const ipfsExec = require('../utils/ipfs-exec')

describe('cli', () => {
  const tests = []
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'index.js')
    .filter((file) => file === 'version.js')
  // .filter((file) => file === 'files.js' || file === 'block.js' || file === 'bitswap.js')
    .forEach((file) => {
      console.log('Gonna run tests for ' + file)
      tests.push(require('./' + file))
    })
  describe('with daemon offline', () => {
    let thing = {}
    before(() => {
      const repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })
    tests.forEach((t) => {
      console.log(t.part)
    })
    tests.forEach(t => {
      if (t.part === 'offline' || !t.part) {
        t(thing)
      }
    })
  })
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
      this.timeout(1000 * 10)
      this.timeout = 10000
      return thing.ipfs('shutdown')
    })
    tests.forEach(t => {
      if (t.part === 'online' || !t.part) {
        t(thing)
      }
    })
  })
})
// /* eslint-env mocha */
// 'use strict'
//
// const fs = require('fs')
//
// describe('cli', () => {
//   fs.readdirSync(__dirname)
//     .filter((file) => file !== 'index.js')
//     .forEach((file) => require('./' + file))
// })
