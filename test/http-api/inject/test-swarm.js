/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const createTempNode = require('./../../utils/temp-node')

module.exports = (http) => {
  describe('/swarm', function () {
    this.timeout(20000)

    var api
    var tmpNode // tmp node
    var ipfsAddr

    before((done) => {
      api = http.api.server.select('API')

      createTempNode(47, (err, _ipfs) => {
        expect(err).to.not.exist
        tmpNode = _ipfs
        tmpNode.goOnline((err) => {
          expect(err).to.not.exist
          tmpNode.id((err, res) => {
            expect(err).to.not.exist
            ipfsAddr = `${res.addresses[0]}/ipfs/${res.id}`
            done()
          })
        })
      })
    })

    after((done) => {
      setTimeout(() => {
        tmpNode.goOffline(done)
      }, 1000)
    })

    it('/connect returns 400 for request without argument', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/swarm/connect'
      }, (res) => {
        expect(res.statusCode).to.equal(400)
        expect(res.result).to.be.a('string')
        done()
      })
    })

    it('/connect returns 500 for request with invalid argument', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/swarm/connect?arg=invalid'
      }, (res) => {
        expect(res.statusCode).to.equal(500)
        done()
      })
    })

    it('/connect returns value', (done) => {
      api.inject({
        method: 'GET',
        url: `/api/v0/swarm/connect?arg=${ipfsAddr}`
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        done()
      })
    })

    it('/peers returns value', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/swarm/peers'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result.Strings).to.have.length.above(0)
        done()
      })
    })

    it('/addrs/local returns value', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/swarm/addrs/local'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result.Strings).to.have.length.above(0)
        done()
      })
    })
  })
}
