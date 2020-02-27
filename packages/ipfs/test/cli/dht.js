/* eslint-env mocha */

'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

describe('dht', () => {
  let ipfs

  beforeEach(function () {
    ipfs = {
      dht: {
        put: sinon.stub(),
        get: sinon.stub(),
        provide: sinon.stub(),
        findProvs: sinon.stub(),
        findPeer: sinon.stub(),
        query: sinon.stub()
      }
    }
  })

  it('should be able to put a value to the dht', async () => {
    const key = 'testkey'
    const value = 'testvalue'

    await cli(`dht put ${key} ${value}`, {
      ipfs
    })
    expect(ipfs.dht.put.calledWith(key, value)).to.be.true()
  })

  it('should be able to get a value from the dht', async () => {
    const key = 'testkey'
    const value = 'testvalue'

    ipfs.dht.get.withArgs(key).resolves(value)

    const out = await cli(`dht get ${key}`, {
      ipfs
    })
    expect(out).to.equal(`${value}\n`)
  })

  it('should be able to provide data', async () => {
    const key = 'testkey'

    await cli(`dht provide ${key}`, {
      ipfs
    })
    expect(ipfs.dht.provide.calledWith(key, { recursive: false })).to.be.true()
  })

  it('should be able to provide data recursively', async () => {
    const key = 'testkey'

    await cli(`dht provide ${key} --recursive`, {
      ipfs
    })
    expect(ipfs.dht.provide.calledWith(key, { recursive: true })).to.be.true()
  })

  it('should be able to provide data recursively (short option)', async () => {
    const key = 'testkey'

    await cli(`dht provide ${key} -r`, {
      ipfs
    })
    expect(ipfs.dht.provide.calledWith(key, { recursive: true })).to.be.true()
  })

  it('should be able to find providers for data', async () => {
    const key = 'testkey'
    const prov = {
      id: 'prov-id'
    }
    ipfs.dht.findProvs.withArgs(key, { numProviders: 20 }).returns([
      prov
    ])

    const out = await cli(`dht findprovs ${key}`, { ipfs })
    expect(out).to.equal(`${prov.id}\n`)
  })

  it('should be able to find smaller number of providers for data', async () => {
    const key = 'testkey'
    const prov = {
      id: 'prov-id'
    }
    ipfs.dht.findProvs.withArgs(key, { numProviders: 5 }).returns([
      prov
    ])

    const out = await cli(`dht findprovs ${key} --num-providers 5`, { ipfs })
    expect(out).to.equal(`${prov.id}\n`)
  })

  it('findpeer', async () => {
    const peerId = 'peerId'
    const peer = {
      addrs: [
        'addr'
      ]
    }

    ipfs.dht.findPeer.withArgs(peerId).returns(peer)

    const out = await cli(`dht findpeer ${peerId}`, { ipfs })
    expect(out).to.equal(`${peer.addrs[0]}\n`)
  })

  it('query', async () => {
    const peerId = 'peerId'
    const peer = {
      id: peerId
    }
    ipfs.dht.query.withArgs(peerId).returns([
      peer
    ])

    const out = await cli(`dht query ${peerId}`, { ipfs })
    expect(out).to.equal(`${peer.id}\n`)
  })
})
