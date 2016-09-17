/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (common) => {
  describe.only('.dht', () => {
    let ipfs

    before((done) => {
      common.setup((err, factory) => {
        expect(err).to.not.exists
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })
    xdescribe('.findpeer', () => {})
    describe('.get', (done) => {
      it('errors when getting a non-existent key from the DHT', (done) => {
        ipfs.dht.get('non-existing', {timeout: '100ms'}, (err, value) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })
      // belongs in put or integration
      it('puts and gets a key value pair in the DHT', (done) => {
        ipfs.dht.put('scope', 'interplanetary', (err, res) => {
          expect(err).to.not.exist

          expect(res).to.be.an('array')

          done()
          // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
          // apiClients.a.dht.get('scope', (err, value) => {
          //  expect(err).to.not.exist
          //  expect(value).to.be.equal('interplanetary')
          //  done()
          // })
        })
      })
    })
    xdescribe('.put', () => {})
    xdescribe('.query', () => {})
    describe('.findprovs', () => {
      it('finds providers', (done) => {
        ipfs.dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
          expect(err).to.not.exist

          expect(res).to.be.an('array')
          done()
        })
      })
    })
  })
}
