/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const createTempNode = require('./../../utils/temp-node')

module.exports = (http) => {
  describe('/pubsub', () => {
    let api
    let tmpNode

    const buf = new Buffer('some message')
    const topic = 'nonScents'

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

    describe('/pubsub/start', () => {
      it('returns 200', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/start`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.be.an('object')
          done()
        })
      })
    })

    describe('/pubsub/subscribe/{topic}', () => {
      it('returns 404 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/subscribe`
        }, (res) => {
          expect(res.statusCode).to.equal(404)
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/subscribe/${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

    describe('/pubsub/publish', () => {
      it('returns 400 if no buffer is provided', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/publish?topic=${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.statusMessage).to.equal('Bad Request')
          done()
        })
      })

      it('returns 400 if no topic is provided', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/publish?buf=${buf}`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.statusMessage).to.equal('Bad Request')
          done()
        })
      })

      it('returns 200 with topic and buffer', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/publish?buf=${buf}&topic=${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

    describe('/pubsub/unsubscribe/{topic}', () => {
      it('returns 404 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/unsubscribe`
        }, (res) => {
          expect(res.statusCode).to.equal(404)
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/unsubscribe/${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })
  })
}
