/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const createTempNode = require('../utils/temp-node')

module.exports = (httpAPI) => {
  describe('swarm', function () {
    this.timeout(20000)

    describe('api', () => {
      var api
      var ipfs // tmp node
      var ipfsAddr

      before((done) => {
        createTempNode(6, (err, _ipfs) => {
          expect(err).to.not.exist
          ipfs = _ipfs
          ipfs.goOnline((err) => {
            expect(err).to.not.exist
            ipfs.id((err, res) => {
              expect(err).to.not.exist
              ipfsAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
              done()
            })
          })
        })
      })

      after((done) => {
        setTimeout(() => {
          ipfs.goOffline(done)
        }, 1000)
      })

      it('gets the api obj', () => {
        api = httpAPI.server.select('API')
      })

      it('/swarm/connect returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/swarm/connect'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('/swarm/connect returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/swarm/connect?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('/swarm/connect returns value', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/swarm/connect?arg=${ipfsAddr}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          done()
        })
      })

      it('/swarm/peers returns value', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/swarm/peers'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Strings).to.have.length.above(0)
          done()
        })
      })

      it('/swarm/addrs/local returns value', (done) => {
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

    describe('using js-ipfs-api', () => {
      var ctl
      var ipfs
      var ipfsAddr

      before((done) => {
        createTempNode(5, (err, _ipfs) => {
          expect(err).to.not.exist
          ipfs = _ipfs
          ipfs.goOnline(() => {
            ipfs.id((err, res) => {
              expect(err).to.not.exist
              ipfsAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
              done()
            })
          })
        })
      })

      after((done) => {
        setTimeout(() => {
          ipfs.goOffline(done)
        }, 1000)
      })

      it('start IPFS API ctl', (done) => {
        ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
        done()
      })

      it('ipfs.swarm.connect returns error for request without argument', (done) => {
        ctl.swarm.connect(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('ipfs.swarm.connect returns error for request with invalid argument', (done) => {
        ctl.swarm.connect('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('ipfs.swarm.connect returns value', (done) => {
        ctl.swarm.connect(ipfsAddr, (err, result) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('ipfs.swarm.peers returns value', (done) => {
        ctl.swarm.peers((err, result) => {
          expect(err).to.not.exist
          expect(result.Strings).to.have.length.above(0)
          done()
        })
      })

      it('ipfs.swarm.localAddrsreturns value', (done) => {
        ctl.swarm.localAddrs((err, result) => {
          expect(err).to.not.exist
          expect(result.Strings).to.have.length.above(0)
          done()
        })
      })
    })
  })
}
