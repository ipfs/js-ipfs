/* eslint max-nested-callbacks: ["error", 7] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const factory = require('../utils/factory')
const ipfsExec = require('../utils/ipfs-exec')

describe('name-pubsub', () => {
  describe('enabled', () => {
    const df = factory({ type: 'js', args: ['--enable-namesys-pubsub'] })
    let ipfsA
    let ipfsB
    let nodeAId
    let nodeBId
    let bMultiaddr
    const nodes = []

    // Spawn daemons
    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      const nodeA = await df.spawn()
      ipfsA = ipfsExec(nodeA.path)
      nodes.push(nodeA)

      const nodeB = await df.spawn()
      ipfsB = ipfsExec(nodeB.path)
      nodes.push(nodeB)
    })

    // Get node ids
    before(async function () {
      const res = await Promise.all([
        ipfsA('id'),
        ipfsB('id')
      ])

      nodeAId = JSON.parse(res[0])
      nodeBId = JSON.parse(res[1])
      bMultiaddr = nodeBId.addresses[0]
    })

    // Connect
    before(async function () {
      const out = await ipfsA(`swarm connect ${bMultiaddr}`)
      expect(out).to.eql(`connect ${bMultiaddr} success\n`)
    })

    after(() => df.clean())

    describe('pubsub commands', () => {
      it('should get enabled state of pubsub', async function () {
        const res = await ipfsA('name pubsub state')
        expect(res).to.have.string('enabled') // enabled
      })

      it('should subscribe on name resolve', async function () {
        this.timeout(80 * 1000)

        const err = await ipfsB.fail(`name resolve ${nodeAId.id}`)
        expect(err).to.exist()

        const ls = await ipfsB('pubsub ls')
        expect(ls).to.have.string('/record/') // have a record ipns subscription

        const subs = await ipfsB('name pubsub subs')
        expect(subs).to.have.string(`/ipns/${nodeAId.id}`) // have subscription
      })

      it('should be able to cancel subscriptions', async function () {
        this.timeout(80 * 1000)

        const res = await ipfsA(`name pubsub cancel /ipns/${nodeBId.id}`)
        expect(res).to.have.string('no subscription') // tried to cancel a not yet subscribed id

        const err = await ipfsA.fail(`name resolve ${nodeBId.id}`)
        expect(err).to.exist() // Not available (subscribed now)

        const cancel = await ipfsA(`name pubsub cancel /ipns/${nodeBId.id}`)
        expect(cancel).to.have.string('canceled') // canceled now

        const ls = await ipfsA('pubsub ls')
        expect(ls).to.not.have.string('/ipns/') // ipns subscribtion not available

        const subs = await ipfsA('name pubsub subs')
        expect(subs).to.not.have.string(`/ipns/${nodeBId.id}`) // ipns subscribtion not available
      })
    })
  })

  describe('disabled', () => {
    const df = factory({ type: 'js' })
    let ipfsA
    let node

    // Spawn daemons
    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      node = await df.spawn()
      ipfsA = ipfsExec(node.path)
    })

    after(() => df.clean())

    it('should get disabled state of pubsub', async function () {
      const res = await ipfsA('name pubsub state')
      expect(res).to.have.string('disabled')
    })

    it('should get error getting the available subscriptions', async function () {
      const err = await ipfsA.fail('name pubsub subs')
      expect(err.stderr).to.have.string('IPNS pubsub subsystem is not enabled')
    })

    it('should get error canceling a subscription', async function () {
      const err = await ipfsA.fail('name pubsub cancel /ipns/QmSWxaPcGgf4TDnFEBDWz2JnbHywF14phmY9hNcAeBEK5v')
      expect(err.stderr).to.have.string('IPNS pubsub subsystem is not enabled')
    })
  })
})
