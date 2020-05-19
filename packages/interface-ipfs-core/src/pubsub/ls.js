/* eslint-env mocha */
'use strict'

const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.ls', function () {
    this.timeout(80 * 1000)

    let ipfs
    let subscribedTopics = []
    before(async () => {
      ipfs = (await common.spawn()).api
    })

    afterEach(async () => {
      for (let i = 0; i < subscribedTopics.length; i++) {
        await ipfs.pubsub.unsubscribe(subscribedTopics[i])
      }
      subscribedTopics = []
      await delay(100)
    })

    after(() => common.clean())

    it('should respect timeout option when listing pubsub subscriptions', () => {
      return testTimeout(() => ipfs.pubsub.ls({
        timeout: 1
      }))
    })

    it('should return an empty list when no topics are subscribed', async () => {
      const topics = await ipfs.pubsub.ls()
      expect(topics.length).to.equal(0)
    })

    it('should return a list with 1 subscribed topic', async () => {
      const sub1 = () => {}
      const topic = getTopic()
      subscribedTopics = [topic]

      await ipfs.pubsub.subscribe(topic, sub1)
      const topics = await ipfs.pubsub.ls()
      expect(topics).to.be.eql([topic])
    })

    it('should return a list with 3 subscribed topics', async () => {
      const topics = [{
        name: 'one',
        handler () {}
      }, {
        name: 'two',
        handler () {}
      }, {
        name: 'three',
        handler () {}
      }]

      subscribedTopics = topics.map(t => t.name)

      for (let i = 0; i < topics.length; i++) {
        await ipfs.pubsub.subscribe(topics[i].name, topics[i].handler)
      }

      const list = await ipfs.pubsub.ls()
      expect(list.sort()).to.eql(topics.map(t => t.name).sort())
    })
  })
}
