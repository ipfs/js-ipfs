/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
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
        reason: 'TODO: Guessing unifxs expects Buffer and fails on Uint8Array'
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
})
