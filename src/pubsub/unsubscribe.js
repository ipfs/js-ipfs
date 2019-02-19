/* eslint-env mocha */
'use strict'

const eachSeries = require('async/eachSeries')
const timesSeries = require('async/timesSeries')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

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

    it('should subscribe and unsubscribe 10 times', (done) => {
      const count = 10
      const someTopic = getTopic()

      timesSeries(count, (_, cb) => {
        const handler = (msg) => {}
        ipfs.pubsub.subscribe(someTopic, handler, (err) => cb(err, handler))
      }, (err, handlers) => {
        expect(err).to.not.exist()
        eachSeries(
          handlers,
          (handler, cb) => ipfs.pubsub.unsubscribe(someTopic, handler, cb),
          (err) => {
            expect(err).to.not.exist()
            // Assert unsubscribe worked
            ipfs.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.eql([])
              done()
            })
          }
        )
      })
    })
  })
}
