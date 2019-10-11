/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { isNode } = require('ipfs-utils/src/env')
const merge = require('merge-options')
const ctl = require('ipfsd-ctl')
const IPFS = require('../../src')

describe('interface-ipfs-core tests', function () {
  const commonOptions = {
    factoryOptions: {
      type: 'proc',
      exec: IPFS,
      IpfsClient: require('ipfs-http-client')
    }
  }
  const commonFactory = ctl.createTestsInterface(commonOptions)

  tests.bitswap(commonFactory, { skip: !isNode })

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
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software']
    }
  })))

  tests.miscellaneous(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software', '--offline']
    }
  })))

  tests.name(ctl.createTestsInterface(merge(commonOptions, {
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software', '--offline']
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

  tests.ping(commonFactory, {
    skip: isNode ? null : {
      reason: 'FIXME: ping implementation requires DHT'
    }
  })

  tests.pubsub(commonFactory, {
    skip: isNode ? null : {
      reason: 'FIXME: disabled because no swarm addresses'
    }
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory, { skip: !isNode })
})
