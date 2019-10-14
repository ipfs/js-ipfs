/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const base64url = require('base64url')
const { fromB58String } = require('multihashes')
const peerId = require('peer-id')
const isNode = require('detect-node')
const ipns = require('ipns')
const IPFS = require('../../src')
const waitFor = require('../utils/wait-for')
const delay = require('delay')
const promisify = require('promisify-es6')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'proc',
  IpfsClient: require('ipfs-http-client')
})

const namespace = '/record/'
const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name-pubsub', function () {
  if (!isNode) {
    return
  }

  let nodes
  let nodeA
  let nodeB
  let idA
  let idB

  const createNode = () => df.spawn({
    exec: IPFS,
    args: ['--pass', hat(), '--enable-namesys-pubsub'],
    config: {
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    },
    preload: { enabled: false }
  })

  before(async function () {
    this.timeout(40 * 1000)

    nodes = await Promise.all([
      createNode(),
      createNode()
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

  after(() => Promise.all(nodes.map((node) => node.stop())))

  it('should publish and then resolve correctly', async function () {
    this.timeout(80 * 1000)

    let subscribed = false

    function checkMessage (msg) {
      subscribed = true
    }

    const alreadySubscribed = () => {
      return subscribed === true
    }

    // Wait until a peer subscribes a topic
    const waitForPeerToSubscribe = async (node, topic) => {
      for (let i = 0; i < 5; i++) {
        const res = await node.pubsub.peers(topic)

        if (res && res.length) {
          return
        }

        await delay(2000)
      }

      throw new Error(`Could not find subscription for topic ${topic}`)
    }

    const keys = ipns.getIdKeys(fromB58String(idA.id))
    const topic = `${namespace}${base64url.encode(keys.routingKey.toBuffer())}`

    await expect(nodeB.name.resolve(idA.id))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NO_RECORD_FOUND')

    await waitForPeerToSubscribe(nodeA, topic)
    await nodeB.pubsub.subscribe(topic, checkMessage)
    await nodeA.name.publish(ipfsRef, { resolve: false })
    await waitFor(alreadySubscribed)
    await delay(1000) // guarantee record is written

    const res = await nodeB.name.resolve(idA.id)

    expect(res).to.equal(ipfsRef)
  })

  it('should self resolve, publish and then resolve correctly', async function () {
    this.timeout(6000)
    const emptyDirCid = '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
    const [{ path }] = await nodeA.add(Buffer.from('pubsub records'))

    const resolvesEmpty = await nodeB.name.resolve(idB.id)
    expect(resolvesEmpty).to.be.eq(emptyDirCid)

    await expect(nodeA.name.resolve(idB.id))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NO_RECORD_FOUND')

    const publish = await nodeB.name.publish(path)
    expect(publish).to.be.eql({
      name: idB.id,
      value: `/ipfs/${path}`
    })

    const resolveB = await nodeB.name.resolve(idB.id)
    expect(resolveB).to.be.eq(`/ipfs/${path}`)
    await delay(5000)
    const resolveA = await nodeA.name.resolve(idB.id)
    expect(resolveA).to.be.eq(`/ipfs/${path}`)
  })

  it('should handle event on publish correctly', async function () {
    this.timeout(80 * 1000)

    const testAccountName = 'test-account'

    let publishedMessage = null
    let publishedMessageData = null
    let publishedMessageDataValue = null

    function checkMessage (msg) {
      publishedMessage = msg
      publishedMessageData = ipns.unmarshal(msg.data)
      publishedMessageDataValue = publishedMessageData.value.toString('utf8')
    }

    const alreadySubscribed = () => {
      return publishedMessage !== null
    }

    // Create account for publish
    const testAccount = await nodeA.key.gen(testAccountName, {
      type: 'rsa',
      size: 2048
    })

    const keys = ipns.getIdKeys(fromB58String(testAccount.id))
    const topic = `${namespace}${base64url.encode(keys.routingKey.toBuffer())}`

    await nodeB.pubsub.subscribe(topic, checkMessage)
    await nodeA.name.publish(ipfsRef, { resolve: false, key: testAccountName })
    await waitFor(alreadySubscribed)
    const messageKey = await promisify(peerId.createFromPubKey)(publishedMessage.key)
    const pubKeyPeerId = await promisify(peerId.createFromPubKey)(publishedMessageData.pubKey)

    expect(pubKeyPeerId.toB58String()).not.to.equal(messageKey.toB58String())
    expect(pubKeyPeerId.toB58String()).to.equal(testAccount.id)
    expect(publishedMessage.from).to.equal(idA.id)
    expect(messageKey.toB58String()).to.equal(idA.id)
    expect(publishedMessageDataValue).to.equal(ipfsRef)

    // Verify the signature
    await ipns.validate(pubKeyPeerId._pubKey, publishedMessageData)
  })
})
