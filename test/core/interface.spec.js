/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const CommonFactory = require('../utils/interface-common-factory')
const isNode = require('detect-node')
const dnsFetchStub = require('../utils/dns-fetch-stub')

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

  tests.dht(CommonFactory.create({
    spawnOptions: {
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      },
      initOptions: { bits: 512 }
    }
  }), {
    skip: isNode ? [
      // dht.get
      {
        name: 'should get a value after it was put on another node',
        reason: 'Needs https://github.com/ipfs/interface-ipfs-core/pull/383'
      }
    ] : true
  })

  tests.filesRegular(defaultCommonFactory, {
    skip: isNode ? null : [{
      name: 'addFromStream',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'addFromFs',
      reason: 'Not designed to run in the browser'
    }, {
      name: 'addFromURL',
      reason: 'Not designed to run in the browser'
    }]
  })

  // TODO needs MFS module to be updated
  // tests.filesMFS(defaultCommonFactory)

  tests.key(CommonFactory.create({
    spawnOptions: {
      args: ['--pass ipfs-is-awesome-software'],
      initOptions: { bits: 512 }
    }
  }))

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
      initOptions: { bits: 512 }
    }
  }))

  tests.namePubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-namesys-pubsub'],
      initOptions: { bits: 1024 }
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
      initOptions: { bits: 512 }
    }
  }), {
    skip: isNode ? null : {
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
      return callback => {
        callback(null, {
          spawnNode (repoPath, config, cb) {
            if (typeof repoPath === 'function') {
              cb = repoPath
              repoPath = undefined
            }

            if (typeof config === 'function') {
              cb = config
              config = null
            }

            config = config || {
              Bootstrap: []
            }

            const spawnOptions = { repoPath, config, initOptions: { bits: 512 } }

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

  tests.types(defaultCommonFactory)

  tests.util(defaultCommonFactory, { skip: { reason: 'FIXME: currently failing' } })
})
