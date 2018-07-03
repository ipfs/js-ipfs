/* eslint-env mocha */
'use strict'

const parallel = require('async/parallel')
const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { waitForPeers, getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.peers', function () {
    this.timeout(80 * 1000)

    let ipfs1
    let ipfs2
    let ipfs3

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        if (err) return done(err)

        spawnNodesWithId(3, factory, (err, nodes) => {
          if (err) return done(err)

          ipfs1 = nodes[0]
          ipfs2 = nodes[1]
          ipfs3 = nodes[2]

          done()
        })
      })
    })

    after((done) => common.teardown(done))

    before((done) => {
      const ipfs2Addr = ipfs2.peerId.addresses.find((a) => a.includes('127.0.0.1'))
      const ipfs3Addr = ipfs3.peerId.addresses.find((a) => a.includes('127.0.0.1'))

      parallel([
        (cb) => connect(ipfs1, [ipfs2Addr, ipfs3Addr], cb),
        (cb) => connect(ipfs2, ipfs3Addr, cb)
      ], done)
    })

    it('should not error when not subscribed to a topic', (done) => {
      const topic = getTopic()
      ipfs1.pubsub.peers(topic, (err, peers) => {
        expect(err).to.not.exist()
        // Should be empty() but as mentioned below go-ipfs returns more than it should
        // expect(peers).to.be.empty()

        done()
      })
    })

    it('should not return extra peers', (done) => {
      // Currently go-ipfs returns peers that have not been
      // subscribed to the topic. Enable when go-ipfs has been fixed
      const sub1 = (msg) => {}
      const sub2 = (msg) => {}
      const sub3 = (msg) => {}

      const topic = getTopic()
      const topicOther = topic + 'different topic'

      series([
        (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
        (cb) => ipfs2.pubsub.subscribe(topicOther, sub2, cb),
        (cb) => ipfs3.pubsub.subscribe(topicOther, sub3, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs1.pubsub.peers(topic, (err, peers) => {
          expect(err).to.not.exist()
          expect(peers).to.be.empty()

          parallel([
            (cb) => ipfs1.pubsub.unsubscribe(topic, sub1, cb),
            (cb) => ipfs2.pubsub.unsubscribe(topicOther, sub2, cb),
            (cb) => ipfs3.pubsub.unsubscribe(topicOther, sub3, cb)
          ], done)
        })
      })
    })

    it('should return peers for a topic - one peer', (done) => {
      // Currently go-ipfs returns peers that have not been
      // subscribed to the topic. Enable when go-ipfs has been fixed
      const sub1 = (msg) => {}
      const sub2 = (msg) => {}
      const sub3 = (msg) => {}
      const topic = getTopic()

      series([
        (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
        (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
        (cb) => ipfs3.pubsub.subscribe(topic, sub3, cb),
        (cb) => waitForPeers(ipfs1, topic, [ipfs2.peerId.id], 30000, cb)
      ], (err) => {
        expect(err).to.not.exist()

        parallel([
          (cb) => ipfs1.pubsub.unsubscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.unsubscribe(topic, sub2, cb),
          (cb) => ipfs3.pubsub.unsubscribe(topic, sub3, cb)
        ], done)
      })
    })

    it('should return peers for a topic - multiple peers', (done) => {
      const sub1 = (msg) => {}
      const sub2 = (msg) => {}
      const sub3 = (msg) => {}
      const topic = getTopic()

      series([
        (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
        (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
        (cb) => ipfs3.pubsub.subscribe(topic, sub3, cb),
        (cb) => waitForPeers(ipfs1, topic, [
          ipfs2.peerId.id,
          ipfs3.peerId.id
        ], 30000, cb)
      ], (err) => {
        expect(err).to.not.exist()

        parallel([
          (cb) => ipfs1.pubsub.unsubscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.unsubscribe(topic, sub2, cb),
          (cb) => ipfs3.pubsub.unsubscribe(topic, sub3, cb)
        ], done)
      })
    })
  })
}
