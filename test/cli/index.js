/* eslint-env mocha */
'use strict'

const fs = require('fs')
const hat = require('hat')
const os = require('os')

const ipfsExec = require('../utils/ipfs-exec')

// Tests can have a `.part` property that decides when tests gets run
// `offline` => only offline
// `online` => only online
// `standalone` => doesn't do anything, just run the tests

/*
- [ ] bitswap.js
- [ ] block.js
- [ ] bootstrap.js
- [ ] commands.js
- [ ] config.js
- [ ] daemon.js
- [ ] dag.js
- [ ] dns.js
- [ ] file.js
- [ ] files.js
- [ ] general.js
- [ ] id.js
- [ ] index.js
- [ ] init.js
- [X] key.js
- [X] ls.js
- [X] object.js
- [X] pin.js
- [X] ping.js
- [X] progress-bar.js
- [ ] pubsub.js
- [X] repo.js
- [X] swarm.js
- [X] version.js
*/

describe('cli', () => {
  const tests = []
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'index.js')
  // .filter((file) => file === 'daemon.js')
    .forEach((file) => {
      console.log('Gonna run tests for ' + file)
      const t = require('./' + file)
      if (typeof t !== 'function') {
        throw new Error(`Test loaded from ${file} was not a function. Make sure you are exporting the describe-suite`)
      }
      tests.push(t)
    })
  let didTestsRun
  describe('with daemon offline', () => {
    let thing = {}
    before(() => {
      const repoPath = os.tmpdir() + '/ipfs-' + hat()
      thing.ipfs = ipfsExec(repoPath)
      thing.ipfs.repoPath = repoPath
      return thing.ipfs('init')
    })
    tests.forEach(t => {
      if (t.part === 'offline' || !t.part) {
        didTestsRun = true
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
        didTestsRun = true
        t(thing)
      }
    })
  })
  describe('standalone cli tests', () => {
    tests.forEach(t => {
      if (t.part === 'standalone') {
        didTestsRun = true
        t()
      }
    })
  })
  if (!didTestsRun) {
    console.log('WARNING: Seems like no tests were run. Make sure the `part` property is correctly set')
  }
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
