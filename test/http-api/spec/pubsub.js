/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const createTempNode = ''

// TODO migrate to use ipfs-factory-daemon
module.exports = (http) => {
  describe.skip('/pubsub', () => {
    let api
    let tmpNode

    const buf = new Buffer('some message')
    const topic = 'nonScents'
    const topicNotSubscribed = 'somethingRandom'

    before((done) => {
      api = http.api.server.select('API')

      createTempNode(47, (err, _ipfs) => {
        expect(err).to.not.exist
        tmpNode = _ipfs
        tmpNode.goOnline((err) => {
          expect(err).to.not.exist
          done()
        })
      })
    })

    after((done) => {
      setTimeout(() => {
        tmpNode.goOffline(done)
      }, 1000)
    })

    describe('/sub', () => {
      it('returns 500 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/sub`
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        // TODO: Agree on a better way to test this (currently this hangs)
        // Regarding: https://github.com/ipfs/js-ipfs/pull/644#issuecomment-267687194
        // Current Patch: Subscribe to a topic so the other tests run as expected
        const ipfs = api.app.ipfs
        const handler = (msg) => {}
        ipfs.pubsub.subscribe(topic, handler, () => {
          setTimeout(() => {
            ipfs.pubsub.unsubscribe(topic, handler)
            done()
          }, 100)
        })
        // api.inject({
        //   method: 'GET',
        //   url: `/api/v0/pubsub/sub/${topic}`
        // }, (res) => {
        //   console.log(res.result)
        //   expect(res.statusCode).to.equal(200)
        //   done()
        // })
      })
    })

    describe('/pub', () => {
      it('returns 500 if no buffer is provided', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?arg=${topic}&arg=`
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 with topic and buffer', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?arg=${topic}&arg=${buf}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

    describe.skip('/ls', () => {
      it('returns 200', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/ls`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Strings).to.be.eql([topic])
          done()
        })
      })
    })

    describe('/peers', () => {
      it('returns 500 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers`
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.be.eql(1)
          done()
        })
      })

      it('returns 200 if not subscribed to a topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers?arg=${topicNotSubscribed}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Strings).to.be.eql([])
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers?arg=${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Strings).to.be.eql([])
          done()
        })
      })
    })
  })
}
