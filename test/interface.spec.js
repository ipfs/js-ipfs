/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const isNode = require('detect-node')
const CommonFactory = require('./utils/interface-common-factory')
const ipfsClient = require('../src')
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

  tests.block(defaultCommonFactory, {
    skip: [{
      name: 'should get a block added as CIDv1 with a CIDv0',
      reason: 'go-ipfs does not support the `version` param'
    }]
  })

  tests.bootstrap(defaultCommonFactory)

  tests.config(defaultCommonFactory, {
    skip: [
      // config.replace
      {
        name: 'replace',
        reason: 'FIXME Waiting for fix on go-ipfs https://github.com/ipfs/js-ipfs-http-client/pull/307#discussion_r69281789 and https://github.com/ipfs/go-ipfs/issues/2927'
      },
      // config.profile
      {
        name: 'profile',
        reason: 'TODO not yet implemented https://github.com/ipfs/js-ipfs-http-client/pull/1030'
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
      },
      {
        name: 'should get only a CID, due to resolving locally only',
        reason: 'FIXME: go-ipfs does not support localResolve option'
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
        name: 'should take options to override timeout config',
        reason: 'FIXME go-ipfs does not support a timeout option'
      },
      // dht.get
      {
        name: 'should get a value after it was put on another node',
        reason: 'FIXME go-ipfs errors with  Error: key was not found (type 6) https://github.com/ipfs/go-ipfs/issues/3862'
      }
    ]
  })

  tests.filesRegular(defaultCommonFactory, {
    skip: [
      // .add
      isNode ? null : {
        name: 'should add a nested directory as array of tupples',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      isNode ? null : {
        name: 'should add a nested directory as array of tupples with progress',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .addPullStream
      isNode ? null : {
        name: 'should add pull stream of valid files and dirs',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .addReadableStream
      isNode ? null : {
        name: 'should add readable stream of valid files and dirs',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .addFromStream
      isNode ? null : {
        name: 'addFromStream',
        reason: 'Not designed to run in the browser'
      },
      // .addFromFs
      isNode ? null : {
        name: 'addFromFs',
        reason: 'Not designed to run in the browser'
      },
      // .addFromURL
      isNode ? null : {
        name: 'addFromURL',
        reason: 'Not designed to run in the browser'
      },
      // TODO: remove when interface-ipfs-core updated
      isNode ? null : {
        name: 'addFromUrl',
        reason: 'Not designed to run in the browser'
      },
      // .catPullStream
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
      // .get
      isNode ? null : {
        name: 'should get a directory',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .ls
      isNode ? null : {
        name: 'should ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .lsPullStream
      isNode ? null : {
        name: 'should pull stream ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      },
      // .lsReadableStream
      isNode ? null : {
        name: 'should readable stream ls with a base58 encoded CID',
        reason: 'FIXME https://github.com/ipfs/js-ipfs-http-client/issues/339'
      }
    ]
  })

  tests.filesMFS(defaultCommonFactory, {
    skip: [
      {
        name: 'should ls directory with long option',
        reason: 'TODO unskip when go-ipfs supports --long https://github.com/ipfs/go-ipfs/pull/6528'
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

  tests.miscellaneous(defaultCommonFactory, {
    skip: [
      // stop
      {
        name: 'should stop the node',
        reason: 'FIXME go-ipfs returns an error https://github.com/ipfs/go-ipfs/issues/4078'
      }
    ]
  })

  tests.name(CommonFactory.create({
    spawnOptions: {
      args: ['--offline']
    }
  }))

  // TODO: uncomment after https://github.com/ipfs/interface-ipfs-core/pull/361 being merged and a new release
  tests.namePubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-namesys-pubsub'],
      initOptions: { bits: 1024, profile: 'test' }
    }
  }), {
    skip: [
      // name.pubsub.cancel
      {
        name: 'should cancel a subscription correctly returning true',
        reason: 'go-ipfs is really slow for publishing and resolving ipns records, unless in offline mode'
      },
      // name.pubsub.subs
      {
        name: 'should get the list of subscriptions updated after a resolve',
        reason: 'go-ipfs is really slow for publishing and resolving ipns records, unless in offline mode'
      }
    ]
  })

  tests.object(defaultCommonFactory)

  tests.pin(defaultCommonFactory)

  tests.ping(defaultCommonFactory, {
    skip: [
      {
        name: 'should fail when pinging an unknown peer over pull stream',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      },
      {
        name: 'should fail when pinging peer that is not available over readable stream',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      },
      {
        name: 'should fail when pinging a peer that is not available',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      }
    ]
  })

  tests.pubsub(CommonFactory.create({
    spawnOptions: {
      args: ['--enable-pubsub-experiment'],
      initOptions: { bits: 1024, profile: 'test' }
    }
  }), {
    skip: isWindows ? [
      // pubsub.subscribe
      {
        name: 'should send/receive 100 messages',
        reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
      },
      {
        name: 'should receive multiple messages',
        reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
      }
    ] : null
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

            const spawnOptions = { repoPath, config, initOptions: { bits: 1024, profile: 'test' } }

            ipfsFactory.spawn(spawnOptions)
              .then(ipfsd => {
                nodes.push(ipfsd)
                cb(null, ipfsClient(ipfsd.apiAddr))
              }, cb)
          }
        })
      }
    }
  }))
})
