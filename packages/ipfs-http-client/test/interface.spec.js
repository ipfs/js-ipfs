/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const factory = require('./utils/factory')
const isWindows = global.process && global.process.platform && global.process.platform === 'win32'

/** @typedef {import("ipfsd-ctl").ControllerOptions} ControllerOptions */

describe('interface-ipfs-core tests', () => {
  const commonFactory = factory()

  tests.root(commonFactory, {
    skip: [
      {
        name: 'should add with mode as string',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add with mode as number',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add with mtime as Date',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add with mtime as { nsecs, secs }',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add with mtime as timespec',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add with mtime as hrtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should export a chunk of a file',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should ls with metadata',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should override raw leaves when file is smaller than one block and metadata is present',
        reason: 'TODO not implemented in go-ipfs yet'
      }
    ]
  })

  tests.bitswap(commonFactory)

  tests.block(commonFactory, {
    skip: [{
      name: 'should get a block added as CIDv1 with a CIDv0',
      reason: 'go-ipfs does not support the `version` param'
    }]
  })

  tests.bootstrap(commonFactory, {
    skip: [{
      name: 'should return a list containing the bootstrap peer when called with a valid arg (ip4)',
      reason: 'TODO unskip when go-ipfs switches to p2p for libp2p keys'
    }, {
      name: 'should prevent duplicate inserts of bootstrap peers',
      reason: 'TODO unskip when go-ipfs switches to p2p for libp2p keys'
    }, {
      name: 'should return a list containing the peer removed when called with a valid arg (ip4)',
      reason: 'TODO unskip when go-ipfs switches to p2p for libp2p keys'
    }]
  })

  tests.config(commonFactory, {
    skip: [
      // config.replace
      {
        name: 'replace',
        reason: 'FIXME Waiting for fix on go-ipfs https://github.com/ipfs/js-ipfs-http-client/pull/307#discussion_r69281789 and https://github.com/ipfs/go-ipfs/issues/2927'
      },
      {
        name: 'should list config profiles',
        reason: 'TODO: Not implemented in go-ipfs'
      },
      {
        name: 'should strip private key from diff output',
        reason: 'TODO: Not implemented in go-ipfs'
      }
    ]
  })

  tests.dag(commonFactory, {
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

  tests.dht(commonFactory)

  tests.files(factory({}, {
    go: {
      ipfsOptions: {
        config: {
          Experimental: {
            ShardingEnabled: true
          }
        }
      }
    },
    js: {
      ipfsOptions: {
        EXPERIMENTAL: {
          sharding: true
        }
      }
    }
  }), {
    skip: [
      {
        name: 'should ls directory',
        reason: 'TODO unskip when go-ipfs supports --long https://github.com/ipfs/go-ipfs/pull/6528'
      },
      {
        name: 'should list a file directly',
        reason: 'TODO unskip when go-ipfs supports --long https://github.com/ipfs/go-ipfs/pull/6528'
      },
      {
        name: 'should ls directory and include metadata',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should read from outside of mfs',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should ls from outside of mfs',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update the mode for a file',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update the mode for a directory',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update the mode for a hamt-sharded-directory',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update modes with basic symbolic notation that adds bits',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update modes with basic symbolic notation that removes bits',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update modes with basic symbolic notation that overrides bits',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update modes with multiple symbolic notation',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update modes with special symbolic notation',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should apply special execute permissions to world',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should apply special execute permissions to user',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should apply special execute permissions to user and group',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should apply special execute permissions to sharded directories',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update file mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update directory mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should update the mtime for a hamt-sharded-directory',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should create an empty file',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should respect metadata when copying files',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should respect metadata when copying directories',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should respect metadata when copying from outside of mfs',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should have default mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should set mtime as Date',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should set mtime as { nsecs, secs }',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should set mtime as timespec',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should set mtime as hrtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and have default mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mode as string',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mode as number',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mtime as Date',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mtime as { nsecs, secs }',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mtime as timespec',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should make directory and specify mtime as hrtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mode as a string',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mode as a number',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mtime as Date',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mtime as { nsecs, secs }',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mtime as timespec',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should write file and specify mtime as hrtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat file with mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat file with mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat dir with mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat dir with mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat sharded dir with mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should stat sharded dir with mtime',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'lists a raw node',
        reason: 'TODO go-ipfs does not support ipfs paths for all mfs commands'
      },
      {
        name: 'lists a raw node in an mfs directory',
        reason: 'TODO go-ipfs does not support non-ipfs nodes in mfs'
      },
      {
        name: 'writes a small file with an escaped slash in the title',
        reason: 'TODO go-ipfs does not support escapes in paths'
      },
      {
        name: 'overwrites a file with a different CID version',
        reason: 'TODO go-ipfs does not support changing the CID version'
      },
      {
        name: 'partially overwrites a file with a different CID version',
        reason: 'TODO go-ipfs does not support changing the CID version'
      },
      {
        name: 'refuses to copy multiple files to a non-existent child directory',
        reason: 'TODO go-ipfs does not support copying multiple files at once'
      },
      {
        name: 'refuses to copy files to an unreadable node',
        reason: 'TODO go-ipfs does not support identity format, maybe in 0.5.0?'
      },
      {
        name: 'copies a file to a pre-existing directory',
        reason: 'TODO go-ipfs does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'copies multiple files to new location',
        reason: 'TODO go-ipfs does not support copying multiple files at once'
      },
      {
        name: 'copies files to deep mfs paths and creates intermediate directories',
        reason: 'TODO go-ipfs does not support the parents flag in the cp command'
      },
      {
        name: 'copies a sharded directory to a normal directory',
        reason: 'TODO go-ipfs does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'copies a normal directory to a sharded directory',
        reason: 'TODO go-ipfs does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'removes multiple files',
        reason: 'TODO go-ipfs does not support removing multiple files'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a file',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "85675" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a subshard',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "2109" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "170441" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "11463" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a new file',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "5835" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when creating a new subshard',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "8038" to type "bool" (for option "-size")'
      },
      {
        name: ' results in the same hash as a sharded directory created by the importer when adding a file to a subshard',
        reason: 'TODO go-ipfs errors out with HTTPError: Could not convert value "6620" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a file to a subshard',
        reason: 'HTTPError: Could not convert value "6620" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a file to a subshard of a subshard',
        reason: 'HTTPError: Could not convert value "170441" to type "bool" (for option "-size")'
      },
      {
        name: 'stats a dag-cbor node',
        reason: 'TODO go-ipfs does not support non-dag-pb nodes in mfs'
      },
      {
        name: 'stats an identity CID',
        reason: 'TODO go-ipfs does not support non-dag-pb nodes in mfs'
      },
      {
        name: 'limits how many bytes to write to a file (Really large file)',
        reason: 'TODO go-ipfs drops the connection'
      }
    ]
  })

  tests.key(commonFactory, {
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

  tests.miscellaneous(commonFactory)

  tests.name(factory(
    {
      ipfsOptions: {
        offline: true
      }
    }
  ), {
    skip: [
      {
        name: 'should resolve a record from peerid as cidv1 in base32',
        reason: 'TODO not implemented in go-ipfs yet: https://github.com/ipfs/go-ipfs/issues/5287'
      }
    ]
  })

  tests.namePubsub(factory(
    {
      ipfsOptions: {
        EXPERIMENTAL: {
          ipnsPubsub: true
        }
      }
    }
  ), {
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

  tests.object(commonFactory, {
    skip: [
      {
        name: 'should get data by base58 encoded multihash string',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash string',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should get links by base58 encoded multihash',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should get links by base58 encoded multihash string',
        reason: 'FIXME go-ipfs throws invalid encoding: base58'
      },
      {
        name: 'should put a Protobuf encoded Buffer',
        reason: 'FIXME go-ipfs throws invalid encoding: protobuf'
      }
    ]
  })

  tests.pin(commonFactory)

  tests.ping(commonFactory, {
    skip: [
      {
        name: 'should fail when pinging a peer that is not available',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      }
    ]
  })

  tests.pubsub(factory({}, {
    go: {
      args: ['--enable-pubsub-experiment']
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

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
