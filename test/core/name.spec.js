/* eslint max-nested-callbacks: ["error", 7] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const sinon = require('sinon')

const parallel = require('async/parallel')
const series = require('async/series')

const IPFS = require('../../src')
const ipnsPath = require('../../src/core/ipns/path')
const ipnsRouting = require('../../src/core/ipns/routing/config')
const OfflineDatastore = require('../../src/core/ipns/routing/offline-datastore')
const PubsubDatastore = require('../../src/core/ipns/routing/pubsub-datastore')
const { Key, Errors } = require('interface-datastore')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'proc',
  IpfsClient: require('ipfs-http-client')
})

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

const publishAndResolve = (publisher, resolver, ipfsRef, publishOpts, nodeId, resolveOpts, callback) => {
  series([
    (cb) => publisher.name.publish(ipfsRef, publishOpts, cb),
    (cb) => resolver.name.resolve(nodeId, resolveOpts, cb)
  ], (err, res) => {
    expect(err).to.not.exist()
    expect(res[0]).to.exist()
    expect(res[1]).to.exist()
    expect(res[1]).to.equal(ipfsRef)
    callback()
  })
}

describe('name', function () {
  describe('republisher', function () {
    this.timeout(40 * 1000)
    let node
    let ipfsd

    before(async function () {
      ipfsd = await df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`, '--offline'],
        config: { Bootstrap: [] },
        preload: { enabled: false }
      })
      node = ipfsd.api
    })

    afterEach(() => {
      sinon.restore()
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

    it('should republish entries after 60 seconds', function (done) {
      this.timeout(120 * 1000)
      sinon.spy(node._ipns.republisher, '_republishEntries')

      setTimeout(function () {
        expect(node._ipns.republisher._republishEntries.calledOnce).to.equal(true)
        done()
      }, 60 * 1000)
    })

    it('should error if run republish again', function (done) {
      this.timeout(120 * 1000)
      sinon.spy(node._ipns.republisher, '_republishEntries')

      try {
        node._ipns.republisher.start()
      } catch (err) {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_REPUBLISH_ALREADY_RUNNING') // already runs when starting
        done()
      }
    })
  })

  // TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
  describe.skip('work with dht', () => {
    let nodes
    let nodeA
    let nodeB
    let nodeC
    let idA

    const createNode = (callback) => {
      df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`],
        config: {
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          }
        }
      }, callback)
    }

    before(function (done) {
      this.timeout(70 * 1000)

      parallel([
        (cb) => createNode(cb),
        (cb) => createNode(cb),
        (cb) => createNode(cb)
      ], (err, _nodes) => {
        expect(err).to.not.exist()

        nodes = _nodes
        nodeA = _nodes[0].api
        nodeB = _nodes[1].api
        nodeC = _nodes[2].api

        parallel([
          (cb) => nodeA.id(cb),
          (cb) => nodeB.id(cb)
        ], (err, ids) => {
          expect(err).to.not.exist()

          idA = ids[0]
          parallel([
            (cb) => nodeC.swarm.connect(ids[0].addresses[0], cb), // C => A
            (cb) => nodeC.swarm.connect(ids[1].addresses[0], cb), // C => B
            (cb) => nodeA.swarm.connect(ids[1].addresses[0], cb) // A => B
          ], done)
        })
      })
    })

    after(function (done) {
      this.timeout(80 * 1000)

      parallel(nodes.map((node) => (cb) => node.stop(cb)), done)
    })

    it('should publish and then resolve correctly with the default options', function (done) {
      this.timeout(380 * 1000)
      publishAndResolve(nodeA, nodeB, ipfsRef, { resolve: false }, idA.id, {}, done)
    })

    it('should recursively resolve to an IPFS hash', function (done) {
      this.timeout(360 * 1000)
      const keyName = hat()

      nodeA.key.gen(keyName, { type: 'rsa', size: 2048 }, function (err, key) {
        expect(err).to.not.exist()
        series([
          (cb) => nodeA.name.publish(ipfsRef, { resolve: false }, cb),
          (cb) => nodeA.name.publish(`/ipns/${idA.id}`, { resolve: false, key: keyName }, cb),
          (cb) => nodeB.name.resolve(key.id, { recursive: true }, cb)
        ], (err, res) => {
          expect(err).to.not.exist()
          expect(res[2]).to.exist()
          expect(res[2]).to.equal(ipfsRef)
          done()
        })
      })
    })
  })

  describe('errors', function () {
    let node
    let nodeId
    let ipfsd

    before(async function () {
      this.timeout(40 * 1000)
      ipfsd = await df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`],
        config: {
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          }
        },
        preload: { enabled: false }
      })
      node = ipfsd.api

      const res = await node.id()
      nodeId = res.id
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

    it('should error to publish if does not receive private key', function () {
      return node._ipns.publisher.publish(null, ipfsRef)
        .then(() => expect.fail('should have thrown when private key was missing'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_PRIVATE_KEY')
        })
    })

    it('should error to publish if an invalid private key is received', function () {
      return node._ipns.publisher.publish({ bytes: 'not that valid' }, ipfsRef)
        .then(() => expect.fail('should have thrown when private key was invalid'), (err) => {
          expect(err).to.exist()
        })
    })

    it('should error to publish if _updateOrCreateRecord fails', function () {
      const stub = sinon.stub(node._ipns.publisher, '_updateOrCreateRecord').callsArgWith(4, 'error')

      return node.name.publish(ipfsRef, { resolve: false })
        .then(() => expect.fail('should have thrown when _updateOrCreateRecord fails'), (err) => {
          expect(err).to.exist()

          stub.restore()
        })
    })

    it('should error to publish if _putRecordToRouting receives an invalid peer id', function () {
      return node._ipns.publisher._putRecordToRouting(undefined, undefined)
        .then(() => expect.fail('should have thrown if peer id was invalid'), (err) => {
          expect(err).to.exist()
        })
    })

    it('should error to publish if receives an invalid datastore key', function () {
      const stub = sinon.stub(Key, 'isKey').returns(false)

      return node.name.publish(ipfsRef, { resolve: false })
        .then(() => expect.fail('should have thrown if datastore key was invalid'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_DATASTORE_KEY')

          stub.restore()
        })
    })

    it('should error to publish if we receive a unexpected error getting from datastore', function () {
      const stub = sinon.stub(node._ipns.publisher._datastore, 'get').callsArgWith(1, 'error-unexpected')

      return node.name.publish(ipfsRef, { resolve: false })
        .then(() => expect.fail('should have thrown if an unexpected error was received when getting from the datastore'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_DETERMINING_PUBLISHED_RECORD')

          stub.restore()
        })
    })

    it('should error to publish if we receive a unexpected error putting to datastore', function () {
      const stub = sinon.stub(node._ipns.publisher._datastore, 'put').callsArgWith(2, 'error-unexpected')

      return node.name.publish(ipfsRef, { resolve: false })
        .then(() => expect.fail('should have thrown if an unexpected error was received when putting to the datastore'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_STORING_IN_DATASTORE')

          stub.restore()
        })
    })

    it('should error to resolve if the received name is not a string', function () {
      return node._ipns.resolver.resolve(false)
        .then(() => expect.fail('should have thrown if the received name is not a string'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_NAME')
        })
    })

    it('should error to resolve if receives an invalid ipns path', function () {
      return node._ipns.resolver.resolve('ipns/<cid>')
        .then(() => expect.fail('should have thrown if the IPNS path was invalid'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_NAME')
        })
    })

    it('should publish and then fail to resolve if receive error getting from datastore', async function () {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, 'error-unexpected')

      await node.name.publish(ipfsRef, { resolve: false })

      return node.name.resolve(nodeId, { nocache: true })
        .then(() => expect.fail('should have thrown when an invalid response was received from the datastore'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_UNEXPECTED_ERROR_GETTING_RECORD')
          stub.restore()
        })
    })

    it('should publish and then fail to resolve if does not find the record', async function () {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, { code: Errors.notFoundError().code })

      await node.name.publish(ipfsRef, { resolve: false })

      return node.name.resolve(nodeId, { nocache: true })
        .then(() => expect.fail('should have thrown when failing to find the record after publish'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_UNEXPECTED_ERROR_GETTING_RECORD')
          stub.restore()
        })
    })

    it('should publish and then fail to resolve if does not receive a buffer', async function () {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, undefined, 'data')

      await node.name.publish(ipfsRef, { resolve: false })

      return node.name.resolve(nodeId, { nocache: true })
        .then(() => expect.fail('should have thrown if a buffer was not recieved'), (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_UNEXPECTED_ERROR_GETTING_RECORD')
          stub.restore()
        })
    })
  })

  describe('ipns.path', function () {
    const fixture = {
      path: 'test/fixtures/planets/solar-system.md',
      content: Buffer.from('ipns.path')
    }

    let node
    let ipfsd
    let nodeId

    before(async function () {
      this.timeout(40 * 1000)
      ipfsd = await df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`, '--offline'],
        config: {
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          }
        },
        preload: { enabled: false }
      })
      node = ipfsd.api

      const res = await node.id()
      nodeId = res.id
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

    it('should resolve an ipfs path correctly', async function () {
      const res = await node.add(fixture)

      await node.name.publish(`/ipfs/${res[0].hash}`)

      const value = await ipnsPath.resolvePath(node, `/ipfs/${res[0].hash}`)

      expect(value).to.exist()
    })

    it('should resolve an ipns path correctly', async function () {
      const res = await node.add(fixture)
      await node.name.publish(`/ipfs/${res[0].hash}`)
      const value = await ipnsPath.resolvePath(node, `/ipns/${nodeId}`)

      expect(value).to.exist()
    })
  })

  describe('ipns.routing', function () {
    it('should use only the offline datastore by default', function (done) {
      const ipfs = {}
      const config = ipnsRouting(ipfs)

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof OfflineDatastore).to.eql(true)

      done()
    })

    it('should use only the offline datastore if offline', function (done) {
      const ipfs = {
        _options: {
          offline: true
        }
      }
      const config = ipnsRouting(ipfs)

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0] instanceof OfflineDatastore).to.eql(true)

      done()
    })

    it('should use the pubsub datastore if enabled', function (done) {
      const ipfs = {
        libp2p: {
          pubsub: {}
        },
        _peerInfo: {
          id: {}
        },
        _repo: {
          datastore: {}
        },
        _options: {
          EXPERIMENTAL: {
            ipnsPubsub: true
          }
        }
      }
      const config = ipnsRouting(ipfs)

      expect(config.stores).to.have.lengthOf(2)
      expect(config.stores[0] instanceof PubsubDatastore).to.eql(true)
      expect(config.stores[1] instanceof OfflineDatastore).to.eql(true)

      done()
    })

    it('should use the dht if enabled', function (done) {
      const dht = {}

      const ipfs = {
        libp2p: {
          dht
        },
        _peerInfo: {
          id: {}
        },
        _repo: {
          datastore: {}
        },
        _options: {
          libp2p: {
            config: {
              dht: {
                enabled: true
              }
            }
          }
        }
      }

      const config = ipnsRouting(ipfs)

      expect(config.stores).to.have.lengthOf(1)
      expect(config.stores[0]).to.eql(dht)

      done()
    })
  })
})
