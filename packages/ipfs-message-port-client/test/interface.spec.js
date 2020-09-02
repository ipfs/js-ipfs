/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { core } = require('./interface.core')
const { activate } = require('./util/client')

describe('interface-ipfs-core tests', () => {
  const commonFactory = {
    spawn () {
      return { api: activate() }
    },
    clean () {}
  }

  tests.dag(commonFactory, {
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

  core(commonFactory, {
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
      }
    ]
  })

  tests.block(commonFactory, {
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
      }
    ]
  })
})
