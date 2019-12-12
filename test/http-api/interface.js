/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const { isNode } = require('ipfs-utils/src/env')
const { createFactory } = require('ipfsd-ctl')
const IPFS = require('../../src')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core over ipfs-http-client tests', function () {
  this.timeout(20000)
  /** @type ControllerOptions */
  const commonOptions = {
    test: true,
    type: 'js',
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

  tests.key(commonFactory)

  tests.miscellaneous(commonFactory)

  tests.name(createFactory(merge(commonOptions, {
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software',
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

  tests.pubsub(createFactory(commonOptions, merge(overrides, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  })))

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
