
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const multiaddr = require('multiaddr')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const createNode = require('./utils/create-node')
const bootstrapList = require('../src/runtime/config-nodejs.js')().Bootstrap

describe('config', function () {
  this.timeout(10 * 1000)

  let ipfs
  let cleanup

  before(async () => {
    const res = await createNode({
      config: {
        Bootstrap: bootstrapList
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('bootstrap list should contain dialable nodes', async () => {
    const res = await ipfs.bootstrap.list()

    expect(res.Peers).to.not.be.empty()

    const onlyWss = res.Peers.reduce((acc, curr) => {
      if (!acc) {
        return acc
      }

      const ma = multiaddr(curr)
      return ma.protos().some(proto => proto.name === 'wss')
    }, true)

    if (isBrowser || isWebWorker) {
      expect(onlyWss).to.be.true()
    } else {
      expect(onlyWss).to.be.false()
    }
  })
})
