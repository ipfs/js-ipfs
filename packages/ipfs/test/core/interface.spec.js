/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { isNode } = require('ipfs-utils/src/env')
const factory = require('../utils/factory')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core tests', function () {
  const commonFactory = factory()

  tests.root(commonFactory, {
    skip: isNode ? [] : [{
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

  tests.files(factory({
    ipfsOptions: { EXPERIMENTAL: { sharding: true } }
  }), {
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

  tests.name(factory({
    ipfsOptions: {
      offline: true
    }
  }))

  tests.namePubsub(factory({
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    }
  }))

  tests.object(commonFactory)

  tests.pin(commonFactory)

  tests.ping(commonFactory)

  tests.pubsub(factory({}, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  }), {
    skip: [
      ...(isNode ? [] : [
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
        }])
    ]
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
