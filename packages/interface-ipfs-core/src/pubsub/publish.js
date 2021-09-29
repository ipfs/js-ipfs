/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { nanoid } from 'nanoid'
import { getTopic } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPublish (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.publish', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should fail with undefined msg', async () => {
      const topic = getTopic()
      // @ts-expect-error invalid parameter
      await expect(ipfs.pubsub.publish(topic)).to.eventually.be.rejected()
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
