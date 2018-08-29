/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const retry = require('async/retry')
const series = require('async/series')

const isNode = require('detect-node')
const IPFS = require('../../src')
const { fromB58String } = require('multihashes')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc', exec: IPFS })

const spawnNode = (callback) => {
  df.spawn({
    args: ['--enable-namesys-pubsub', '--enable-pubsub-experiment'],
    disposable: true,
    bits: 512
  }, callback)
}

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name-pubsub', function () {
  if (!isNode) {
    return
  }

  let ipfsA
  let ipfsB
  let nodeAId
  let nodeBId
  let bMultiaddr
  let nodes = []

  // Spawn daemons
  before(function (done) {
    // CI takes longer to instantiate the daemon, so we need to increase the
    // timeout for the before step
    this.timeout(80 * 1000)

    series([
      (cb) => {
        spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfsA = node.api
          nodes.push(node)
          cb()
        })
      },
      (cb) => {
        spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfsB = node.api
          nodes.push(node)
          cb()
        })
      }
    ], done)
  })

  // Get node ids
  before(function (done) {
    parallel([
      (cb) => {
        ipfsA.id((err, res) => {
          expect(err).to.not.exist()
          expect(res.id).to.exist()
          nodeAId = res
          cb()
        })
      },
      (cb) => {
        ipfsB.id((err, res) => {
          expect(err).to.not.exist()
          expect(res.id).to.exist()
          nodeBId = res
          bMultiaddr = res.addresses[0]
          cb()
        })
      }
    ], done)
  })

  // Connect
  before(function (done) {
    this.timeout(60 * 1000)
    ipfsA.swarm.connect(bMultiaddr, done)
  })

  after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

  it('should get enabled state of pubsub', function (done) {
    ipfsA.name.pubsub.state((err, state) => {
      expect(err).to.not.exist()
      expect(state).to.exist()
      expect(state.enabled).to.equal(true)

      done()
    })
  })

  it('should subscribe on resolve', function (done) {
    this.timeout(80 * 1000)

    ipfsB.name.pubsub.subs((err, subs) => {
      expect(err).to.not.exist()
      expect(subs).to.exist()
      expect(subs.strings).to.deep.equal([])

      ipfsB.name.resolve(nodeBId.id, (err) => {
        expect(err).to.not.exist()

        ipfsB.name.pubsub.subs((err, subs) => {
          expect(err).to.not.exist()
          expect(subs).to.exist()
          expect(subs.strings).to.include(`/ipns/${nodeBId.id}`)

          done()
        })
      })
    })
  })

  it('should be able to cancel subscriptions', function (done) {
    this.timeout(80 * 1000)
    const path = `/ipns/${nodeAId.id}`

    ipfsA.name.pubsub.cancel(path, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res.canceled).to.equal(false)

      ipfsA.name.resolve(nodeAId.id, (err) => {
        expect(err).to.not.exist()

        ipfsA.name.pubsub.cancel(path, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.canceled).to.equal(true)

          ipfsA.name.pubsub.subs((err, subs) => {
            expect(err).to.not.exist()
            expect(subs).to.exist()
            expect(subs.strings).to.not.include(path)

            done()
          })
        })
      })
    })
  })

  it('should publish the received record to the subscriber', function (done) {
    this.timeout(80 * 1000)
    const topic = `/ipns/${fromB58String(nodeAId.id).toString()}`

    ipfsB.name.resolve(nodeAId.id, (err, res) => {
      expect(err).to.exist()

      series([
        (cb) => waitForPeerToSubscribe(topic, nodeBId, ipfsA, cb),
        (cb) => ipfsA.name.publish(ipfsRef, { resolve: false }, cb),
        (cb) => ipfsA.name.resolve(nodeAId.id, cb),
        (cb) => ipfsB.name.resolve(nodeAId.id, cb)
      ], (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        expect(res[1].name).to.equal(nodeAId.id) // Published to Node A ID
        expect(res[2].path).to.equal(ipfsRef)
        expect(res[3].path).to.equal(ipfsRef)
        done()
      })
    })
  })
})

// Wait until a peer subscribes a topic
const waitForPeerToSubscribe = (topic, peer, daemon, callback) => {
  retry({
    times: 5,
    interval: 2000
  }, (next) => {
    daemon.pubsub.peers(topic, (error, peers) => {
      if (error) {
        return next(error)
      }

      if (!peers.includes(peer.id)) {
        return next(new Error(`Could not find peer ${peer.id}`))
      }

      return next()
    })
  }, callback)
}
