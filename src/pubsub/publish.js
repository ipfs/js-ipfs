/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getTopic } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.publish', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

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
