/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getTopic } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

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

    it('should publish message from string', () => {
      const topic = getTopic()
      return ipfs.pubsub.publish(topic, 'hello friend')
    })

    it('should publish message from buffer', () => {
      const topic = getTopic()
      return ipfs.pubsub.publish(topic, Buffer.from(hat()))
    })

    it('should publish 10 times within time limit', async () => {
      const count = 10
      const topic = getTopic()

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.publish(topic, Buffer.from(hat()))
      }
    })
  })
}
