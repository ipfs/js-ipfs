/* eslint max-nested-callbacks: ["error", 7] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const sinon = require('sinon')

const fs = require('fs')
const parallel = require('async/parallel')
const series = require('async/series')

const isNode = require('detect-node')
const IPFS = require('../../src')
const ipnsPath = require('../../src/core/ipns/path')
const { Key } = require('interface-datastore')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

const publishAndResolve = (publisher, resolver, ipfsRef, publishOpts, nodeId, resolveOpts, callback) => {
  series([
    (cb) => publisher.name.publish(ipfsRef, publishOpts, cb),
    (cb) => resolver.name.resolve(nodeId, resolveOpts, cb)
  ], (err, res) => {
    expect(err).to.not.exist()
    expect(res[0]).to.exist()
    expect(res[1]).to.exist()
    expect(res[1].path).to.equal(ipfsRef)
    callback()
  })
}

describe('name', function () {
  if (!isNode) {
    return
  }

  describe('working locally', function () {
    let node
    let nodeId
    let ipfsd

    before(function (done) {
      this.timeout(50 * 1000)
      df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`, '--local'],
        config: { Bootstrap: [] }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        node.id().then((res) => {
          expect(res.id).to.exist()

          nodeId = res.id
          done()
        })
      })
    })

    after((done) => ipfsd.stop(done))

    it('should publish and then resolve correctly with the default options', function (done) {
      this.timeout(50 * 1000)

      publishAndResolve(node, node, ipfsRef, { resolve: false }, nodeId, {}, done)
    })

    it('should publish correctly with the lifetime option and resolve', function (done) {
      this.timeout(50 * 1000)

      const publishOpts = {
        resolve: false,
        lifetime: '2h'
      }

      publishAndResolve(node, node, ipfsRef, publishOpts, nodeId, {}, done)
    })

    it('should not get the entry correctly if its validity time expired', function (done) {
      this.timeout(50 * 1000)

      node.name.publish(ipfsRef, { resolve: false, lifetime: '1ms' }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        setTimeout(function () {
          node.name.resolve(nodeId, (err) => {
            expect(err).to.exist()
            done()
          })
        }, 2)
      })
    })

    it('should recursively resolve to an IPFS hash', function (done) {
      this.timeout(90 * 1000)
      const keyName = hat()

      node.key.gen(keyName, { type: 'rsa', size: 2048 }, function (err, key) {
        expect(err).to.not.exist()
        series([
          (cb) => node.name.publish(ipfsRef, { resolve: false }, cb),
          (cb) => node.name.publish(`/ipns/${nodeId}`, { resolve: false, key: keyName }, cb),
          (cb) => node.name.resolve(key.id, { recursive: true }, cb)
        ], (err, res) => {
          expect(err).to.not.exist()
          expect(res[2]).to.exist()
          expect(res[2].path).to.equal(ipfsRef)
          done()
        })
      })
    })

    it('should not recursively resolve to an IPFS hash if the option recursive is not provided', function (done) {
      this.timeout(90 * 1000)
      const keyName = hat()

      node.key.gen(keyName, { type: 'rsa', size: 2048 }, function (err, key) {
        expect(err).to.not.exist()
        series([
          (cb) => node.name.publish(ipfsRef, { resolve: false }, cb),
          (cb) => node.name.publish(`/ipns/${nodeId}`, { resolve: false, key: keyName }, cb),
          (cb) => node.name.resolve(key.id, cb)
        ], (err, res) => {
          expect(err).to.not.exist()
          expect(res[2]).to.exist()
          expect(res[2].path).to.equal(`/ipns/${nodeId}`)
          done()
        })
      })
    })
  })

  describe('republisher', function () {
    if (!isNode) {
      return
    }

    let node
    let ipfsd

    before(function (done) {
      this.timeout(40 * 1000)
      df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`, '--local'],
        config: { Bootstrap: [] }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        done()
      })
    })

    afterEach(() => {
      sinon.restore()
    })

    after((done) => ipfsd.stop(done))

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

  describe('work with dht', () => {
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
          expect(res[2].path).to.equal(ipfsRef)
          done()
        })
      })
    })
  })

  describe('errors', function () {
    if (!isNode) {
      return
    }

    let node
    let nodeId
    let ipfsd

    before(function (done) {
      this.timeout(40 * 1000)
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
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        node.id().then((res) => {
          expect(res.id).to.exist()

          nodeId = res.id
          done()
        })
      })
    })

    after((done) => ipfsd.stop(done))

    it('should error to publish if does not receive private key', function (done) {
      node._ipns.publisher.publish(null, ipfsRef, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_UNDEFINED_PARAMETER')
        done()
      })
    })

    it('should error to publish if an invalid private key is received', function (done) {
      node._ipns.publisher.publish({ bytes: 'not that valid' }, ipfsRef, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should error to publish if _updateOrCreateRecord fails', function (done) {
      const stub = sinon.stub(node._ipns.publisher, '_updateOrCreateRecord').callsArgWith(4, 'error')

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.exist()

        stub.restore()
        done()
      })
    })

    it('should error to publish if _putRecordToRouting receives an invalid peer id', function (done) {
      node._ipns.publisher._putRecordToRouting(undefined, undefined, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should error to publish if receives an invalid datastore key', function (done) {
      const stub = sinon.stub(Key, 'isKey').returns(false)

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_DATASTORE_KEY')

        stub.restore()
        done()
      })
    })

    it('should error to publish if we receive a unexpected error getting from datastore', function (done) {
      const stub = sinon.stub(node._ipns.publisher._datastore, 'get').callsArgWith(1, 'error-unexpected')

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_DETERMINING_PUBLISHED_RECORD')

        stub.restore()
        done()
      })
    })

    it('should error to publish if we receive a unexpected error putting to datastore', function (done) {
      const stub = sinon.stub(node._ipns.publisher._datastore, 'put').callsArgWith(2, 'error-unexpected')

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_STORING_IN_DATASTORE')

        stub.restore()
        done()
      })
    })

    it('should error to resolve if the received name is not a string', function (done) {
      node._ipns.resolver.resolve(false, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PARAMETER')
        done()
      })
    })

    it('should error to resolve if receives an invalid ipns path', function (done) {
      node._ipns.resolver.resolve('ipns/<cid>', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_NAME_SYNTAX')
        done()
      })
    })

    it('should publish and then fail to resolve if receive error getting from datastore', function (done) {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, 'error-unexpected')

      node.name.publish(ipfsRef, { resolve: false }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        node.name.resolve(nodeId, { nocache: true }, (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_UNEXPECTED_ERROR_GETTING_RECORD')
          stub.restore()
          done()
        })
      })
    })

    it('should publish and then fail to resolve if does not find the record', function (done) {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, { code: 'ERR_NOT_FOUND' })

      node.name.publish(ipfsRef, { resolve: false }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        node.name.resolve(nodeId, { nocache: true }, (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_NO_RECORD_FOUND')
          stub.restore()
          done()
        })
      })
    })

    it('should publish and then fail to resolve if does not receive a buffer', function (done) {
      const stub = sinon.stub(node._ipns.resolver._routing, 'get').callsArgWith(1, undefined, 'data')

      node.name.publish(ipfsRef, { resolve: false }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        node.name.resolve(nodeId, { nocache: true }, (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_RECORD_RECEIVED')
          stub.restore()
          done()
        })
      })
    })
  })

  describe('ipns.path', function () {
    const path = 'test/fixtures/planets/solar-system.md'
    const fixture = {
      path,
      content: fs.readFileSync(path)
    }

    let node
    let ipfsd
    let nodeId

    if (!isNode) {
      return
    }

    before(function (done) {
      this.timeout(40 * 1000)
      df.spawn({
        exec: IPFS,
        args: [`--pass ${hat()}`, '--local'],
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
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        node = _ipfsd.api
        ipfsd = _ipfsd

        node.id().then((res) => {
          expect(res.id).to.exist()

          nodeId = res.id
          done()
        })
      })
    })

    after((done) => ipfsd.stop(done))

    it('should resolve an ipfs path correctly', function (done) {
      node.add(fixture, (err, res) => {
        expect(err).to.not.exist()

        node.name.publish(`/ipfs/${res[0].hash}`, (err) => {
          expect(err).to.not.exist()

          ipnsPath.resolvePath(node, `/ipfs/${res[0].hash}`, (err, value) => {
            expect(err).to.not.exist()
            expect(value).to.exist()
            done()
          })
        })
      })
    })

    it('should resolve an ipns path correctly', function (done) {
      node.add(fixture, (err, res) => {
        expect(err).to.not.exist()
        node.name.publish(`/ipfs/${res[0].hash}`, (err) => {
          expect(err).to.not.exist()
          ipnsPath.resolvePath(node, `/ipns/${nodeId}`, (err, value) => {
            expect(err).to.not.exist()
            expect(value).to.exist()
            done()
          })
        })
      })
    })
  })
})
