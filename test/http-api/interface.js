/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')

describe('interface-ipfs-core over ipfs-api tests', () => {
  const defaultCommonFactory = CommonFactory.create({
    factoryOptions: { exec: 'src/cli/bin.js' }
  })

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory, { skip: true })

  tests.dht(defaultCommonFactory, { skip: true })

  tests.files(defaultCommonFactory)

  tests.generic(defaultCommonFactory, { skip: true })

  tests.key(CommonFactory.create({
    spawnOptions: {
      args: ['--pass', 'ipfs-is-awesome-software'],
      initOptions: { bits: 512 }
    }
  }))

  tests.object(defaultCommonFactory)

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 512 }
    }
  }))

  tests.stats(defaultCommonFactory, { skip: true })

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
})
