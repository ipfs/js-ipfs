/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const isNode = require('detect-node')
const CommonFactory = require('./utils/interface-common-factory')
const IPFSApi = require('../src')
const isWindows = process.platform && process.platform === 'win32'

describe('interface-ipfs-core tests', () => {
  const defaultCommonFactory = CommonFactory.create()

  tests.bitswap(defaultCommonFactory, {
    skip: [
      // bitswap.stat
      {
        name: 'should not get bitswap stats when offline',
        reason: 'FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078'
      },
      // bitswap.wantlist
      {
        name: 'should not get the wantlist when offline',
        reason: 'FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078'
      },
      // bitswap.unwant
      {
        name: 'should remove a key from the wantlist',
        reason: 'FIXME why is this skipped?'
      },
      {
        name: 'should not remove a key from the wantlist when offline',
        reason: 'FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078'
      }
    ]
  })

  tests.block(defaultCommonFactory)

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory, {
    skip: [
      // config.replace
      {
        name: 'replace',
        reason: 'FIXME Waiting for fix on go-ipfs https://github.com/ipfs/js-ipfs-api/pull/307#discussion_r69281789 and https://github.com/ipfs/go-ipfs/issues/2927'
      }
    ]
  })

  tests.dag(defaultCommonFactory, {
    skip: [
      // dag.tree
      {
        name: 'tree',
        reason: 'TODO vmx 2018-02-22: Currently the tree API is not exposed in go-ipfs'
      },
      // dag.get:
      {
        name: 'should get a dag-pb node local value',
        reason: 'FIXME vmx 2018-02-22: Currently not supported in go-ipfs, it might be possible once https://github.com/ipfs/go-ipfs/issues/4728 is done'
      },
      {
        name: 'should get dag-pb value via dag-cbor node',
        reason: 'FIXME vmx 2018-02-22: Currently not supported in go-ipfs, it might be possible once https://github.com/ipfs/go-ipfs/issues/4728 is done'
      },
      {
        name: 'should get by CID string + path',
        reason: 'FIXME vmx 2018-02-22: Currently not supported in go-ipfs, it might be possible once https://github.com/ipfs/go-ipfs/issues/4728 is done'
      }
    ]
  })

  tests.dht(defaultCommonFactory, {
    skip: [
      // dht.findpeer
      {
        name: 'should fail to find other peer if peer does not exist',
        reason: 'FIXME checking what is exactly go-ipfs returning https://github.com/ipfs/go-ipfs/issues/3862#issuecomment-294168090'
      },
      // dht.findprovs
      {
        name: 'should provide from one node and find it through another node',
        reason: 'FIXME go-ipfs endpoint doesn\'t conform with the others https://github.com/ipfs/go-ipfs/issues/5047'
      },
      // dht.get
      {
        name: 'should get a value after it was put on another node',
        reason: 'FIXME go-ipfs errors with  Error: key was not found (type 6) https://github.com/ipfs/go-ipfs/issues/3862'
      }
    ]
  })

  tests.files(defaultCommonFactory, {
    skip: [
      // files.add
      isNode ? null : {
        name: 'should add a nested directory as array of tupples',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      isNode ? null : {
        name: 'should add a nested directory as array of tupples with progress',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      // files.addPullStream
      isNode ? null : {
        name: 'should add pull stream of valid files and dirs',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      // files.addReadableStream
      isNode ? null : {
        name: 'should add readable stream of valid files and dirs',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      // files.catPullStream
      {
        name: 'should export a chunk of a file',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should export a chunk of a file in a Pull Stream',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should export a chunk of a file in a Readable Stream',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      // files.get
      isNode ? null : {
        name: 'should get a directory',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      }
    ]
  })

  tests.key(defaultCommonFactory, {
    skip: [
      // key.export
      {
        name: 'export',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      // key.import
      {
        name: 'import',
        reason: 'TODO not implemented in go-ipfs yet'
      }
    ]
  })

  tests.ls(defaultCommonFactory, {
    skip: [
      // lsPullStream
      isNode ? null : {
        name: 'should pull stream ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      // lsReadableStream
      isNode ? null : {
        name: 'should readable stream ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      },
      // ls
      isNode ? null : {
        name: 'should ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-api/issues/339'
      }
    ]
  })

  tests.miscellaneous(defaultCommonFactory, {
    skip: [
      // stop
      {
        name: 'should stop the node',
        reason: 'FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078'
      }
    ]
  })

  tests.object(defaultCommonFactory)

  tests.pin(defaultCommonFactory)

  tests.ping(defaultCommonFactory)

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 1024 }
    }
  }), {
    skip: isNode ? [
      // pubsub.subscribe
      isWindows ? {
        name: 'should send/receive 100 messages',
        reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
      } : null,
      isWindows ? {
        name: 'should receive multiple messages',
        reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
      } : null
    ] : {
      reason: 'FIXME pubsub is not supported in the browser https://github.com/ipfs/js-ipfs-api/issues/518'
    }
  })

  tests.repo(defaultCommonFactory)

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
              config = undefined
            }

            const spawnOptions = { repoPath, config, initOptions: { bits: 1024 } }

            ipfsFactory.spawn(spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, IPFSApi(_ipfsd.apiAddr))
            })
          }
        })
      }
    }
  }))

  tests.types(defaultCommonFactory, { skip: { reason: 'FIXME currently failing' } })

  tests.util(defaultCommonFactory, { skip: { reason: 'FIXME currently failing' } })
})
