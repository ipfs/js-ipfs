/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')
const path = require('path')

describe('interface-ipfs-core over ipfs-http-client tests', () => {
  const defaultCommonFactory = CommonFactory.create({
    factoryOptions: { exec: path.resolve(`${__dirname}/../../src/cli/bin.js`) }
  })

  tests.bitswap(defaultCommonFactory)

  tests.block(defaultCommonFactory, {
    skip: [{
      name: 'rm',
      reason: 'Not implemented'
    }]
  })

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
      },
      preload: { enabled: false }
    }
  }), {
    skip: {
      reason: 'TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994'
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
      },
      preload: { enabled: false }
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

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      initOptions: { bits: 512 }
    }
  }))

  tests.repo(defaultCommonFactory)

  tests.stats(defaultCommonFactory)

  tests.swarm(CommonFactory.createAsync())
})
