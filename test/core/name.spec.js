/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name', function () {
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
      args: [`--pass ${hat()}`]
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

  it('should publish correctly with the default options', function (done) {
    node.name.publish(ipfsRef, { resolve: false }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res.name).to.equal(nodeId)
      done()
    })
  })

  it('should publish and then resolve correctly with the default options', function (done) {
    node.name.publish(ipfsRef, { resolve: false }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      node.name.resolve(nodeId, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res.path).to.equal(ipfsRef)
        done()
      })
    })
  })

  it('should publish correctly with the lifetime option and resolve', function (done) {
    node.name.publish(ipfsRef, { resolve: false, lifetime: '2h' }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      node.name.resolve(nodeId, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res.path).to.equal(ipfsRef)
        done()
      })
    })
  })

  it('should not get the entry correctly if its validity time expired', function (done) {
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
    this.timeout(80 * 1000)
    const keyName = hat()

    node.key.gen(keyName, { type: 'rsa', size: 2048 }, function (err, key) {
      expect(err).to.not.exist()

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.not.exist()

        node.name.publish(`/ipns/${nodeId}`, { resolve: false, key: keyName }, (err) => {
          expect(err).to.not.exist()

          node.name.resolve(key.id, { recursive: true }, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res.path).to.equal(ipfsRef)
            done()
          })
        })
      })
    })
  })

  it('should not recursively resolve to an IPFS hash if the option recursive is not provided', function (done) {
    this.timeout(80 * 1000)
    const keyName = hat()

    node.key.gen(keyName, { type: 'rsa', size: 2048 }, function (err, key) {
      expect(err).to.not.exist()

      node.name.publish(ipfsRef, { resolve: false }, (err) => {
        expect(err).to.not.exist()

        node.name.publish(`/ipns/${nodeId}`, { resolve: false, key: keyName }, (err) => {
          expect(err).to.not.exist()

          node.name.resolve(key.id, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res.path).to.equal(`/ipns/${nodeId}`)
            done()
          })
        })
      })
    })
  })
})
