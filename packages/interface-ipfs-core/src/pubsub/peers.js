/* eslint-env mocha */

import { waitForPeers, getTopic } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import delay from 'delay'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPeers (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.peers', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs1
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs2
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs3
    /** @type {string[]} */
    let subscribedTopics = []
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs2Id
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs3Id

    before(async () => {
      ipfs1 = (await factory.spawn({ ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfs2 = (await factory.spawn({ type: isWebWorker ? 'js' : undefined, ipfsOptions })).api
      ipfs3 = (await factory.spawn({ type: isWebWorker ? 'js' : undefined, ipfsOptions })).api

      ipfs2Id = await ipfs2.id()
      ipfs3Id = await ipfs3.id()

      const ipfs2Addr = ipfs2Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')
      const ipfs3Addr = ipfs3Id.addresses
        .find(ma => ma.nodeAddress().address === '127.0.0.1')

      if (!ipfs2Addr || !ipfs3Addr) {
        throw new Error('Could not find addrs')
      }

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

    after(() => factory.clean())

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

      await waitForPeers(ipfs1, topic, [ipfs2Id.id], 30000)
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

      await waitForPeers(ipfs1, topic, [ipfs2Id.id, ipfs3Id.id], 30000)
    })
  })
}
