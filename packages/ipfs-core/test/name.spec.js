/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import delay from 'delay'
import PeerId from 'peer-id'
import errCode from 'err-code'
import * as ipns from 'ipns'
import { createRouting } from '../src/ipns/routing/config.js'
import { IpnsPublisher } from '../src/ipns/publisher.js'
import { IpnsRepublisher } from '../src/ipns/republisher.js'
import { IpnsResolver } from '../src/ipns/resolver.js'
import { OfflineDatastore } from '../src/ipns/routing/offline-datastore.js'
import { IpnsPubsubDatastore } from '../src/ipns/routing/pubsub-datastore.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name', function () {
  describe('republisher', function () {
    this.timeout(120 * 1000)
    /** @type {IpnsRepublisher} */
    let republisher

    afterEach(async () => {
      if (republisher) {
        await republisher.stop()
      }
    })

    it('should republish entries', async function () {
      // @ts-expect-error sinon.stub() is not complete publisher implementation
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), {
        initialBroadcastInterval: 200,
        broadcastInterval: 500
      })
      const stub = republisher._republishEntries = sinon.stub()

      await republisher.start()

      expect(stub.calledOnce).to.equal(false)

      // Initial republish should happen after ~200ms
      await delay(300)
      expect(stub.calledOnce).to.equal(true)

      // Subsequent republishes should happen after ~700
      await delay(600)
      expect(stub.calledTwice).to.equal(true)
    })

    it('should not republish self key twice', async function () {
      const mockKeychain = {
        listKeys: () => Promise.resolve([{ name: 'self' }])
      }
      // @ts-expect-error sinon.stub() is not complete publisher implementation
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), mockKeychain, {
        initialBroadcastInterval: 100,
        broadcastInterval: 1000,
        pass: 'pass'
      })
      const stub = republisher._republishEntry = sinon.stub()

      await republisher.start()

      expect(stub.calledOnce).to.equal(false)

      // Initial republish should happen after ~100ms
      await delay(200)
      expect(stub.calledOnce).to.equal(true)
    })

    it('should error if run republish again', async () => {
      // @ts-expect-error sinon.stub() is not complete publisher implementation
      republisher = new IpnsRepublisher(sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), {
        initialBroadcastInterval: 50,
        broadcastInterval: 100
      })
      republisher._republishEntries = sinon.stub()

      await republisher.start()

      await expect(republisher.start())
        .to.eventually.be.rejected()
        .with.property('code').that.equals('ERR_REPUBLISH_ALREADY_RUNNING')
    })
  })

  describe('publisher', () => {
    it('should fail to publish if does not receive private key', () => {
      // @ts-expect-error constructor needs args
      const publisher = new IpnsPublisher()
      // @ts-expect-error invalid argument
      return expect(publisher.publish(null, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_PRIVATE_KEY')
    })

    it('should fail to publish if an invalid private key is received', () => {
      // @ts-expect-error constructor needs args
      const publisher = new IpnsPublisher()
      // @ts-expect-error invalid argument
      return expect(publisher.publish({ bytes: 'not that valid' }, ipfsRef))
        .to.eventually.be.rejected()
        // .that.eventually.has.property('code', 'ERR_INVALID_PRIVATE_KEY') TODO: libp2p-crypto needs to throw err-code
    })

    it('should fail to publish if _updateOrCreateRecord fails', async () => {
      // @ts-expect-error constructor needs args
      const publisher = new IpnsPublisher()
      const err = new Error('error')
      const peerId = await PeerId.create()

      sinon.stub(publisher, '_updateOrCreateRecord').rejects(err)

      // @ts-expect-error invalid argument
      return expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejectedWith(err)
    })

    it('should fail to publish if _putRecordToRouting receives an invalid peer id', () => {
      // @ts-expect-error constructor needs args
      const publisher = new IpnsPublisher()
      // @ts-expect-error invalid argument
      return expect(publisher._putRecordToRouting(undefined, undefined))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_PEER_ID')
    })

    it('should fail to publish if we receive a unexpected error getting from datastore', async () => {
      const routing = {}
      const datastore = {
        get: sinon.stub().rejects(new Error('boom'))
      }
      // @ts-expect-error routing is not complete implementation
      const publisher = new IpnsPublisher(routing, datastore)
      const peerId = await PeerId.create()

      // @ts-expect-error invalid argument
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
      // @ts-expect-error routing is not complete implementation
      const publisher = new IpnsPublisher(routing, datastore)
      const peerId = await PeerId.create()

      // @ts-expect-error invalid argument
      await expect(publisher.publish(peerId.privKey, ipfsRef))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_STORING_IN_DATASTORE')
    })
  })

  describe('resolver', () => {
    it('should resolve an inlined public key', async () => {
      const peerId = await PeerId.create({ keyType: 'Ed25519' })
      const value = `/ipfs/${peerId.toB58String()}`
      const record = await ipns.create(peerId.privKey, uint8ArrayFromString(value), 1, 10e3)

      const routing = {
        get: sinon.stub().returns(ipns.marshal(record))
      }
      // @ts-expect-error routing is not complete implementation
      const resolver = new IpnsResolver(routing)

      const resolved = await resolver.resolve(`/ipns/${peerId.toB58String()}`)
      expect(resolved).to.equal(value)
    })

    it('should fail to resolve if the received name is not a string', () => {
      // @ts-expect-error constructor needs args
      const resolver = new IpnsResolver()
      // @ts-expect-error invalid argument
      return expect(resolver.resolve(false))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_NAME')
    })

    it('should fail to resolve if receives an invalid ipns path', () => {
      // @ts-expect-error constructor needs args
      const resolver = new IpnsResolver()
      return expect(resolver.resolve('ipns/<cid>'))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_NAME')
    })

    it('should fail to resolve if receive error getting from datastore', async () => {
      const routing = {
        get: sinon.stub().rejects(new Error('boom'))
      }
      // @ts-expect-error routing is not complete implementation
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
      // @ts-expect-error routing is not complete implementation
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
      // @ts-expect-error routing is not complete implementation
      const resolver = new IpnsResolver(routing)
      const peerId = await PeerId.create()

      await expect(resolver.resolve(`/ipns/${peerId.toB58String()}`))
        .to.eventually.be.rejected()
        .with.property('code', 'ERR_INVALID_RECORD_RECEIVED')
    })
  })

  describe('routing config', function () {
    it('should use only the offline datastore by default', () => {
      const config = createRouting({
        // @ts-expect-error sinon.stub() is not complete implementation
        libp2p: sinon.stub(),
        // @ts-expect-error sinon.stub() is not complete implementation
        repo: sinon.stub(),
        // @ts-expect-error sinon.stub() is not complete implementation
        peerId: sinon.stub(),
        options: {}
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof OfflineDatastore).to.eql(true)
    })

    it('should use only the offline datastore if offline', () => {
      const config = createRouting({
        // @ts-expect-error sinon.stub() is not complete implementation
        libp2p: sinon.stub(),
        // @ts-expect-error sinon.stub() is not complete implementation
        repo: sinon.stub(),
        // @ts-expect-error sinon.stub() is not complete implementation
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

      const config = createRouting({
        // @ts-expect-error sinon.stub() is not complete implementation
        libp2p: { pubsub: sinon.stub() },
        // @ts-expect-error sinon.stub() is not complete implementation
        repo: { datastore: sinon.stub() },
        peerId,
        options: {
          EXPERIMENTAL: {
            ipnsPubsub: true
          }
        }
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof IpnsPubsubDatastore).to.eql(true)
    })

    it('should use the dht if enabled', () => {
      const dht = sinon.stub()

      const config = createRouting({
        // @ts-expect-error sinon.stub() is not complete implementation
        libp2p: { _dht: dht, _config: { dht: { enabled: true } } },
        // @ts-expect-error sinon.stub() is not complete implementation
        repo: sinon.stub(),
        // @ts-expect-error sinon.stub() is not complete implementation
        peerId: sinon.stub(),
        options: {
          config: {
            Routing: {
              Type: 'dhtclient'
            }
          }
        }
      })

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores).to.have.deep.nested.property('[0]._dht', dht)
    })
  })
})
