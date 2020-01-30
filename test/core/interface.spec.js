/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const { createFactory } = require('ipfsd-ctl')
const { isNode, isBrowser } = require('ipfs-utils/src/env')
const IPFS = require('../../src')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core tests', function () {
  /** @type ControllerOptions */
  const commonOptions = {
    test: true,
    type: 'proc',
    ipfsModule: {
      path: require.resolve('../../src'),
      ref: IPFS
    },
    ipfsHttpModule: {
      path: require.resolve('ipfs-http-client'),
      ref: require('ipfs-http-client')
    },
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software',
      ...(isBrowser ? {
        config: {
          Addresses: {
            Swarm: [
              '/ip4/127.0.0.1/tcp/14579/wss/p2p-webrtc-star'
            ]
          }
        }
      } : {})
    }
  }
  const overrides = {
    js: {
      ipfsBin: './src/cli/bin.js'
    }
  }
  const commonFactory = createFactory(commonOptions, overrides)

  tests.root(commonFactory, {
    skip: isNode ? null : [{
      name: 'should add with mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }]
  })

  tests.bitswap(commonFactory)

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory)

  tests.dag(commonFactory)

  tests.dht(commonFactory, {
    skip: {
      reason: 'TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994'
    }
  })

  tests.files(commonFactory, {
    skip: isNode ? null : [{
      name: 'should make directory and specify mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'should set mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'should write file and specify mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }]
  })

  tests.key(commonFactory)

  tests.miscellaneous(commonFactory)

  tests.name(createFactory(merge(commonOptions, {
    ipfsOptions: {
      offline: true
    }
  }), overrides))

  tests.namePubsub(createFactory(merge(commonOptions, {
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    }
  }), overrides))

  tests.object(commonFactory)

  tests.pin(commonFactory)

  tests.ping(commonFactory)

  tests.pubsub(createFactory(commonOptions, merge(overrides, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  })), {
    skip: isNode ? null : [
      {
        name: 'should receive messages from a different node',
        reason: 'https://github.com/ipfs/js-ipfs/issues/2662'
      },
      {
        name: 'should round trip a non-utf8 binary buffer',
        reason: 'https://github.com/ipfs/js-ipfs/issues/2662'
      },
      {
        name: 'should receive multiple messages',
        reason: 'https://github.com/ipfs/js-ipfs/issues/2662'
      },
      {
        name: 'should send/receive 100 messages',
        reason: 'https://github.com/ipfs/js-ipfs/issues/2662'
      }
    ]
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
