/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')

describe('interface-ipfs-core over ipfs-http-client tests', () => {
  const defaultCommonFactory = CommonFactory.create({
    factoryOptions: { exec: 'src/cli/bin.js' }
  })

  tests.bitswap(defaultCommonFactory)

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory, {
    skip: [{
      name: 'should get only a CID, due to resolving locally only',
      reason: 'Local resolve option is not implemented yet'
    }, {
      name: 'tree',
      reason: 'dag.tree is not implemented yet'
    }]
  })

  tests.dht(CommonFactory.create({
    spawnOptions: {
      initOptions: { bits: 512 },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }
  }), {
    skip: {
      reason: 'TODO: unskip when DHT is enabled in 0.36'
    }
  })

  tests.filesRegular(defaultCommonFactory)

  tests.filesMFS(defaultCommonFactory)

  tests.key(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software'],
      initOptions: { bits: 512 },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }
  }))

  tests.miscellaneous(CommonFactory.create({
    // No need to stop, because the test suite does a 'stop' test.
    createTeardown: () => cb => cb()
  }), {
    skip: [
      {
        name: 'should resolve an IPNS DNS link',
        reason: 'TODO: IPNS resolve not yet implemented https://github.com/ipfs/js-ipfs/issues/1918'
      },
      {
        name: 'should resolve IPNS link recursively',
        reason: 'TODO: IPNS resolve not yet implemented https://github.com/ipfs/js-ipfs/issues/1918'
      },
      {
        name: 'should recursively resolve ipfs.io',
        reason: 'TODO: ipfs.io dnslink=/ipns/website.ipfs.io & IPNS resolve not yet implemented https://github.com/ipfs/js-ipfs/issues/1918'
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

            config = config || {
              Bootstrap: [],
              Discovery: {
                MDNS: {
                  Enabled: false
                },
                webRTCStar: {
                  Enabled: false
                }
              }
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
