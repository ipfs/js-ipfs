/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const { createFactory } = require('ipfsd-ctl')
const IPFS = require('../../src')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core over ipfs-http-client tests', function () {
  this.timeout(20000)
  /** @type ControllerOptions */
  const commonOptions = {
    test: true,
    type: 'js',
    ipfsModule: IPFS,
    ipfsHttpModule: require('ipfs-http-client'),
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

  tests.root(commonFactory)

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

  tests.files(commonFactory, {
    skip: [
      {
        name: 'should make directory and specify mtime as hrtime',
        reason: 'FIXME: use kebab case in joi validation'
      },
      {
        name: 'should respect metadata when copying directories',
        reason: 'FIXME: use kebab case in joi validation'
      },
      {
        name: 'should stat sharded dir with mode',
        reason: 'FIXME: expected: hamt-sharded-directory, actual: directory'
      },
      {
        name: 'should stat sharded dir with mtime',
        reason: 'FIXME: expected: hamt-sharded-directory, actual: directory'
      },
      {
        name: 'should set mtime as hrtime',
        reason: 'FIXME: use kebab case in joi validation'
      }
    ]
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

  tests.pubsub(createFactory(commonOptions, merge(overrides, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  })))

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
