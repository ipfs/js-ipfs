/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { activate } = require('./util/client')

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

  tests.pin(factory, {
    skip: [
      // pin.add
      {
        name: 'should add a CID and return the added CID',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should add a pin with options and return the added CID',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should add recursively',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should add directly',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should recursively pin parent of direct pin',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should fail to directly pin a recursive pin',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should fail to pin a hash not in datastore',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'needs all children in datastore to pin recursively',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should pin dag-cbor',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should pin raw',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should pin dag-cbor with dag-pb child',
        reason: 'ipfs.pin.ls is not implemented'
      },
      // pin.addAll
      {
        name: 'should add an array of CIDs',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should add a generator of CIDs',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should add an async generator of CIDs',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should add an array of pins with options',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should add a generator of pins with options',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should add an async generator of pins with options',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      {
        name: 'should respect timeout option when pinning a block',
        reason: 'ipfs.pin.addAll is not implemented'
      },
      // pin.ls
      {
        name: 'should respect timeout option when listing pins',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list all recursive pins',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list all indirect pins',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list all types of pins',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list all direct pins',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list pins for a specific hash',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should throw an error on missing direct pins for existing path',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should throw an error on missing link for a specific path',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list indirect pins for a specific path',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list recursive pins for a specific hash',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list pins for multiple CIDs',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should throw error for invalid non-string pin type option',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should throw error for invalid string pin type option',
        reason: 'ipfs.pin.ls is not implemented'
      },
      {
        name: 'should list pins with metadata',
        reason: 'ipfs.pin.ls is not implemented'
      },
      // pin.rm
      {
        name: 'should respect timeout option when unpinning a block',
        reason: 'ipfs.pin.rm is not implemented'
      },
      {
        name: 'should remove a recursive pin',
        reason: 'ipfs.pin.rm is not implemented'
      },
      {
        name: 'should remove a direct pin',
        reason: 'ipfs.pin.rm is not implemented'
      },
      {
        name: 'should fail to remove an indirect pin',
        reason: 'ipfs.pin.rm is not implemented'
      },
      {
        name: 'should fail when an item is not pinned',
        reason: 'ipfs.pin.rm is not implemented'
      },
      // pin.rmAll
      {
        name: 'should respect timeout option when unpinning a block',
        reason: 'ipfs.pin.rmAll is not implemented'
      },
      {
        name: 'should pipe the output of ls to rm',
        reason: 'ipfs.pin.rmAll is not implemented'
      },
    ]
  })
})
