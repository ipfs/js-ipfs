/* eslint-env mocha, browser */

import * as tests from 'interface-ipfs-core'
import { isNode } from 'ipfs-utils/src/env.js'
import { factory } from './utils/factory.js'
import * as ipfsClientModule from 'ipfs-client'

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core tests', function () {
  const commonFactory = factory({
    ipfsClientModule
  })

  tests.root(commonFactory, {
    skip: isNode
      ? []
      : [{
          name: 'should add with mtime as hrtime',
          reason: 'Not designed to run in the browser'
        }]
  })

  tests.bitswap(commonFactory)

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory)

  tests.dag(commonFactory)

  tests.dht(commonFactory)

  tests.files(factory(), {
    skip: isNode
      ? null
      : [{
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

  tests.miscellaneous(commonFactory, {
    skip: [
      {
        name: 'should include the ipfs-http-client version',
        reason: 'Value is added by the HTTP RPC API server which is not part of ipfs-core'
      }
    ]
  })

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

  tests.pin(commonFactory, {
    skip: [{
      name: '.pin.remote.service',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.add',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.ls',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.rm',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.rmAll',
      reason: 'Not implemented'
    }]
  })

  tests.ping(commonFactory)

  tests.pubsub(commonFactory, {
    skip: [
      ...(isNode
        ? []
        : [
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
