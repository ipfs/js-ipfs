/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const createTempNode = require('./../../utils/temp-node')

module.exports = (http) => {
  describe.only('/pubsub', () => {
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

    describe('/sub/{topic}', () => {
      it('returns 404 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/sub`
        }, (res) => {
          expect(res.statusCode).to.equal(404)
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/sub/${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

    xdescribe('/pub', () => {
      it('returns 400 if no buffer is provided', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?topic=${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.statusMessage).to.equal('Bad Request')
          done()
        })
      })

      it('returns 400 if no topic is provided', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?buf=${buf}`
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.statusMessage).to.equal('Bad Request')
          done()
        })
      })

      it('returns 200 with topic and buffer', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pubsub/pub?buf=${buf}&topic=${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })

    xdescribe('/ls', () => {
      it('returns 200', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/ls`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.be.an('object')
          done()
        })
      })
    })

    xdescribe('/peers/{topic}', () => {
      it('returns 404 if no topic is provided', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers`
        }, (res) => {
          expect(res.statusCode).to.equal(404)
          done()
        })
      })

      it('returns 200 with topic', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pubsub/peers/${topic}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })
    })
  })
}
