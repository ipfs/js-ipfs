/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const uint8ArrayFromString = require('uint8arrays/from-string')
const { fixture } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const last = require('it-last')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.publish offline', () => {
    const keyName = nanoid()
    let ipfs
    let nodeId

    before(async () => {
      ipfs = (await common.spawn()).api
      nodeId = ipfs.peerId.id
      await ipfs.add(fixture.data, { pin: false })
    })

    after(() => common.clean())

    it('should respect timeout option when publishing an IPNS name', () => {
      return testTimeout(() => ipfs.name.publish(fixture.cid, {
        allowOffline: true,
        timeout: 1
      }))
    })

    it('should publish an IPNS record with the default params', async function () {
      this.timeout(50 * 1000)

      const value = fixture.cid

      const res = await ipfs.name.publish(value, { allowOffline: true })
      expect(res).to.exist()
      expect(res.name).to.equal(nodeId)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish correctly with the lifetime option and resolve', async () => {
      const { path } = await ipfs.add(uint8ArrayFromString('should publish correctly with the lifetime option and resolve'))
      await ipfs.name.publish(path, { allowOffline: true, resolve: false, lifetime: '2h' })
      expect(await last(ipfs.name.resolve(`/ipns/${nodeId}`))).to.eq(`/ipfs/${path}`)
    })

    it('should publish correctly when the file was not added but resolve is disabled', async function () {
      this.timeout(50 * 1000)

      const value = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

      const options = {
        resolve: false,
        lifetime: '1m',
        ttl: '10s',
        key: 'self',
        allowOffline: true
      }

      const res = await ipfs.name.publish(value, options)
      expect(res).to.exist()
      expect(res.name).to.equal(nodeId)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish with a key received as param, instead of using the key of the node', async function () {
      this.timeout(90 * 1000)

      const value = fixture.cid
      const options = {
        resolve: false,
        lifetime: '24h',
        ttl: '10s',
        key: keyName,
        allowOffline: true
      }

      const key = await ipfs.key.gen(keyName, { type: 'rsa', size: 2048 })
      const res = await ipfs.name.publish(value, options)

      expect(res).to.exist()
      expect(res.name).to.equal(key.id)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })
  })
}
