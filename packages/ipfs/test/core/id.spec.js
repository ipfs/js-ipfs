/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const multiaddr = require('multiaddr')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const factory = require('../utils/factory')

describe('id', function () {
  this.timeout(60 * 1000)
  const df = factory()
  let node

  before(async () => {
    let servers = [
      multiaddr('/ip4/127.0.0.1/tcp/0')
    ]

    if (isBrowser) {
      servers = [
        multiaddr('/ip4/127.0.0.1/tcp/14579/wss/p2p-webrtc-star')
      ]
    }

    node = (await df.spawn({
      type: 'proc',
      ipfsOptions: {
        config: {
          Addresses: {
            Swarm: servers
          }
        }
      }
    })).api
  })

  after(async () => {
    await node.stop()
  })

  it('should return swarm ports opened after startup', async function () {
    if (isWebWorker) {
      // TODO: webworkers are not currently dialable
      return this.skip()
    }

    await expect(node.id()).to.eventually.have.property('addresses').that.is.not.empty()
  })
})
