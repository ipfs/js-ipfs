/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const delay = require('delay')
const hat = require('hat')
const ipfsExec = require('../utils/ipfs-exec')
const factory = require('../utils/factory')

describe('pubsub', function () {
  this.timeout(80 * 1000)
  const df = factory()
  let ipfsdA
  let ipfsdB
  let cli

  const topicA = hat()
  const topicB = hat()
  const topicC = hat()

  before(async function () {
    ipfsdA = await df.spawn({ type: 'proc' })
  })

  before(async () => {
    ipfsdB = await df.spawn({ type: 'js' })
  })

  after(() => {
    if (ipfsdA) {
      return ipfsdA.stop()
    }
  })

  after(() => {
    if (ipfsdB) {
      return ipfsdB.stop()
    }
  })

  before(() => {
    cli = ipfsExec(ipfsdB.path)
  })

  it('subscribe and publish', async () => {
    const sub = cli(`pubsub sub ${topicA}`)

    try {
      const msgPromise = new Promise(resolve => sub.stdout.on('data', resolve))
      await delay(1000)

      const out = await cli(`pubsub pub ${topicA} world`)
      expect(out).to.be.eql('')

      const data = await msgPromise
      expect(data.toString().trim()).to.be.eql('world')
    } finally {
      await kill(sub)
    }
  })

  it('ls', async function () {
    this.timeout(80 * 1000)
    const sub = cli(`pubsub sub ${topicB}`)

    try {
      const msgPromise = new Promise(resolve => sub.stdout.on('data', resolve))
      await delay(200)

      await cli(`pubsub pub ${topicB} world`)

      const data = await msgPromise
      expect(data.toString().trim()).to.be.eql('world')

      const out = await cli('pubsub ls')
      expect(out.toString().trim()).to.be.eql(topicB)
    } finally {
      await kill(sub)
    }
  })

  it('peers', async () => {
    let handler
    const handlerMsgPromise = new Promise(resolve => {
      handler = msg => resolve(msg)
    })

    const bId = await ipfsdB.api.id()
    const bAddr = bId.addresses[0]

    const aId = await ipfsdA.api.id()
    const aPeerId = aId.id.toString()

    await ipfsdA.api.swarm.connect(bAddr)
    await ipfsdA.api.pubsub.subscribe(topicC, handler)

    await delay(1000)

    const sub = cli(`pubsub sub ${topicC}`)

    try {
      await cli(`pubsub pub ${topicC} world`)

      const msg = await handlerMsgPromise
      expect(msg.data.toString()).to.be.eql('world')

      const out = await cli(`pubsub peers ${topicC}`)
      expect(out.trim()).to.be.eql(aPeerId)
    } finally {
      await kill(sub)
      await ipfsdA.api.pubsub.unsubscribe(topicC, handler)
    }
  })
})

async function kill (proc) {
  try {
    proc.kill()
    await proc
  } catch (err) {
    if (!err.killed) {
      throw err
    }
  }
}
