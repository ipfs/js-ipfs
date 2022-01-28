/* eslint-env mocha */

import * as tests from 'interface-ipfs-core'
import { factory } from './utils/factory.js'
const isWindows = globalThis.process && globalThis.process.platform && globalThis.process.platform === 'win32'
const isFirefox = globalThis.navigator?.userAgent?.toLowerCase().includes('firefox')

/** @typedef {import("ipfsd-ctl").ControllerOptions} ControllerOptions */

describe('interface-ipfs-core over ipfs-http-client tests against go-ipfs', () => {
  const commonFactory = factory({
    type: 'go'
  })

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
        name: 'should ls single file with metadata',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should ls single file without containing directory with metadata',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should override raw leaves when file is smaller than one block and metadata is present',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should add directories with metadata',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should support bidirectional streaming',
        reason: 'Not supported by http'
      },
      {
        name: 'should error during add-all stream',
        reason: 'Not supported by http'
      }
    ].concat(isFirefox
      ? [{
          name: 'should add a BIG Uint8Array',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }, {
          name: 'should add a BIG Uint8Array with progress enabled',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }, {
          name: 'should add big files',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }]
      : [])
  })

  tests.bitswap(commonFactory, {
    skip: [
      {
        name: '.bitswap.unwant',
        reason: 'TODO not implemented in go-ipfs yet'
      }
    ]
  })

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

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
      // dag.get:
      {
        name: 'should get only a CID, due to resolving locally only',
        reason: 'FIXME: go-ipfs does not support localResolve option'
      },
      {
        name: 'should get a node added as CIDv0 with a CIDv1',
        reason: 'go-ipfs doesn\'t use CIDv0 for DAG API anymore'
      }
    ]
  })

  tests.dht(commonFactory)

  tests.files(commonFactory, {
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
      .concat(isFirefox
        ? [{
            name: 'overwrites start of a file without truncating (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'limits how many bytes to write to a file (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'pads the start of a new file when an offset is specified (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'expands a file when an offset is specified (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'expands a file when an offset is specified and the offset is longer than the file (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'truncates a file after writing (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'writes a file with raw blocks for newly created leaf nodes (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }]
        : [])
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

  tests.miscellaneous(commonFactory, {
    skip: [
      {
        name: 'should include the interface-ipfs-core version',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should include the ipfs-http-client version',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should have protocols property',
        reason: 'TODO not implemented in go-ipfs yet'
      }
    ]
  })

  tests.name(factory({
    type: 'go',
    ipfsOptions: {
      offline: true
    }
  }))

  tests.namePubsub(factory({
    type: 'go',
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
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
      },
      // name.pubsub
      {
        name: 'should publish and then resolve correctly',
        reason: 'js-ipfs and go-ipfs behaviour differs'
      },
      {
        name: 'should self resolve, publish and then resolve correctly',
        reason: 'js-ipfs and go-ipfs behaviour differs'
      },
      {
        name: 'should handle event on publish correctly',
        reason: 'js-ipfs and go-ipfs behaviour differs'
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
        name: 'should put a Protobuf encoded Uint8Array',
        reason: 'FIXME go-ipfs throws invalid encoding: protobuf'
      }
    ]
      .concat(isFirefox
        ? [{
            name: 'should supply unaltered data',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }]
        : [])
  })

  tests.pin(commonFactory, {
    skip: [
      {
        name: 'should list pins with metadata',
        reason: 'not implemented in go-ipfs'
      }
    ]
  })

  tests.ping(commonFactory, {
    skip: [
      {
        name: 'should fail when pinging a peer that is not available',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      }
    ]
  })

  tests.pubsub(factory({
    type: 'go'
  }, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  }), {
    skip: [{
      name: 'should receive messages from a different node on lots of topics',
      reason: 'HTTP clients cannot hold this many connections open'
    }].concat(
      isWindows
        ? [{
            name: 'should send/receive 100 messages',
            reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
          },
          {
            name: 'should receive multiple messages',
            reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/go-ipfs/issues/4778'
          }]
        : []
    )
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
