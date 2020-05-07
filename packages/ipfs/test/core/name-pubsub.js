/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { Buffer } = require('buffer')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const base64url = require('base64url')
const { fromB58String } = require('multihashes')
const PeerId = require('peer-id')
const { isNode } = require('ipfs-utils/src/env')
const ipns = require('ipns')
const delay = require('delay')
const last = require('it-last')
const waitFor = require('../utils/wait-for')
const factory = require('../utils/factory')

const namespace = '/record/'
const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name-pubsub', function () {
  const df = factory()
  // TODO make this work in the browser and between daemon and in-proc in nodes
  if (!isNode) return

  let nodes
  let nodeA
  let nodeB
  let idA
  let idB

  before(async function () {
    this.timeout(40 * 1000)

    nodes = await Promise.all([
      df.spawn({ type: 'proc', ipfsOptions: { pass: nanoid(), EXPERIMENTAL: { ipnsPubsub: true } } }),
      df.spawn({ type: 'proc', ipfsOptions: { pass: nanoid(), EXPERIMENTAL: { ipnsPubsub: true } } })
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

  after(() => df.clean())

  it('should publish and then resolve correctly', async function () {
    this.timeout(80 * 1000)

    let subscribed = false

    function checkMessage (msg) {
      subscribed = true
    }

    const alreadySubscribed = () => {
      return subscribed === true
    }

    const keys = ipns.getIdKeys(fromB58String(idA.id))
    const topic = `${namespace}${base64url.encode(keys.routingKey.toBuffer())}`

    await expect(last(nodeB.name.resolve(idA.id)))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NO_RECORD_FOUND')

    await waitFor(async () => {
      const res = await nodeA.pubsub.peers(topic)
      return res && res.length
    }, { name: `node A to subscribe to ${topic}` })
    await nodeB.pubsub.subscribe(topic, checkMessage)
    await nodeA.name.publish(ipfsRef, { resolve: false })
    await waitFor(alreadySubscribed)
    await delay(1000) // guarantee record is written

    const res = await last(nodeB.name.resolve(idA.id))

    expect(res).to.equal(ipfsRef)
  })

  it('should self resolve, publish and then resolve correctly', async function () {
    this.timeout(6000)
    const emptyDirCid = '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
    const { path } = await last(nodeA.add(Buffer.from('pubsub records')))

    const resolvesEmpty = await last(nodeB.name.resolve(idB.id))
    expect(resolvesEmpty).to.be.eq(emptyDirCid)

    await expect(last(nodeA.name.resolve(idB.id)))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NO_RECORD_FOUND')

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
    const messageKey = await PeerId.createFromPubKey(publishedMessage.key)
    const pubKeyPeerId = await PeerId.createFromPubKey(publishedMessageData.pubKey)

    expect(pubKeyPeerId.toB58String()).not.to.equal(messageKey.toB58String())
    expect(pubKeyPeerId.toB58String()).to.equal(testAccount.id)
    expect(publishedMessage.from).to.equal(idA.id)
    expect(messageKey.toB58String()).to.equal(idA.id)
    expect(publishedMessageDataValue).to.equal(ipfsRef)

    // Verify the signature
    await ipns.validate(pubKeyPeerId._pubKey, publishedMessageData)
  })
})
