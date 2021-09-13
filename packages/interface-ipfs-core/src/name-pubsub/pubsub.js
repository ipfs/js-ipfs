/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import PeerId from 'peer-id'
import { isNode } from 'ipfs-utils/src/env.js'
import * as ipns from 'ipns'
import delay from 'delay'
import last from 'it-last'
import waitFor from '../utils/wait-for.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const namespace = '/record/'
const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

const daemonsOptions = {
  ipfsOptions: {
    EXPERIMENTAL: {
      ipnsPubsub: true
    }
  }
}

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPubsub (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub', () => {
    // TODO make this work in the browser and between daemon and in-proc in nodes
    if (!isNode) return

    let nodes
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeA
    /** @type {import('ipfs-core-types').IPFS} */
    let nodeB
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let idA
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let idB

    before(async function () {
      this.timeout(120 * 1000)

      nodes = await Promise.all([
        factory.spawn({ ...daemonsOptions }),
        factory.spawn({ ...daemonsOptions })
      ])

      nodeA = nodes[0].api
      nodeB = nodes[1].api

      const ids = await Promise.all([
        nodeA.id(),
        nodeB.id()
      ])

      idA = ids[0]
      idB = ids[1]

      await nodeA.swarm.connect(idB.addresses[0])
    })

    after(() => factory.clean())

    it('should publish and then resolve correctly', async function () {
      // @ts-ignore this is mocha
      this.timeout(80 * 1000)

      let subscribed = false

      /**
       * @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn}
       */
      function checkMessage () {
        subscribed = true
      }

      const alreadySubscribed = () => {
        return subscribed === true
      }

      const keys = ipns.getIdKeys(uint8ArrayFromString(idA.id, 'base58btc'))
      const topic = `${namespace}${uint8ArrayToString(keys.routingKey.uint8Array(), 'base64url')}`

      await expect(last(nodeB.name.resolve(idA.id)))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/not found/)

      await waitFor(async () => {
        const res = await nodeA.pubsub.peers(topic)
        return Boolean(res && res.length)
      }, { name: `node A to subscribe to ${topic}` })
      await nodeB.pubsub.subscribe(topic, checkMessage)
      await nodeA.name.publish(ipfsRef, { resolve: false })
      await waitFor(alreadySubscribed)
      await delay(1000) // guarantee record is written

      const res = await last(nodeB.name.resolve(idA.id))

      expect(res).to.equal(ipfsRef)
    })

    it('should self resolve, publish and then resolve correctly', async function () {
      // @ts-ignore this is mocha
      this.timeout(6000)
      const emptyDirCid = '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
      const { path } = await nodeA.add(uint8ArrayFromString('pubsub records'))

      const resolvesEmpty = await last(nodeB.name.resolve(idB.id))
      expect(resolvesEmpty).to.be.eq(emptyDirCid)

      await expect(last(nodeA.name.resolve(idB.id)))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/not found/)

      const publish = await nodeB.name.publish(path)
      expect(publish).to.be.eql({
        name: idB.id,
        value: `/ipfs/${path}`
      })

      const resolveB = await last(nodeB.name.resolve(idB.id))
      expect(resolveB).to.be.eq(`/ipfs/${path}`)
      await delay(1000)
      const resolveA = await last(nodeA.name.resolve(idB.id))
      expect(resolveA).to.be.eq(`/ipfs/${path}`)
    })

    it('should handle event on publish correctly', async function () {
      // @ts-ignore this is mocha
      this.timeout(80 * 1000)

      const testAccountName = 'test-account'

      /**
       * @type {import('ipfs-core-types/src/pubsub').Message}
       */
      let publishedMessage

      /**
       * @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn}
       */
      function checkMessage (msg) {
        publishedMessage = msg
      }

      const alreadySubscribed = () => {
        return Boolean(publishedMessage)
      }

      // Create account for publish
      const testAccount = await nodeA.key.gen(testAccountName, {
        type: 'rsa',
        size: 2048,
        'ipns-base': 'b58mh'
      })

      const keys = ipns.getIdKeys(uint8ArrayFromString(testAccount.id, 'base58btc'))
      const topic = `${namespace}${uint8ArrayToString(keys.routingKey.uint8Array(), 'base64url')}`

      await nodeB.pubsub.subscribe(topic, checkMessage)
      await nodeA.name.publish(ipfsRef, { resolve: false, key: testAccountName })
      await waitFor(alreadySubscribed)

      // @ts-ignore publishedMessage is set in handler
      if (!publishedMessage) {
        throw new Error('Pubsub handler not invoked')
      }

      const publishedMessageData = ipns.unmarshal(publishedMessage.data)

      if (!publishedMessageData.pubKey) {
        throw new Error('No public key found in message data')
      }

      const messageKey = await PeerId.createFromB58String(publishedMessage.from)
      const pubKeyPeerId = await PeerId.createFromPubKey(publishedMessageData.pubKey)

      expect(pubKeyPeerId.toB58String()).not.to.equal(messageKey.toB58String())
      expect(pubKeyPeerId.toB58String()).to.equal(testAccount.id)
      expect(publishedMessage.from).to.equal(idA.id)
      expect(messageKey.toB58String()).to.equal(idA.id)
      expect(uint8ArrayToString(publishedMessageData.value)).to.equal(ipfsRef)

      // Verify the signature
      await ipns.validate(pubKeyPeerId.pubKey, publishedMessageData)
    })
  })
}
