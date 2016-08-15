/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')

// For some reason these tests time out in PhantomJS so we need to skip them
const isPhantom = !isNode && typeof navigator !== 'undefined' && navigator.userAgent.match(/PhantomJS/)

if (!isPhantom) {
  describe('.log', () => {
    let ipfs
    let fc

    before(function (done) {
      this.timeout(20 * 1000) // slow CI
      fc = new FactoryClient()
      fc.spawnNode((err, node) => {
        expect(err).to.not.exist
        ipfs = node
        done()
      })
    })

    after((done) => {
      fc.dismantle(done)
    })

    it('.log.tail', (done) => {
      const req = ipfs.log.tail((err, res) => {
        expect(err).to.not.exist
        expect(req).to.exist

        res.once('data', (obj) => {
          expect(obj).to.be.an('object')
          done()
        })
      })
    })

    describe('promise', () => {
      it('.log.tail', () => {
        return ipfs.log.tail()
          .then((res) => {
            res.once('data', (obj) => {
              expect(obj).to.be.an('object')
            })
          })
      })
    })
  })
}
