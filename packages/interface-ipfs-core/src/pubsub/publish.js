/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { nanoid } = require('nanoid')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.publish', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when publishing a pubsub message', () => {
      return testTimeout(() => ipfs.pubsub.publish(getTopic(), 'derp', {
        timeout: 1
      }))
    })

    it('should publish message from string', () => {
      const topic = getTopic()
      return ipfs.pubsub.publish(topic, 'hello friend')
    })

    it('should fail with undefined msg', async () => {
      const topic = getTopic()
      await expect(ipfs.pubsub.publish(topic)).to.eventually.rejectedWith('argument "data" is required')
    })

    it('should publish message from buffer', () => {
      const topic = getTopic()
      return ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
    })

    it('should publish 10 times within time limit', async () => {
      const count = 10
      const topic = getTopic()

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
      }
    })
  })
}
