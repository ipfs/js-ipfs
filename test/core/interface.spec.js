/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')
const isNode = require('detect-node')
const dnsFetchStub = require('../utils/dns-fetch-stub')

const reusableKey = require('../utils/keys/2.js')

describe('interface-ipfs-core tests', () => {
  // ipfs.dns in the browser calls out to https://ipfs.io/api/v0/dns.
  // The following code stubs self.fetch to return a static CID for calls
  // to https://ipfs.io/api/v0/dns?arg=ipfs.io.
  if (!isNode) {
    const fetch = self.fetch

    before(() => {
      self.fetch = dnsFetchStub(fetch)
    })

    after(() => {
      self.fetch = fetch
    })
  }

  const defaultCommonFactory = CommonFactory.create()

  tests.bitswap(defaultCommonFactory, { skip: !isNode })

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory)

  tests.dag(defaultCommonFactory)

  tests.dht(defaultCommonFactory, {
    skip: { reason: 'TODO: DHT is not implemented in js-ipfs yet!' }
  })

  tests.files(defaultCommonFactory)

  tests.key(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software'],
      initOptions: { privateKey: reusableKey }
    }
  }))

  tests.ls(defaultCommonFactory)

  tests.miscellaneous(CommonFactory.create({
    // No need to stop, because the test suite does a 'stop' test.
    createTeardown: () => cb => cb()
  }), {
    skip: [
      {
        name: 'should resolve an IPNS DNS link',
        reason: 'TODO IPNS not implemented yet'
      },
      {
        name: 'should resolve IPNS link recursively',
        reason: 'TODO IPNS not implemented yet'
      }
    ]
  })

  tests.name(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software'],
      initOptions: { privateKey: reusableKey }
    }
  }))

  tests.object(defaultCommonFactory)

  tests.pin(defaultCommonFactory)

  tests.ping(defaultCommonFactory, {
    skip: isNode ? null : {
      reason: 'FIXME: ping implementation requires DHT'
    }
  })

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { privateKey: reusableKey }
    }
  }), {
    skip: isNode ? [
      {
        name: 'should receive messages from a different node',
        reason: 'Currently dont work well when running the entire suite'
      },
      {
        name: 'should round trip a non-utf8 binary buffer',
        reason: 'Currently dont work well when running the entire suite'
      },
      {
        name: 'should receive multiple messages',
        reason: 'Currently dont work well when running the entire suite'
      },
      {
        name: 'send/receive 100 messages',
        reason: 'Currently dont work well when running the entire suite'
      }
    ] : {
      reason: 'FIXME: disabled because no swarm addresses'
    }
  })

  tests.repo(defaultCommonFactory, {
    skip: [
      // repo.gc
      {
        name: 'gc',
        reason: 'TODO: repo.gc is not implemented in js-ipfs yet!'
      }
    ]
  })

  tests.stats(defaultCommonFactory)

  tests.swarm(CommonFactory.create({
    createSetup ({ ipfsFactory, nodes }) {
      let howManyTimesCalled = 0
      return callback => {
        callback(null, {
          spawnNode (repoPath, config, cb) {
            howManyTimesCalled = howManyTimesCalled + 1
            if (typeof repoPath === 'function') {
              cb = repoPath
              repoPath = undefined
            }

            if (typeof config === 'function') {
              cb = config
              config = undefined
            }
            const keyToUse = require(`../utils/keys/${howManyTimesCalled}.js`)

            const spawnOptions = { repoPath, config, initOptions: { privateKey: keyToUse } }

            ipfsFactory.spawn(spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, _ipfsd.api)
            })
          }
        })
      }
    }
  }), { skip: !isNode })

  tests.types(defaultCommonFactory, { skip: { reason: 'FIXME: currently failing' } })

  tests.util(defaultCommonFactory, { skip: { reason: 'FIXME: currently failing' } })
})
