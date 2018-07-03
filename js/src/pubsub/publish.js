/* eslint-env mocha */
'use strict'

const timesSeries = require('async/timesSeries')
const hat = require('hat')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.publish', function () {
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

    it('should error on string messags', (done) => {
      const topic = getTopic()
      ipfs.pubsub.publish(topic, 'hello friend', (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should publish message from buffer', (done) => {
      const topic = getTopic()
      ipfs.pubsub.publish(topic, Buffer.from(hat()), done)
    })

    it('should publish 10 times within time limit', (done) => {
      const count = 10
      const topic = getTopic()

      timesSeries(count, (_, cb) => {
        ipfs.pubsub.publish(topic, Buffer.from(hat()), cb)
      }, done)
    })
  })
}
