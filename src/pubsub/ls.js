/* eslint-env mocha */
'use strict'

const eachSeries = require('async/eachSeries')
const { getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.ls', function () {
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

    it('should return an empty list when no topics are subscribed', (done) => {
      ipfs.pubsub.ls((err, topics) => {
        expect(err).to.not.exist()
        expect(topics.length).to.equal(0)
        done()
      })
    })

    it('should return a list with 1 subscribed topic', (done) => {
      const sub1 = (msg) => {}
      const topic = getTopic()

      ipfs.pubsub.subscribe(topic, sub1, (err) => {
        expect(err).to.not.exist()

        ipfs.pubsub.ls((err, topics) => {
          expect(err).to.not.exist()
          expect(topics).to.be.eql([topic])

          ipfs.pubsub.unsubscribe(topic, sub1, done)
        })
      })
    })

    it('should return a list with 3 subscribed topics', (done) => {
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

      eachSeries(topics, (t, cb) => {
        ipfs.pubsub.subscribe(t.name, t.handler, cb)
      }, (err) => {
        expect(err).to.not.exist()

        ipfs.pubsub.ls((err, list) => {
          expect(err).to.not.exist()

          expect(list.sort())
            .to.eql(topics.map((t) => t.name).sort())

          eachSeries(topics, (t, cb) => {
            ipfs.pubsub.unsubscribe(t.name, t.handler, cb)
          }, done)
        })
      })
    })
  })
}
