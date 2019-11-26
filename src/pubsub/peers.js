/* eslint-env mocha */
'use strict'

const { waitForPeers, getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.peers', function () {
    this.timeout(80 * 1000)

    let ipfs1
    let ipfs2
    let ipfs3
    let subscribedTopics = []

    before(async () => {
      ipfs1 = await common.setup()
      ipfs2 = await common.setup()
      ipfs3 = await common.setup()

      const ipfs2Addr = ipfs2.peerId.addresses.find((a) => a.includes('127.0.0.1'))
      const ipfs3Addr = ipfs3.peerId.addresses.find((a) => a.includes('127.0.0.1'))

      await ipfs1.swarm.connect(ipfs2Addr)
      await ipfs1.swarm.connect(ipfs3Addr)
      await ipfs2.swarm.connect(ipfs3Addr)
    })

    afterEach(async () => {
      const nodes = [ipfs1, ipfs2, ipfs3]
      for (let i = 0; i < subscribedTopics.length; i++) {
        const topic = subscribedTopics[i]
        await Promise.all(nodes.map(ipfs => ipfs.pubsub.unsubscribe(topic)))
      }
      subscribedTopics = []
      await delay(100)
    })

    after(() => common.teardown())

    it('should not error when not subscribed to a topic', async () => {
      const topic = getTopic()
      const peers = await ipfs1.pubsub.peers(topic)
      expect(peers).to.exist()
      // Should be empty() but as mentioned below go-ipfs returns more than it should
      // expect(peers).to.be.empty()
    })

    it('should not return extra peers', async () => {
      // Currently go-ipfs returns peers that have not been
      // subscribed to the topic. Enable when go-ipfs has been fixed
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}

      const topic = getTopic()
      const topicOther = topic + 'different topic'

      subscribedTopics = [topic, topicOther]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topicOther, sub2)
      await ipfs3.pubsub.subscribe(topicOther, sub3)

      const peers = await ipfs1.pubsub.peers(topic)
      expect(peers).to.be.empty()
    })

    it('should return peers for a topic - one peer', async () => {
      // Currently go-ipfs returns peers that have not been
      // subscribed to the topic. Enable when go-ipfs has been fixed
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForPeers(ipfs1, topic, [ipfs2.peerId.id], 30000)
    })

    it('should return peers for a topic - multiple peers', async () => {
      const sub1 = () => {}
      const sub2 = () => {}
      const sub3 = () => {}
      const topic = getTopic()

      subscribedTopics = [topic]

      await ipfs1.pubsub.subscribe(topic, sub1)
      await ipfs2.pubsub.subscribe(topic, sub2)
      await ipfs3.pubsub.subscribe(topic, sub3)

      await waitForPeers(ipfs1, topic, [ipfs2.peerId.id, ipfs3.peerId.id], 30000)
    })
  })
}
