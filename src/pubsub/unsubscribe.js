/* eslint-env mocha */
'use strict'

const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('../utils/delay')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.unsubscribe', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    // Browser/worker has max ~5 open HTTP requests to the same origin
    const count = isBrowser || isWebWorker ? 5 : 10

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

    it(`should subscribe ${count} handlers and unsunscribe once with no reference to the handlers`, async () => {
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
