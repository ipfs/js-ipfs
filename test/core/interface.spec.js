/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')
const isNode = require('detect-node')

describe('interface-ipfs-core tests', function () {
  this.timeout(20 * 1000)

  const defaultCommonFactory = CommonFactory.create()

  tests.bitswap(defaultCommonFactory, { skip: !isNode })

  tests.block(defaultCommonFactory, {
    skip: [{
      name: 'rm',
      reason: 'Not implemented'
    }]
  })

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

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
    createTeardown: () => cb => cb(),
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software', '--offline']
    }
  }))

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
      initOptions: { bits: 512 }
    }
  }), {
    skip: isNode ? null : {
      reason: 'FIXME: disabled because no swarm addresses'
    }
  })

  tests.repo(defaultCommonFactory)

  tests.stats(defaultCommonFactory)

  tests.swarm(CommonFactory.createAsync(), { skip: !isNode })
})
