/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')

describe('interface-ipfs-core over ipfs-api tests', () => {
  const defaultCommonFactory = CommonFactory.create({
    factoryOptions: { exec: 'src/cli/bin.js' }
  })

  tests.bitswap(defaultCommonFactory)

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory, { skip: true })

  tests.dht(defaultCommonFactory, { skip: true })

  tests.files(defaultCommonFactory, {
    skip: [
      // TODO: MFS is not implemented in js-ipfs yet!
      'cp',
      'mkdir',
      'stat',
      'rm',
      'read',
      'readReadableStream',
      'readPullStream',
      'write',
      'mv',
      'flush',
      'ls'
    ]
  })

  tests.key(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software'],
      initOptions: { bits: 512 }
    }
  }))

  tests.miscellaneous(CommonFactory.create({
    // No need to stop, because the test suite does a 'stop' test.
    createTeardown: () => cb => cb()
  }))

  tests.object(defaultCommonFactory)

  // TODO: pin is not implemented in js-ipfs yet!
  tests.pin(defaultCommonFactory, { skip: true })

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 512 }
    }
  }))

  tests.repo(defaultCommonFactory, {
    skip: [
      // repo.gc
      // TODO: repo.gc is not implemented in js-ipfs yet!
      'gc'
    ]
  })

  tests.stats(defaultCommonFactory)

  tests.swarm(CommonFactory.create({
    createSetup ({ ipfsFactory, nodes }) {
      return callback => {
        callback(null, {
          spawnNode (repoPath, config, cb) {
            if (typeof repoPath === 'function') {
              cb = repoPath
              repoPath = undefined
            }

            if (typeof config === 'function') {
              cb = config
              config = undefined
            }

            const spawnOptions = { repoPath, config, initOptions: { bits: 512 } }

            ipfsFactory.spawn(spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, _ipfsd.api)
            })
          }
        })
      }
    }
  }))

  // FIXME: currently failing
  tests.types(defaultCommonFactory, { skip: true })

  // FIXME: currently failing
  tests.util(defaultCommonFactory, { skip: true })
})
