/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { isNode } = require('ipfs-utils/src/env')
const merge = require('merge-options')
const ctl = require('ipfsd-ctl')
const IPFS = require('../../src')

/** @ignore @typedef { import("ipfsd-ctl").FactoryOptions } FactoryOptions */

describe('interface-ipfs-core tests', function () {
  /** @type FactoryOptions */
  const commonOptions = {
    type: 'proc',
    ipfsApi: {
      path: require.resolve('../../src'),
      ref: IPFS
    },
    ipfsHttp: {
      path: require.resolve('ipfs-http-client'),
      ref: require('ipfs-http-client')
    },
    ipfsBin: './src/cli/bin.js'
  }
  const commonFactory = ctl.createTestsInterface(commonOptions)

  tests.bitswap(commonFactory, {
    skip: [
      {
        name: 'should get the wantlist by peer ID for a diffreent node',
        reason: 'TODO: find the reason'
      }
    ]
  })

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory)

  tests.dag(commonFactory)

  tests.dht(commonFactory, {
    skip: {
      reason: 'TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994'
    }
  })

  tests.filesRegular(commonFactory, {
    skip: isNode ? null : [{
      name: 'addFromStream',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'addFromFs',
      reason: 'Not designed to run in the browser'
    }]
  })

  tests.filesMFS(commonFactory)

  tests.key(ctl.createTestsInterface(merge(commonOptions, {
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software'
    }
  })))

  tests.miscellaneous(ctl.createTestsInterface(merge(commonOptions, {
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software'
    }
  })))

  tests.name(ctl.createTestsInterface(merge(commonOptions, {
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software',
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
