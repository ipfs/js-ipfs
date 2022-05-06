/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { peerIdFromString, peerIdFromKeys } from '@libp2p/peer-id'
import { isNode } from 'ipfs-utils/src/env.js'
import * as ipns from 'ipns'
import delay from 'delay'
import last from 'it-last'
import waitFor from '../utils/wait-for.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { ipnsValidator } from 'ipns/validator'

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
 * @typedef {import('@libp2p/interfaces/pubsub').Message} Message
 * @typedef {import('@libp2p/interfaces/events').EventHandler<Message>} EventHandler
 */

/**
 * @param {Factory} factory
 * @param {object} options
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

      await waitFor(async () => {
        const res = await nodeB.swarm.peers()

        return res.map(p => p.peer.toString()).includes(idA.id.toString())
      }, { name: 'node A dialed node B' })
    })

    after(() => factory.clean())

    it('should publish and then resolve correctly', async function () {
      // @ts-expect-error this is mocha
      this.timeout(80 * 1000)

      const routingKey = ipns.peerIdToRoutingKey(idA.id)
      const topic = `${namespace}${uint8ArrayToString(routingKey, 'base64url')}`

      await nodeB.pubsub.subscribe(topic, () => {})
      await nodeA.name.publish(ipfsRef, { resolve: false })
      await delay(1000) // guarantee record is written

      const res = await last(nodeB.name.resolve(idA.id))

      expect(res).to.equal(ipfsRef)
    })

    it('should self resolve, publish and then resolve correctly', async function () {
      // @ts-expect-error this is mocha
      this.timeout(6000)
      const emptyDirCid = '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
      const { path } = await nodeA.add(uint8ArrayFromString('pubsub records'))

      const resolvesEmpty = await last(nodeB.name.resolve(idB.id))
      expect(resolvesEmpty).to.be.eq(emptyDirCid)

      const publish = await nodeB.name.publish(path)
      expect(publish).to.be.eql({
        name: idB.id.toString(),
        value: `/ipfs/${path}`
      })

      const resolveB = await last(nodeB.name.resolve(idB.id))
      expect(resolveB).to.be.eq(`/ipfs/${path}`)
      await delay(1000)
      const resolveA = await last(nodeA.name.resolve(idB.id))
      expect(resolveA).to.be.eq(`/ipfs/${path}`)
    })

    it('should handle event on publish correctly', async function () {
      // @ts-expect-error this is mocha
      this.timeout(80 * 1000)

      const testAccountName = 'test-account'

      /**
       * @type {import('@libp2p/interfaces/pubsub').Message}
       */
      let publishedMessage

      /**
       * @type {EventHandler}
       */
      const checkMessage = (msg) => {
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

      const routingKey = ipns.peerIdToRoutingKey(peerIdFromString(testAccount.id))
      const topic = `${namespace}${uint8ArrayToString(routingKey, 'base64url')}`

      await nodeB.pubsub.subscribe(topic, checkMessage)
      await nodeA.name.publish(ipfsRef, { resolve: false, key: testAccountName })
      await waitFor(alreadySubscribed)

      // @ts-expect-error publishedMessage is set in handler
      if (!publishedMessage) {
        throw new Error('Pubsub handler not invoked')
      }

      const publishedMessageData = ipns.unmarshal(publishedMessage.data)

      if (!publishedMessageData.pubKey) {
        throw new Error('No public key found in message data')
      }

      const messageKey = publishedMessage.from
      const pubKeyPeerId = await peerIdFromKeys(publishedMessageData.pubKey)

      expect(pubKeyPeerId.toString()).not.to.equal(messageKey.toString())
      expect(pubKeyPeerId.toString()).to.equal(testAccount.id)
      expect(publishedMessage.from.toString()).to.equal(idA.id.toString())
      expect(messageKey.toString()).to.equal(idA.id.toString())
      expect(uint8ArrayToString(publishedMessageData.value)).to.equal(ipfsRef)

      // Verify the signature
      await ipnsValidator(ipns.peerIdToRoutingKey(pubKeyPeerId), publishedMessage.data)
    })
  })
}
