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

  tests.dag(defaultCommonFactory, {
    skip: { reason: 'TODO: DAG HTTP endpoints not implemented in js-ipfs yet!' }
  })

  tests.dht(defaultCommonFactory, {
    skip: { reason: 'TODO: DHT is not implemented in js-ipfs yet!' }
  })

  tests.files(defaultCommonFactory, {
    skip: [
      // files.ls
      {
        name: 'should ls directory',
        reason: 'FIXME: https://github.com/ipfs/js-ipfs-mfs/issues/7'
      },
      {
        name: 'should ls -l directory',
        reason: 'FIXME: https://github.com/ipfs/js-ipfs-mfs/issues/7'
      },
      // files.read*Stream
      {
        name: 'readPullStream',
        reason: 'FIXME: https://github.com/ipfs/js-ipfs-mfs/issues/8'
      },
      {
        name: 'readReadableStream',
        reason: 'FIXME: https://github.com/ipfs/js-ipfs-mfs/issues/8'
      }
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
  }), {
    skip: [
      {
        name: 'resolve',
        reason: 'TODO: not implemented'
      }
    ]
  })

  tests.object(defaultCommonFactory)

  tests.pin(defaultCommonFactory)

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
      {
        name: 'gc',
        reason: 'TODO: repo.gc is not implemented in js-ipfs yet!'
      }
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

  tests.types(defaultCommonFactory, { skip: { reason: 'FIXME: currently failing' } })

  tests.util(defaultCommonFactory, { skip: { reason: 'FIXME: currently failing' } })
})
