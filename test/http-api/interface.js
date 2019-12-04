/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const ctl = require('ipfsd-ctl')
const IPFS = require('../../src')

/** @ignore @typedef { import("ipfsd-ctl").FactoryOptions } FactoryOptions */

describe('interface-ipfs-core over ipfs-http-client tests', function () {
  this.timeout(20000)
  /** @type FactoryOptions */
  const commonOptions = {
    type: 'js',
    ipfsApi: {
      path: require.resolve('../../src'),
      ref: IPFS
    },
    ipfsHttp: {
      path: require.resolve('ipfs-http-client'),
      ref: require('ipfs-http-client')
    },
    ipfsBin: './src/cli/bin.js',
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software'
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

  tests.key(commonFactory)

  tests.miscellaneous(commonFactory)

  tests.name(ctl.createTestsInterface(merge(commonOptions, {
    ipfsOptions: {
      offline: true
    }
  })))

  tests.namePubsub(ctl.createTestsInterface(merge(commonOptions, {
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
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
