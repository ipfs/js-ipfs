/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
const parallel = require('async/parallel')
const series = require('async/series')
const waterfall = require('async/waterfall')
const API = require('ipfs-api')
const bl = require('bl')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const isNode = require('detect-node')
const IPFSFactory = require('../utils/ipfs-factory-instance')
const crypto = require('crypto')

chai.use(dirtyChai)

function peerInfoFromObj (obj, callback) {
  waterfall([
    (cb) => PeerInfo.create(PeerId.createFromB58String(obj.id), cb),
    (peer, cb) => {
      obj.addresses.forEach((a) => peer.multiaddrs.add(multiaddr(a)))
      cb(null, peer)
    }
  ], callback)
}

describe('circuit', function () {
  this.timeout(20 * 1000)

  let factory

  let jsRelay = new API(`/ip4/127.0.0.1/tcp/31015`)
  // let goRelay = new API(`/ip4/127.0.0.1/tcp/33031`)
  let node1
  let node2

  let jsRelayId
  let goRelayId

  // let nodeId1
  let nodeId2

  before(function (done) {
    factory = new IPFSFactory()

    parallel([
      (cb) => factory.spawnNode(null, {
        EXPERIMENTAL: {
          Relay: {
            Enabled: true
          }
        },
        Addresses:
          {
            Swarm: [
              (isNode ? `/ip4/127.0.0.1/tcp/0` : '')
            ]
          }
      }, cb),
      (cb) => factory.spawnNode(null, {
        EXPERIMENTAL: {
          Relay: {
            Enabled: true
          }
        },
        Addresses:
          {
            Swarm: [
              (isNode ? `/ip4/127.0.0.1/tcp/0/ws` : '')
            ]
          }
      }, cb)
    ], (err, res1) => {
      expect(err).to.not.exist()
      node1 = res1[0]
      node2 = res1[1]
      parallel([
        (cb) => jsRelay.id(cb),
        // (cb) => goRelay.id(cb),
        (cb) => node1.id(cb),
        (cb) => node2.id(cb)
      ], (err, res2) => {
        expect(err).to.not.exist()
        parallel([
          (cb) => peerInfoFromObj(res2[0], cb),
          // (cb) => peerInfoFromObj(res2[1], cb),
          (cb) => peerInfoFromObj(res2[1], cb),
          (cb) => peerInfoFromObj(res2[2], cb)
        ], (err, res3) => {
          expect(err).to.not.exist()
          jsRelayId = res3[0]
          // goRelayId = res3[1]
          // nodeId1 = res3[2]
          nodeId2 = res3[2]
          done()
        })
      })
    })
  })

  after((done) => factory.dismantle(done))

  // TODO: figure out why this test hangs randomly
  it.skip('node1 <-> goRelay <-> node2', function (done) {
    const data = crypto.randomBytes(128)
    series([
      (cb) => node1.swarm.connect(goRelayId, cb),
      (cb) => setTimeout(cb, 2000),
      (cb) => node2.swarm.connect(goRelayId, cb),
      (cb) => setTimeout(cb, 2000),
      (cb) => node1.swarm.connect(nodeId2, cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => node1.files.add(data, cb),
        (res, cb) => node2.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('node1 <-> jsRelay <-> node2', function (done) {
    const data = crypto.randomBytes(128)
    series([
      (cb) => node1.swarm.connect(jsRelayId, cb),
      (cb) => setTimeout(cb, 2000),
      (cb) => node2.swarm.connect(jsRelayId, cb),
      (cb) => setTimeout(cb, 2000),
      (cb) => node1.swarm.connect(nodeId2, cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => node1.files.add(data, cb),
        (res, cb) => node2.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })
})
