/* eslint-env mocha */
'use strict'

const tests = require('interface-ipfs-core')
const merge = require('merge-options')
const { createFactory } = require('ipfsd-ctl')
const { findBin } = require('ipfsd-ctl/src/utils')
const isWindows = process.platform && process.platform === 'win32'

/** @typedef {import("ipfsd-ctl").ControllerOptions} ControllerOptions */

describe('interface-ipfs-core tests', () => {
  /** @type ControllerOptions */
  const commonOptions = {
    test: true,
    ipfsHttpModule: {
      path: require.resolve('../src'),
      ref: require('../src')
    },
    ipfsOptions: {
      pass: 'ipfs-is-awesome-software'
    },
    ipfsBin: findBin('go')
  }
  const commonFactory = createFactory(commonOptions)

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
        name: 'should change file mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should change directory mode',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should change file mode as string',
        reason: 'TODO not implemented in go-ipfs yet'
      },
      {
        name: 'should change file mode to 0',
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

  tests.name(createFactory(merge(commonOptions,
    {
      ipfsOptions: {
        offline: true
      }
    }
  )), {
    skip: [
      {
        name: 'should resolve a record from peerid as cidv1 in base32',
        reason: 'TODO not implemented in go-ipfs yet: https://github.com/ipfs/go-ipfs/issues/5287'
      }
    ]
  })

  tests.namePubsub(createFactory(merge(commonOptions,
    {
      ipfsOptions: {
        EXPERIMENTAL: {
          ipnsPubsub: true
        }
      }
    }
  )), {
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

  tests.object(commonFactory)

  tests.pin(commonFactory)

  tests.ping(commonFactory, {
    skip: [
      {
        name: 'should fail when pinging a peer that is not available',
        reason: 'FIXME go-ipfs return success with text: Looking up peer <cid>'
      }
    ]
  })

  tests.pubsub(createFactory(commonOptions, {
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
