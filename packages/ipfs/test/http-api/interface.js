/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const factory = require('../utils/factory')
const { isNode, isBrowser } = require('ipfs-utils/src/env')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core over ipfs-http-client tests', function () {
  this.timeout(20000)

  const commonFactory = factory({
    type: 'js',
    ipfsBin: './src/cli/bin.js',
    ipfsModule: false
  })

  tests.root(commonFactory, {
    skip: isNode ? [{
      name: 'should fail when passed invalid input',
      reason: 'node-fetch cannot detect errors in streaming bodies - https://github.com/node-fetch/node-fetch/issues/753'
    }, {
      name: 'should not add from an invalid url',
      reason: 'node-fetch cannot detect errors in streaming bodies - https://github.com/node-fetch/node-fetch/issues/753'
    }] : [{
      name: 'should add with mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }]
  })

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

  tests.files(factory({
    type: 'js',
    ipfsBin: './src/cli/bin.js',
    ipfsOptions: {
      EXPERIMENTAL: {
        sharding: true
      }
    }
  }), {
    skip: isBrowser ? [{
      name: 'should make directory and specify mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'should write file and specify mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'should set mtime as hrtime',
      reason: 'Not designed to run in the browser'
    }] : []
  })

  tests.key(commonFactory)

  tests.miscellaneous(commonFactory)

  tests.name(factory({
    ipfsOptions: {
      offline: true
    }
  }))

  tests.namePubsub(factory({
    type: 'js',
    ipfsBin: './src/cli/bin.js',
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    }
  }))

  tests.object(commonFactory)

  tests.pin(commonFactory, {
    skip: [{
      name: 'should throw an error on missing direct pins for existing path',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }, {
      name: 'should throw an error on missing link for a specific path',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }]
  })

  tests.ping(commonFactory, {
    skip: [{
      name: 'should fail when pinging a peer that is not available',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }]
  })

  tests.pubsub(factory(
    {
      type: 'js',
      ipfsBin: './src/cli/bin.js'
    },
    {
      go: {
        args: ['--enable-pubsub-experiment']
      }
    }
  ))

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
