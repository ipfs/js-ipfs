/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const { fakeCid } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findProvs', function () {
    this.timeout(20000)
    let nodeA
    let nodeB
    let nodeC

    before(async () => {
      nodeA = (await common.spawn()).api
      nodeB = (await common.spawn()).api
      nodeC = (await common.spawn()).api
      await Promise.all([
        nodeB.swarm.connect(nodeA.peerId.addresses[0]),
        nodeC.swarm.connect(nodeB.peerId.addresses[0])
      ])
    })

    after(() => common.clean())

    let providedCid
    before('add providers for the same cid', async function () {
      this.timeout(10 * 1000)

      const cids = await Promise.all([
        nodeB.object.new('unixfs-dir'),
        nodeC.object.new('unixfs-dir')
      ])

      providedCid = cids[0]

      await Promise.all([
        all(nodeB.dht.provide(providedCid)),
        all(nodeC.dht.provide(providedCid))
      ])
    })

    it('should be able to find providers', async function () {
      this.timeout(20 * 1000)

      const provs = await all(nodeA.dht.findProvs(providedCid, { numProviders: 2 }))
      const providerIds = provs.map((p) => p.id.toString())

      expect(providerIds).to.have.members([
        nodeB.peerId.id,
        nodeC.peerId.id
      ])
    })

    it('should take options to override timeout config', async function () {
      const options = {
        timeout: 1
      }

      const cidV0 = await fakeCid()

      await expect(all(nodeA.dht.findProvs(cidV0, options))).to.be.rejected()
    })
  })
}
