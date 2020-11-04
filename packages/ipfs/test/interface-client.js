/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const factory = require('./utils/factory')
const createClient = require('ipfs-client')

describe('interface-ipfs-core ipfs-client tests', () => {
  const commonFactory = factory({
    type: 'js',
    ipfsClientModule: require('ipfs-client')
  })

  tests.root(commonFactory, {
    skip: [
      {
        name: 'add',
        reason: 'not implemented'
      },
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

  tests.miscellaneous(commonFactory, {
    skip: [
      {
        name: '.dns',
        reason: 'Not implemented'
      },
      {
        name: '.resolve',
        reason: 'Not implemented'
      },
      {
        name: '.stop',
        reason: 'Not implemented'
      }
      ,
      {
        name: '.version',
        reason: 'Not implemented'
      }
    ]
  })
})
