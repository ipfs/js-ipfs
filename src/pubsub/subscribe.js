/* eslint-env mocha */
'use strict'

const pushable = require('it-pushable')
const all = require('it-all')
const { waitForPeers, getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.subscribe', function () {
    this.timeout(80 * 1000)

    let ipfs1
    let ipfs2
    let topic
    let subscribedTopics = []

    before(async () => {
      ipfs1 = (await common.spawn()).api
      // TODO 'multiple connected nodes' tests fails with go in Firefox
      // and JS is flaky everywhere
      ipfs2 = (await common.spawn({ type: 'go' })).api
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

    after(() => common.clean())

    describe('single node', () => {
      it('should subscribe to one topic', async () => {
        const msgStream = pushable()

        await ipfs1.pubsub.subscribe(topic, msg => {
          msgStream.push(msg)
          msgStream.end()
        })

        await ipfs1.pubsub.publish(topic, Buffer.from('hi'))

        for await (const msg of msgStream) {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg.topicIDs[0]).to.eq(topic)
          expect(msg).to.have.property('from', ipfs1.peerId.id)
          break
        }
      })

      it('should subscribe to one topic with options', async () => {
        const msgStream = pushable()

        await ipfs1.pubsub.subscribe(topic, msg => {
          msgStream.push(msg)
          msgStream.end()
        }, {})

        await ipfs1.pubsub.publish(topic, Buffer.from('hi'))

        for await (const msg of msgStream) {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg.topicIDs[0]).to.eq(topic)
          expect(msg).to.have.property('from', ipfs1.peerId.id)
        }
      })

      it('should subscribe to topic multiple times with different handlers', async () => {
        const msgStream1 = pushable()
        const msgStream2 = pushable()

        const handler1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        const handler2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, handler1),
          ipfs1.pubsub.subscribe(topic, handler2)
        ])

        await ipfs1.pubsub.publish(topic, Buffer.from('hello'))

        const [handler1Msg] = await all(msgStream1)
        expect(handler1Msg.data.toString()).to.eql('hello')

        const [handler2Msg] = await all(msgStream2)
        expect(handler2Msg.data.toString()).to.eql('hello')

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

        await ipfs1.pubsub.publish(topic, Buffer.from('hi'))

        for await (const msg of msgStream) {
          expect(msg.data.toString()).to.eql('hi')
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

        const ipfs2Addr = ipfs2.peerId.addresses
          .find(ma => ma.nodeAddress().address === '127.0.0.1')

        return ipfs1.swarm.connect(ipfs2Addr)
      })

      it('should receive messages from a different node', async () => {
        const expectedString = 'hello from the other side'

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        const sub1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        const sub2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000)

        await ipfs2.pubsub.publish(topic, Buffer.from(expectedString))

        const [sub1Msg] = await all(msgStream1)
        expect(sub1Msg.data.toString()).to.be.eql(expectedString)
        expect(sub1Msg.from).to.eql(ipfs2.peerId.id)

        const [sub2Msg] = await all(msgStream2)
        expect(sub2Msg.data.toString()).to.be.eql(expectedString)
        expect(sub2Msg.from).to.eql(ipfs2.peerId.id)
      })

      it('should round trip a non-utf8 binary buffer', async () => {
        const expectedHex = 'a36161636179656162830103056164a16466666666f4'
        const buffer = Buffer.from(expectedHex, 'hex')

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        const sub1 = msg => {
          msgStream1.push(msg)
          msgStream1.end()
        }
        const sub2 = msg => {
          msgStream2.push(msg)
          msgStream2.end()
        }

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000)

        await ipfs2.pubsub.publish(topic, buffer)

        const [sub1Msg] = await all(msgStream1)
        expect(sub1Msg.data.toString('hex')).to.be.eql(expectedHex)
        expect(sub1Msg.from).to.eql(ipfs2.peerId.id)

        const [sub2Msg] = await all(msgStream2)
        expect(sub2Msg.data.toString('hex')).to.be.eql(expectedHex)
        expect(sub2Msg.from).to.eql(ipfs2.peerId.id)
      })

      it('should receive multiple messages', async () => {
        const outbox = ['hello', 'world', 'this', 'is', 'pubsub']

        const msgStream1 = pushable()
        const msgStream2 = pushable()

        const sub1 = msg => {
          msgStream1.push(msg)
          sub1.called++
          if (sub1.called === outbox.length) msgStream1.end()
        }
        sub1.called = 0

        const sub2 = msg => {
          msgStream2.push(msg)
          sub2.called++
          if (sub2.called === outbox.length) msgStream2.end()
        }
        sub2.called = 0

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub1),
          ipfs2.pubsub.subscribe(topic, sub2)
        ])

        await waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000)

        outbox.forEach(msg => ipfs2.pubsub.publish(topic, Buffer.from(msg)))

        const sub1Msgs = await all(msgStream1)
        sub1Msgs.forEach(msg => expect(msg.from).to.eql(ipfs2.peerId.id))
        const inbox1 = sub1Msgs.map(msg => msg.data.toString())
        expect(inbox1.sort()).to.eql(outbox.sort())

        const sub2Msgs = await all(msgStream2)
        sub2Msgs.forEach(msg => expect(msg.from).to.eql(ipfs2.peerId.id))
        const inbox2 = sub2Msgs.map(msg => msg.data.toString())
        expect(inbox2.sort()).to.eql(outbox.sort())
      })

      it('should send/receive 100 messages', async function () {
        this.timeout(2 * 60 * 1000)

        const msgBase = 'msg - '
        const count = 100
        const msgStream = pushable()

        const sub = msg => {
          msgStream.push(msg)
          sub.called++
          if (sub.called === count) msgStream.end()
        }
        sub.called = 0

        await Promise.all([
          ipfs1.pubsub.subscribe(topic, sub),
          ipfs2.pubsub.subscribe(topic, () => {})
        ])

        await waitForPeers(ipfs1, topic, [ipfs2.peerId.id], 30000)

        const startTime = new Date().getTime()

        for (let i = 0; i < count; i++) {
          const msgData = Buffer.from(msgBase + i)
          await ipfs2.pubsub.publish(topic, msgData)
        }

        const msgs = await all(msgStream)
        const duration = new Date().getTime() - startTime
        const opsPerSec = Math.floor(count / (duration / 1000))

        // eslint-disable-next-line
        console.log(`Send/Receive 100 messages took: ${duration} ms, ${opsPerSec} ops / s`)

        msgs.forEach(msg => {
          expect(msg.from).to.eql(ipfs2.peerId.id)
          expect(msg.data.toString().startsWith(msgBase)).to.be.true()
        })
      })
    })
  })
}
