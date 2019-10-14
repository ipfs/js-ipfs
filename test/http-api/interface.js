/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const path = require('path')
const merge = require('merge-options')
const ctl = require('ipfsd-ctl')

describe('interface-ipfs-core over ipfs-http-client tests', function () {
  this.timeout(20000)
  const commonOptions = {
    factoryOptions: {
      type: 'js',
      exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
      IpfsClient: require('ipfs-http-client')
    }
  }
  const commonFactory = ctl.createTestsInterface(commonOptions)

  tests.bitswap(commonFactory)

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory)

  tests.dag(commonFactory, {
    skip: [{
      name: 'should get only a CID, due to resolving locally only',
      reason: 'Local resolve option is not implemented yet'
    }, {
      name: 'tree',
      reason: 'dag.tree is not implemented yet'
    }]
  })

  tests.dht(commonFactory, {
    skip: {
      reason: 'TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994'
    }
  })

  tests.filesRegular(commonFactory)

  tests.filesMFS(commonFactory)

  tests.key(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--pass', 'ipfs-is-awesome-software'],
      initOptions: { bits: 512 }
    }
  })))

  tests.miscellaneous(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--pass', 'ipfs-is-awesome-software', '--offline']
    }
  })))

  tests.name(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--pass', 'ipfs-is-awesome-software', '--offline']
    }
  })))

  tests.namePubsub(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--enable-namesys-pubsub']
    }
  })))

  tests.object(commonFactory, {
    skip: [
      {
        name: 'should respect timeout option',
        reason: 'js-ipfs doesn\'t support timeout yet'
      }
    ]
  })

  tests.pin(commonFactory)

  tests.ping(commonFactory)

  tests.pubsub(commonFactory)

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
