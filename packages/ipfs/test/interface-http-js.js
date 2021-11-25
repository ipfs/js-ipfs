/* eslint-env mocha */

import * as tests from 'interface-ipfs-core'
import { isNode, isBrowser, isWebWorker } from 'ipfs-utils/src/env.js'
import { factory } from './utils/factory.js'
const isFirefox = globalThis.navigator?.userAgent?.toLowerCase().includes('firefox')

/** @typedef { import("ipfsd-ctl").ControllerOptions } ControllerOptions */

describe('interface-ipfs-core over ipfs-http-client tests against js-ipfs', function () {
  this.timeout(20000)

  const commonFactory = factory({
    type: 'js'
  })

  tests.root(commonFactory, {
    skip: [
      {
        name: 'should support bidirectional streaming',
        reason: 'Not supported by http'
      },
      {
        name: 'should error during add-all stream',
        reason: 'Not supported by http'
      }]
      .concat(isNode
        ? [{
            name: 'should fail when passed invalid input',
            reason: 'node-fetch cannot detect errors in streaming bodies - https://github.com/node-fetch/node-fetch/issues/753'
          }, {
            name: 'should not add from an invalid url',
            reason: 'node-fetch cannot detect errors in streaming bodies - https://github.com/node-fetch/node-fetch/issues/753'
          }]
        : [{
            name: 'should add with mtime as hrtime',
            reason: 'Not designed to run in the browser'
          }])
      .concat(isFirefox
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

  tests.bitswap(commonFactory)

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory)

  tests.dag(commonFactory, {
    skip: [{
      name: 'should get only a CID, due to resolving locally only',
      reason: 'Local resolve option is not implemented yet'
    }]
  })

  tests.dht(commonFactory)

  tests.files(commonFactory, {
    skip: (isBrowser || isWebWorker
      ? [{
          name: 'should make directory and specify mtime as hrtime',
          reason: 'Not designed to run in the browser'
        }, {
          name: 'should write file and specify mtime as hrtime',
          reason: 'Not designed to run in the browser'
        }, {
          name: 'should set mtime as hrtime',
          reason: 'Not designed to run in the browser'
        }]
      : [])
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

  tests.key(commonFactory)

  tests.miscellaneous(commonFactory)

  tests.name(factory({
    type: 'js',
    ipfsOptions: {
      offline: true
    }
  }))

  tests.namePubsub(factory({
    type: 'js',
    ipfsBin: './src/cli.js',
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    }
  }))

  tests.object(commonFactory, {
    skip: isFirefox
      ? [{
          name: 'should supply unaltered data',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }]
      : []
  })

  tests.pin(commonFactory, {
    skip: [{
      name: 'should throw an error on missing direct pins for existing path',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }, {
      name: 'should throw an error on missing link for a specific path',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }, {
      name: '.pin.remote.service',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.add',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.ls',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.rm',
      reason: 'Not implemented'
    }, {
      name: '.pin.remote.rmAll',
      reason: 'Not implemented'
    }]
  })

  tests.ping(commonFactory, {
    skip: [{
      name: 'should fail when pinging a peer that is not available',
      reason: 'FIXME: fetch does not yet support HTTP trailers https://github.com/ipfs/js-ipfs/issues/2519'
    }]
  })

  tests.pubsub(factory({
    type: 'js'
  }, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  }), {
    skip: [{
      name: 'should receive messages from a different node on lots of topics',
      reason: 'HTTP clients cannot hold this many connections open'
    }]
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
})
