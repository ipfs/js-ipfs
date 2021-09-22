/* eslint-env mocha, browser */

import * as tests from 'interface-ipfs-core'
import { activate } from './util/client.js'

describe('interface-ipfs-core tests', () => {
  const factory = {
    spawn () {
      return { api: activate() }
    },
    clean () {}
  }

  tests.root(factory, {
    skip: [
      {
        name: 'should add with only-hash=true',
        reason: 'ipfs.object.get is not implemented'
      },
      {
        name: 'should add a directory with only-hash=true',
        reason: 'ipfs.object.get is not implemented'
      },
      {
        name: 'should add with mtime as hrtime',
        reason: 'process.hrtime is not a function in browser'
      },
      {
        name: 'should add from a URL with only-hash=true',
        reason: 'ipfs.object.get is not implemented'
      },
      {
        name: 'should cat with a Uint8Array multihash',
        reason: 'Passing CID as Uint8Array is not supported'
      },
      {
        name: 'should add from a HTTP URL',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should add from a HTTP URL with redirection',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should add from a URL with only-hash=true',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should add from a URL with wrap-with-directory=true',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should add from a URL with wrap-with-directory=true and URL-escaped file name',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should not add from an invalid url',
        reason: 'https://github.com/ipfs/js-ipfs/issues/3195'
      },
      {
        name: 'should be able to add dir without sharding',
        reason: 'Cannot spawn IPFS with different args'
      },
      {
        name: 'with sharding',
        reason: 'TODO: allow spawning new daemons with different config'
      },
      {
        name: 'addAll',
        reason: 'Not implemented'
      },
      {
        name: 'get',
        reason: 'Not implemented'
      },
      {
        name: 'refs',
        reason: 'Not implemented'
      },
      {
        name: 'refsLocal',
        reason: 'Not implemented'
      }
    ]
  })

  tests.dag(factory, {
    skip: [
      {
        name: 'should get a dag-pb node',
        reason: 'Nodes are not turned into dag-pb DAGNode instances'
      },
      {
        name: 'should get a dag-pb node with path',
        reason: 'Nodes are not turned into dag-pb DAGNode instances'
      },
      {
        name: 'should get by CID string',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should get by CID string + path',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should get a node added as CIDv1 with a CIDv0',
        reason: 'ipfs.block API is not implemented'
      },
      {
        name: 'should be able to get part of a dag-cbor node',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should get tree with CID and path as String',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: '.dag.export',
        reason: 'Not implemented yet'
      },
      {
        name: '.dag.import',
        reason: 'Not implemented yet'
      }
    ]
  })

  tests.block(factory, {
    skip: [
      {
        name: 'should get by CID in string',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should return an error for an invalid CID',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should put a buffer, using CID string',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should put a buffer, using options',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should remove by CID object',
        reason: 'ipfs.refs.local is not implemented'
      },
      {
        name: 'should remove by CID in string',
        reason: 'Passing CID as strings is not supported'
      },
      {
        name: 'should remove by CID in buffer',
        reason: 'Passing CID as Buffer is not supported'
      },
      {
        name: 'should error when removing pinned blocks',
        reason: 'ipfs.pin.add is not implemented'
      },

      {
        name: 'should remove multiple CIDs',
        reason: 'times out'
      },
      {
        name: 'should error when removing non-existent blocks',
        reason: 'times out'
      },
      {
        name: 'should not error when force removing non-existent blocks',
        reason: 'times out'
      }
    ]
  })
})
