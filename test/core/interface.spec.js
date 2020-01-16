/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const { createFactory } = require('ipfsd-ctl')
const { isNode } = require('ipfs-utils/src/env')
const set = require('just-safe-set')
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
      pass: 'ipfs-is-awesome-software'
    }
  }
  const overrides = {
    js: {
      ipfsBin: './src/cli/bin.js'
    }
  }
  const commonFactory = createFactory(commonOptions, overrides)

  const _spawn = commonFactory.spawn.bind(commonFactory)
  commonFactory.spawn = options => {
    options = options || {}

    if (options.type === 'js') {
      // FIXME Do not use the test profile for this remote node so we can connect
      // to it from the browser. ipfsd-ctl adds WebSockets as the 1 and only
      // swarm address but using a profile removes it.
      // FIXME use [] when resolved: https://github.com/ipfs/js-ipfsd-ctl/pull/433
      set(options, 'ipfsOptions.init.profiles', null)
    }

    return _spawn(options)
  }

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
    skip: [
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
