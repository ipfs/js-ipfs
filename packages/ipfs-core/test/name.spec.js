/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const delay = require('delay')
const { Key } = require('interface-datastore')
const PeerId = require('peer-id')
const errCode = require('err-code')
const ipns = require('ipns')
const getIpnsRoutingConfig = require('../src/ipns/routing/config')
const IpnsPublisher = require('../src/ipns/publisher')
const IpnsRepublisher = require('../src/ipns/republisher')
const IpnsResolver = require('../src/ipns/resolver')
const OfflineDatastore = require('../src/ipns/routing/offline-datastore')
const PubsubDatastore = require('../src/ipns/routing/pubsub-datastore')
const uint8ArrayFromString = require('uint8arrays/from-string')

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name', function () {
  describe('republisher', function () {
    this.timeout(120 * 1000)
    let republisher

    afterEach(async () => {
      if (republisher) {
        await republisher.stop()
        republisher = null
      }
    })

    it('should republish entries', async function () {
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), {
        initialBroadcastInterval: 500,
        broadcastInterval: 1000
      })
      republisher._republishEntries = sinon.stub()

      await republisher.start()

      expect(republisher._republishEntries.calledOnce).to.equal(false)

      // Initial republish should happen after ~500ms
      await delay(750)
      expect(republisher._republishEntries.calledOnce).to.equal(true)

      // Subsequent republishes should happen after ~1500ms
      await delay(1000)
      expect(republisher._republishEntries.calledTwice).to.equal(true)
    })

    it('should not republish self key twice', async function () {
      const mockKeychain = {
        listKeys: () => Promise.resolve([{ name: 'self' }])
      }
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), mockKeychain, {
        initialBroadcastInterval: 500,
        broadcastInterval: 1000,
        pass: 'pass'
      })
      republisher._republishEntry = sinon.stub()

      await republisher.start()

      expect(republisher._republishEntry.calledOnce).to.equal(false)

      // Initial republish should happen after ~500ms
      await delay(750)
      expect(republisher._republishEntry.calledOnce).to.equal(true)
    })

    it('should error if run republish again', async () => {
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), {
        initialBroadcastInterval: 50,
        broadcastInterval: 100
      })
      republisher._republishEntries = sinon.stub()

      await republisher.start()

      await expect(republisher.start())
        .to.eventually.be.rejected()
        .with.a.property('code').that.equals('ERR_REPUBLISH_ALREADY_RUNNING')
    })
  })

  describe('publisher', () => {
    it('should fail to publish if does not receive private key', () => {
      const publisher = new IpnsPublisher()
      return expect(publisher.publish(null, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_PRIVATE_KEY')
    })

    it('should fail to publish if an invalid private key is received', () => {
      const publisher = new IpnsPublisher()
      return expect(publisher.publish({ bytes: 'not that valid' }, ipfsRef))
        .to.eventually.be.rejected()
        // .that.eventually.has.property('code', 'ERR_INVALID_PRIVATE_KEY') TODO: libp2p-crypto needs to throw err-code
    })

    it('should fail to publish if _updateOrCreateRecord fails', async () => {
      const publisher = new IpnsPublisher()
      const err = new Error('error')
      const peerId = await PeerId.create()

      sinon.stub(publisher, '_updateOrCreateRecord').rejects(err)

      return expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejectedWith(err)
    })

    it('should fail to publish if _putRecordToRouting receives an invalid peer id', () => {
      const publisher = new IpnsPublisher()
      return expect(publisher._putRecordToRouting(undefined, undefined))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_PEER_ID')
    })

    it('should fail to publish if receives an invalid datastore key', async () => {
      const routing = {
        get: sinon.stub().rejects(errCode(new Error('not found'), 'ERR_NOT_FOUND'))
      }
      const datastore = {
        get: sinon.stub().rejects(errCode(new Error('not found'), 'ERR_NOT_FOUND')),
        put: sinon.stub().resolves()
      }
      const publisher = new IpnsPublisher(routing, datastore)
      const peerId = await PeerId.create()

      const stub = sinon.stub(Key, 'isKey').returns(false)

      await expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_DATASTORE_KEY')

      stub.restore()
    })

    it('should fail to publish if we receive a unexpected error getting from datastore', async () => {
      const routing = {}
      const datastore = {
        get: sinon.stub().rejects(new Error('boom'))
      }
      const publisher = new IpnsPublisher(routing, datastore)
      const peerId = await PeerId.create()

      await expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_DETERMINING_PUBLISHED_RECORD')
    })

    it('should fail to publish if we receive a unexpected error putting to datastore', async () => {
      const routing = {
        get: sinon.stub().rejects(errCode(new Error('not found'), 'ERR_NOT_FOUND'))
      }
      const datastore = {
        get: sinon.stub().rejects(errCode(new Error('not found'), 'ERR_NOT_FOUND')),
        put: sinon.stub().rejects(new Error('error-unexpected'))
      }
      const publisher = new IpnsPublisher(routing, datastore)
      const peerId = await PeerId.create()

      await expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_STORING_IN_DATASTORE')
    })
  })

  describe('resolver', () => {
    it('should resolve an inlined public key', async () => {
      const peerId = await PeerId.create({ keyType: 'ed25519' })
      const value = `/ipfs/${peerId.toB58String()}`
      const record = await ipns.create(peerId.privKey, uint8ArrayFromString(value), 1, 10e3)

      const routing = {
        get: sinon.stub().returns(ipns.marshal(record))
      }
      const resolver = new IpnsResolver(routing)

      const resolved = await resolver.resolve(`/ipns/${peerId.toB58String()}`)
      expect(resolved).to.equal(value)
    })

    it('should fail to resolve if the received name is not a string', () => {
      const resolver = new IpnsResolver()
      return expect(resolver.resolve(false))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_NAME')
    })

    it('should fail to resolve if receives an invalid ipns path', () => {
      const resolver = new IpnsResolver()
      return expect(resolver.resolve('ipns/<cid>'))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_NAME')
    })

    it('should fail to resolve if receive error getting from datastore', async () => {
      const routing = {
        get: sinon.stub().rejects(new Error('boom'))
      }
      const resolver = new IpnsResolver(routing)
      const peerId = await PeerId.create()

      await expect(resolver.resolve(`/ipns/${peerId.toB58String()}`))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_UNEXPECTED_ERROR_GETTING_RECORD')
    })

    it('should fail to resolve if does not find the record', async () => {
      const routing = {
        get: sinon.stub().rejects(errCode(new Error('not found'), 'ERR_NOT_FOUND'))
      }
      const resolver = new IpnsResolver(routing)
      const peerId = await PeerId.create()

      await expect(resolver.resolve(`/ipns/${peerId.toB58String()}`))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_NO_RECORD_FOUND')
    })

    it('should fail to resolve if does not receive a buffer', async () => {
      const routing = {
        get: sinon.stub().resolves('not-a-buffer')
      }
      const resolver = new IpnsResolver(routing)
      const peerId = await PeerId.create()

      await expect(resolver.resolve(`/ipns/${peerId.toB58String()}`))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_RECORD_RECEIVED')
    })
  })

  describe('routing config', function () {
    it('should use only the offline datastore by default', () => {
      const config = getIpnsRoutingConfig({
        libp2p: sinon.stub(),
        repo: sinon.stub(),
        peerId: sinon.stub(),
        options: {}
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof OfflineDatastore).to.eql(true)
    })

    it('should use only the offline datastore if offline', () => {
      const config = getIpnsRoutingConfig({
        libp2p: sinon.stub(),
        repo: sinon.stub(),
        peerId: sinon.stub(),
        options: {
          offline: true
        }
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof OfflineDatastore).to.eql(true)
    })

    it('should use the pubsub datastore if enabled', async () => {
      const peerId = await PeerId.create()

      const config = getIpnsRoutingConfig({
        libp2p: { pubsub: sinon.stub() },
        repo: { datastore: sinon.stub() },
        peerId,
        options: {
          EXPERIMENTAL: {
            ipnsPubsub: true
          }
        }
      })

      expect(config.stores).to.have.lengthOf(2)
      expect(config.stores[0] instanceof PubsubDatastore).to.eql(true)
      expect(config.stores[1] instanceof OfflineDatastore).to.eql(true)
    })

    it('should use the dht if enabled', () => {
      const dht = sinon.stub()

      const config = getIpnsRoutingConfig({
        libp2p: { _dht: dht },
        repo: sinon.stub(),
        peerId: sinon.stub(),
        options: {
          libp2p: {
            config: {
              dht: {
                enabled: true
              }
            }
          }
        }
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0]).to.eql(dht)
    })
  })
})
