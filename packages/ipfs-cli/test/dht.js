/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('./utils/cli')
const sinon = require('sinon')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const CID = require('cids')

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

  describe('put', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should be able to put a value to the dht', async () => {
      const key = 'testkey'
      const value = 'testvalue'

      await cli(`dht put ${key} ${value}`, {
        ipfs
      })
      expect(ipfs.dht.put.calledWith(uint8ArrayFromString(key), uint8ArrayFromString(value), defaultOptions)).to.be.true()
    })

    it('should be able to put a value to the dht with a timeout', async () => {
      const key = 'testkey'
      const value = 'testvalue'

      await cli(`dht put ${key} ${value} --timeout=1s`, {
        ipfs
      })
      expect(ipfs.dht.put.calledWith(uint8ArrayFromString(key), uint8ArrayFromString(value), {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })

  describe('get', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should be able to get a value from the dht', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      const value = uint8ArrayFromString('testvalue')

      ipfs.dht.get.withArgs(key.bytes, defaultOptions).resolves(value)

      const out = await cli(`dht get ${key}`, {
        ipfs
      })
      expect(out).to.equal(`${uint8ArrayToString(value, 'base58btc')}\n`)
    })

    it('should be able to get a value from the dht with a timeout', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      const value = uint8ArrayFromString('testvalue')

      ipfs.dht.get.withArgs(key.bytes, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(value)

      const out = await cli(`dht get ${key} --timeout=1s`, {
        ipfs
      })
      expect(out).to.equal(`${uint8ArrayToString(value, 'base58btc')}\n`)
    })
  })

  describe('provide', () => {
    const defaultOptions = {
      recursive: false,
      timeout: undefined
    }

    it('should be able to provide data', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')

      await cli(`dht provide ${key}`, {
        ipfs
      })
      expect(ipfs.dht.provide.calledWith(key, defaultOptions)).to.be.true()
    })

    it('should be able to provide data recursively', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')

      await cli(`dht provide ${key} --recursive`, {
        ipfs
      })
      expect(ipfs.dht.provide.calledWith(key, {
        ...defaultOptions,
        recursive: true
      })).to.be.true()
    })

    it('should be able to provide data recursively (short option)', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')

      await cli(`dht provide ${key} -r`, {
        ipfs
      })
      expect(ipfs.dht.provide.calledWith(key, {
        ...defaultOptions,
        recursive: true
      })).to.be.true()
    })

    it('should be able to provide data with a timeout', async () => {
      const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')

      await cli(`dht provide ${key} --timeout=1s`, {
        ipfs
      })
      expect(ipfs.dht.provide.calledWith(key, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })

  describe('findprovs', () => {
    const defaultOptions = {
      numProviders: 20,
      timeout: undefined
    }
    const key = new CID('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    const prov = {
      id: 'prov-id'
    }

    it('should be able to find providers for data', async () => {
      ipfs.dht.findProvs.withArgs(key, defaultOptions).returns([
        prov
      ])

      const out = await cli(`dht findprovs ${key}`, { ipfs })
      expect(out).to.equal(`${prov.id}\n`)
    })

    it('should be able to find smaller number of providers for data', async () => {
      ipfs.dht.findProvs.withArgs(key, {
        ...defaultOptions,
        numProviders: 5
      }).returns([
        prov
      ])

      const out = await cli(`dht findprovs ${key} --num-providers 5`, { ipfs })
      expect(out).to.equal(`${prov.id}\n`)
    })

    it('should be able to find providers for data with a timeout', async () => {
      ipfs.dht.findProvs.withArgs(key, {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        prov
      ])

      const out = await cli(`dht findprovs ${key} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${prov.id}\n`)
    })
  })

  describe('findpeer', () => {
    const defaultOptions = {
      timeout: undefined
    }
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const peer = {
      addrs: [
        'addr'
      ]
    }

    it('should find a peer', async () => {
      ipfs.dht.findPeer.withArgs(peerId, defaultOptions).returns(peer)

      const out = await cli(`dht findpeer ${peerId}`, { ipfs })

      expect(out).to.equal(`${peer.addrs[0]}\n`)
    })

    it('should find a peer with a timeout', async () => {
      ipfs.dht.findPeer.withArgs(peerId.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns(peer)

      const out = await cli(`dht findpeer ${peerId} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${peer.addrs[0]}\n`)
    })
  })

  describe('query', () => {
    const defaultOptions = {
      timeout: undefined
    }
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const peer = {
      id: peerId
    }

    it('should query the DHT', async () => {
      // https://github.com/libp2p/js-peer-id/issues/141
      ipfs.dht.query.withArgs(peerId, defaultOptions).returns([
        peer
      ])

      const out = await cli(`dht query ${peerId}`, { ipfs })
      expect(out).to.equal(`${peer.id}\n`)
    })

    it('should query the DHT with a timeout', async () => {
      // https://github.com/libp2p/js-peer-id/issues/141
      ipfs.dht.query.withArgs(peerId, {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        peer
      ])

      const out = await cli(`dht query ${peerId} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${peer.id}\n`)
    })
  })
})
