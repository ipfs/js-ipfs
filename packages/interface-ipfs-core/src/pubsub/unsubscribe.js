/* eslint-env mocha */
'use strict'

const { isBrowser, isWebWorker, isElectronRenderer } = require('ipfs-utils/src/env')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.unsubscribe', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    // Browser/worker has max ~5 open HTTP requests to the same origin
    const count = isBrowser || isWebWorker || isElectronRenderer ? 5 : 10

    it(`should subscribe and unsubscribe ${count} times`, async () => {
      const someTopic = getTopic()
      const handlers = Array.from(Array(count), () => msg => {})

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, handlers[i])
      }

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.unsubscribe(someTopic, handlers[i])
      }

      await delay(100)
      const topics = await ipfs.pubsub.ls()
      expect(topics).to.eql([])
    })

    it(`should subscribe ${count} handlers and unsubscribe once with no reference to the handlers`, async () => {
      const someTopic = getTopic()
      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, (msg) => {})
      }
      await ipfs.pubsub.unsubscribe(someTopic)

      await delay(100)
      const topics = await ipfs.pubsub.ls()
      expect(topics).to.eql([])
    })
  })
}
