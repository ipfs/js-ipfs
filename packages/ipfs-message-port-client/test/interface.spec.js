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
        name: 'should add with mode as string',
        reason: 'ipfs.files.stat is not implemented'
      },
      {
        name: 'should add with mode as number',
        reason: 'ipfs.files.stat is not implemented'
      },
      {
        name: 'should add with mtime as Date',
        reason: 'ipfs.files.stat is not implemented'
      },
      {
        name: 'should add with mtime as { nsecs, secs }',
        reason: 'ipfs.files.stat is not implemented'
      },
      {
        name: 'should add with mtime as timespec',
        reason: 'ipfs.files.stat is not implemented'
      },
      {
        name: 'should add with mtime as hrtime',
        reason: 'ipfs.files.stat is not implemented'
      },

      {
        name: 'should add from a HTTP URL',
        reason: 'echo server is not enabled'
      },
      {
        name: 'should add from a HTTP URL with redirection',
        reason: 'echo server is not enabled'
      },
      {
        name: 'should add from a URL with only-hash=true',
        reason: 'echo server is not enabled'
      },
      {
        name: 'should add from a URL with wrap-with-directory=true',
        reason: 'echo server is not enabled'
      },
      {
        name:
          'should add from a URL with wrap-with-directory=true and URL-escaped file name',
        reason: 'echo server is not enabled'
      }
    ]
  })
})
