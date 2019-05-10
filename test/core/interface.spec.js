/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')
const isNode = require('detect-node')

describe('interface-ipfs-core tests', function () {
  this.timeout(20 * 1000)

  const defaultCommonFactory = CommonFactory.create()

  tests.bitswap(defaultCommonFactory, { skip: !isNode })

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory, {
    skip: [
      {
        name: 'should set a number',
        reason: 'Failing - needs to be fixed'
      },
      {
        name: 'should output changes but not save them for dry run',
        reason: 'TODO unskip when https://github.com/ipfs/js-ipfs/pull/2165 is merged'
      },
      {
        name: 'should set a config profile',
        reason: 'TODO unskip when https://github.com/ipfs/js-ipfs/pull/2165 is merged'
      }
    ]
  })

  tests.dag(defaultCommonFactory)

  tests.dht(CommonFactory.create({
    spawnOptions: {
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
      },
      initOptions: { bits: 512 }
    }
  }), {
    skip: {
      reason: 'TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994'
    }
  })

  tests.filesRegular(defaultCommonFactory, {
    skip: isNode ? null : [{
      name: 'addFromStream',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'addFromFs',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'addFromURL',
      reason: 'Not designed to run in the browser'
    }]
  })

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
      }
    ]
  })

  tests.name(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software', '--offline']
    }
  }))

  tests.namePubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-namesys-pubsub'],
      initOptions: { bits: 1024 },
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

  tests.object(defaultCommonFactory, {
    skip: [
      {
        name: 'should respect timeout option',
        reason: 'js-ipfs doesn\'t support timeout yet'
      }
    ]
  })

  tests.pin(defaultCommonFactory)

  tests.ping(defaultCommonFactory, {
    skip: isNode ? null : {
      reason: 'FIXME: ping implementation requires DHT'
    }
  })

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 512 }
    }
  }), {
    skip: isNode ? null : {
      reason: 'FIXME: disabled because no swarm addresses'
    }
  })

  tests.repo(defaultCommonFactory)

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
              config = null
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
  }), { skip: !isNode })
})
