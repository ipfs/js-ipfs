/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { nanoid } from 'nanoid'
import pushable from 'it-pushable'
import all from 'it-all'
import { waitForPeers, getTopic } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import delay from 'delay'
import { isWebWorker, isNode } from 'ipfs-utils/src/env.js'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import first from 'it-first'
import sinon from 'sinon'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testSubscribe (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.subscribe', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs1
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs2
    /** @type {string} */
    let topic
    /** @type {string[]} */
    let subscribedTopics = []
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs1Id
    /** @type {import('ipfs-core-types/src/root').IDResult} */
    let ipfs2Id

    before(async () => {
      ipfs1 = (await factory.spawn({ ipfsOptions })).api

      // webworkers are not dialable because webrtc is not available
      ipfs2 = (await factory.spawn({ type: isWebWorker ? 'js' : undefined, ipfsOptions })).api

      ipfs1Id = await ipfs1.id()
      ipfs2Id = await ipfs2.id()
    })

    beforeEach(() => {
      topic = getTopic()
      subscribedTopics = [topic]
    })

    afterEach(async () => {
      const nodes = [ipfs1, ipfs2]
      for (let i = 0; i < subscribedTopics.length; i++) {
        const topic = subscribedTopics[i]
        await Promise.all(nodes.map(ipfs => ipfs.pubsub.unsubscribe(topic)))
      }
      subscribedTopics = []
      await delay(100)
    })

    after(() => factory.clean())

    describe('single node', () => {
      it('should subscribe to one topic', async () => {
        const msgStream = pushable()

        await ipfs1.pubsub.subscribe(topic, msg => {
          msgStream.push(msg)
          msgStream.end()
        })

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hi'))

        const msg = await first(msgStream)

        expect(uint8ArrayToString(msg.data)).to.equal('hi')
        expect(msg).to.have.property('seqno')
        expect(msg.seqno).to.be.an.instanceof(Uint8Array)
        expect(msg.topicIDs[0]).to.eq(topic)
        expect(msg).to.have.property('from', ipfs1Id.id)
      })

      it('should subscribe to one topic with options', async () => {
        const msgStream = pushable()

        await ipfs1.pubsub.subscribe(topic, msg => {
          msgStream.push(msg)
          msgStream.end()
        }, {})

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hi'))

        for await (const msg of msgStream) {
          expect(uint8ArrayToString(msg.data)).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(msg.seqno).to.be.an.instanceof(Uint8Array)
          expect(msg.topicIDs[0]).to.eq(topic)
          expect(msg).to.have.property('from', ipfs1Id.id)
        }
      })

      it('should subscribe to topic multiple times with different handlers', async () => {
        const msgStream1 = pushable()
        const msgStream2 = pushable()

        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const handler1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const handler2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, handler1),
          ipfs1.pubsub.subscribe(topic, handler2)
        ])

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hello'))

        const [handler1Msg] = await all(msgStream1)
        expect(uint8ArrayToString(handler1Msg.data)).to.eql('hello')

        const [handler2Msg] = await all(msgStream2)
        expect(uint8ArrayToString(handler2Msg.data)).to.eql('hello')

        await ipfs1.pubsub.unsubscribe(topic, handler1)
        await delay(100)

        // Still subscribed as there is one listener left
        expect(await ipfs1.pubsub.ls()).to.eql([topic])

        await ipfs1.pubsub.unsubscribe(topic, handler2)
        await delay(100)

        // Now all listeners are gone no subscription anymore
        expect(await ipfs1.pubsub.ls()).to.eql([])
      })

      it('should allow discover option to be passed', async () => {
        const msgStream = pushable()

        await ipfs1.pubsub.subscribe(topic, msg => {
          msgStream.push(msg)
          msgStream.end()
        }, { discover: true })

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hi'))

        for await (const msg of msgStream) {
          expect(uint8ArrayToString(msg.data)).to.eql('hi')
        }
      })
    })

    describe('multiple connected nodes', () => {
      before(() => {
        if (ipfs1.pubsub.setMaxListeners) {
          ipfs1.pubsub.setMaxListeners(100)
        }

        if (ipfs2.pubsub.setMaxListeners) {
          ipfs2.pubsub.setMaxListeners(100)
        }

        const ipfs2Addr = ipfs2Id.addresses
          .find(ma => ma.nodeAddress().address === '127.0.0.1')

        if (!ipfs2Addr) {
          throw new Error('No address found')
        }

        return ipfs1.swarm.connect(ipfs2Addr)
      })

      it('should receive messages from a different node with floodsub', async function () {
        if (!isNode) {
          // @ts-ignore this is mocha
          return this.skip()
        }
        const expectedString = 'should receive messages from a different node with floodsub'
        const topic = `floodsub-${nanoid()}`
        const ipfs1 = (await factory.spawn({
          ipfsOptions: {
            config: {
              Pubsub: {
                Router: 'floodsub'
              }
            }
          }
        })).api
        const ipfs1Id = await ipfs1.id()
        const ipfs2 = (await factory.spawn({
          type: isWebWorker ? 'go' : undefined,
          ipfsOptions: {
            config: {
              Pubsub: {
                Router: 'floodsub'
              }
            }
          }
        })).api
        const ipfs2Id = await ipfs2.id()
        await ipfs1.swarm.connect(ipfs2Id.addresses[0])

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        const abort1 = new AbortController()
        const abort2 = new AbortController()
        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1, { signal: abort1.signal }),
          ipfs2.pubsub.subscribe(topic, sub2, { signal: abort2.signal })
        ])

        await waitForPeers(ipfs2, topic, [ipfs1Id.id], 30000)
        await ipfs2.pubsub.publish(topic, uint8ArrayFromString(expectedString))

        const [sub1Msg] = await all(msgStream1)
        expect(uint8ArrayToString(sub1Msg.data)).to.be.eql(expectedString)
        expect(sub1Msg.from).to.eql(ipfs2Id.id)

        const [sub2Msg] = await all(msgStream2)
        expect(uint8ArrayToString(sub2Msg.data)).to.be.eql(expectedString)
        expect(sub2Msg.from).to.eql(ipfs2Id.id)
        abort1.abort()
        abort2.abort()
      })

      it('should receive messages from a different node', async () => {
        const expectedString = 'hello from the other side'

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1Id.id], 30000)
        await delay(5000) // gossipsub need this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331
        await ipfs2.pubsub.publish(topic, uint8ArrayFromString(expectedString))

        const [sub1Msg] = await all(msgStream1)
        expect(uint8ArrayToString(sub1Msg.data)).to.be.eql(expectedString)
        expect(sub1Msg.from).to.eql(ipfs2Id.id)

        const [sub2Msg] = await all(msgStream2)
        expect(uint8ArrayToString(sub2Msg.data)).to.be.eql(expectedString)
        expect(sub2Msg.from).to.eql(ipfs2Id.id)
      })

      it('should round trip a non-utf8 binary buffer', async () => {
        const expectedHex = 'a36161636179656162830103056164a16466666666f4'
        const buffer = uint8ArrayFromString(expectedHex, 'base16')

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1Id.id], 30000)
        await delay(5000) // gossipsub need this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331
        await ipfs2.pubsub.publish(topic, buffer)

        const [sub1Msg] = await all(msgStream1)
        expect(uint8ArrayToString(sub1Msg.data, 'base16')).to.be.eql(expectedHex)
        expect(sub1Msg.from).to.eql(ipfs2Id.id)

        const [sub2Msg] = await all(msgStream2)
        expect(uint8ArrayToString(sub2Msg.data, 'base16')).to.be.eql(expectedHex)
        expect(sub2Msg.from).to.eql(ipfs2Id.id)
      })

      it('should receive multiple messages', async () => {
        const outbox = ['hello', 'world', 'this', 'is', 'pubsub']

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        let sub1Called = 0
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub1 = msg => {
          msgStream1.push(msg)
          sub1Called++
          if (sub1Called === outbox.length) msgStream1.end()
        }

        let sub2Called = 0
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub2 = msg => {
          msgStream2.push(msg)
          sub2Called++
          if (sub2Called === outbox.length) msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1Id.id], 30000)
        await delay(5000) // gossipsub need this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331

        for (let i = 0; i < outbox.length; i++) {
          await ipfs2.pubsub.publish(topic, uint8ArrayFromString(outbox[i]))
        }

        const sub1Msgs = await all(msgStream1)
        sub1Msgs.forEach(msg => expect(msg.from).to.eql(ipfs2Id.id))
        const inbox1 = sub1Msgs.map(msg => uint8ArrayToString(msg.data))
        expect(inbox1.sort()).to.eql(outbox.sort())

        const sub2Msgs = await all(msgStream2)
        sub2Msgs.forEach(msg => expect(msg.from).to.eql(ipfs2Id.id))
        const inbox2 = sub2Msgs.map(msg => uint8ArrayToString(msg.data))
        expect(inbox2.sort()).to.eql(outbox.sort())
      })

      it('should send/receive 100 messages', async function () {
        // @ts-ignore this is mocha
        this.timeout(2 * 60 * 1000)

        const msgBase = 'msg - '
        const count = 100
        const msgStream = pushable()

        let subCalled = 0
        /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
        const sub = msg => {
          msgStream.push(msg)
          subCalled++
          if (subCalled === count) msgStream.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub),
          ipfs2.pubsub.subscribe(topic, () => {})
        ])

        await waitForPeers(ipfs1, topic, [ipfs2Id.id], 30000)
        await delay(5000) // gossipsub need this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331
        const startTime = new Date().getTime()

        for (let i = 0; i < count; i++) {
          const msgData = uint8ArrayFromString(msgBase + i)
          await ipfs2.pubsub.publish(topic, msgData)
        }

        const msgs = await all(msgStream)
        const duration = new Date().getTime() - startTime
        const opsPerSec = Math.floor(count / (duration / 1000))

        // eslint-disable-next-line
        console.log(`Send/Receive 100 messages took: ${duration} ms, ${opsPerSec} ops / s`)

        msgs.forEach(msg => {
          expect(msg.from).to.eql(ipfs2Id.id)
          expect(uint8ArrayToString(msg.data).startsWith(msgBase)).to.be.true()
        })
      })

      it('should receive messages from a different node on lots of topics', async () => {
        // @ts-ignore this is mocha
        this.timeout(5 * 60 * 1000)

        const numTopics = 20
        const topics = []
        const expectedStrings = []
        const msgStreams = []

        for (let i = 0; i < numTopics; i++) {
          const topic = `pubsub-topic-${Math.random()}`
          topics.push(topic)

          const msgStream1 = pushable()
          const msgStream2 = pushable()

          msgStreams.push({
            msgStream1,
            msgStream2
          })

          /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
          const sub1 = msg => {
            msgStream1.push(msg)
            msgStream1.end()
          }
          /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
          const sub2 = msg => {
            msgStream2.push(msg)
            msgStream2.end()
          }

          await Promise.all([
            ipfs1.pubsub.subscribe(topic, sub1),
            ipfs2.pubsub.subscribe(topic, sub2)
          ])

          await waitForPeers(ipfs2, topic, [ipfs1Id.id], 30000)
        }

        await delay(5000) // gossipsub needs this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331

        for (let i = 0; i < numTopics; i++) {
          const expectedString = `hello pubsub ${Math.random()}`
          expectedStrings.push(expectedString)

          await ipfs2.pubsub.publish(topics[i], uint8ArrayFromString(expectedString))
        }

        for (let i = 0; i < numTopics; i++) {
          const [sub1Msg] = await all(msgStreams[i].msgStream1)
          expect(uint8ArrayToString(sub1Msg.data)).to.equal(expectedStrings[i])
          expect(sub1Msg.from).to.eql(ipfs2Id.id)

          const [sub2Msg] = await all(msgStreams[i].msgStream2)
          expect(uint8ArrayToString(sub2Msg.data)).to.equal(expectedStrings[i])
          expect(sub2Msg.from).to.eql(ipfs2Id.id)
        }
      })

      it('should unsubscribe multiple handlers', async () => {
        // @ts-ignore this is mocha
        this.timeout(2 * 60 * 1000)

        const topic = `topic-${Math.random()}`

        const handler1 = sinon.stub()
        const handler2 = sinon.stub()

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sinon.stub()),
          ipfs2.pubsub.subscribe(topic, handler1),
          ipfs2.pubsub.subscribe(topic, handler2)
        ])

        await waitForPeers(ipfs1, topic, [ipfs2Id.id], 30000)

        expect(handler1).to.have.property('callCount', 0)
        expect(handler2).to.have.property('callCount', 0)

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hello world 1'))

        await delay(1000)

        expect(handler1).to.have.property('callCount', 1)
        expect(handler2).to.have.property('callCount', 1)

        await ipfs2.pubsub.unsubscribe(topic)

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hello world 2'))

        await delay(1000)

        expect(handler1).to.have.property('callCount', 1)
        expect(handler2).to.have.property('callCount', 1)
      })

      it('should unsubscribe individual handlers', async () => {
        // @ts-ignore this is mocha
        this.timeout(2 * 60 * 1000)

        const topic = `topic-${Math.random()}`

        const handler1 = sinon.stub()
        const handler2 = sinon.stub()

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sinon.stub()),
          ipfs2.pubsub.subscribe(topic, handler1),
          ipfs2.pubsub.subscribe(topic, handler2)
        ])

        await waitForPeers(ipfs1, topic, [ipfs2Id.id], 30000)

        expect(handler1).to.have.property('callCount', 0)
        expect(handler2).to.have.property('callCount', 0)

        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hello world 1'))

        await delay(1000)

        expect(handler1).to.have.property('callCount', 1)
        expect(handler2).to.have.property('callCount', 1)

        await ipfs2.pubsub.unsubscribe(topic, handler1)
        await ipfs1.pubsub.publish(topic, uint8ArrayFromString('hello world 2'))

        await delay(1000)

        expect(handler1).to.have.property('callCount', 1)
        expect(handler2).to.have.property('callCount', 2)
      })
    })
  })
}
