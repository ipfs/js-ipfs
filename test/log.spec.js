/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const FactoryClient = require('./ipfs-factory/client')

describe('.log', () => {
  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist()
      ipfs = node
      done()
    })
  })

  after((done) => fc.dismantle(done))

  describe('Callback API', () => {
    it('.log.tail', (done) => {
      const req = ipfs.log.tail((err, res) => {
        expect(err).to.not.exist()
        expect(req).to.exist()

        res.once('data', (obj) => {
          expect(obj).to.be.an('object')
          done()
        })
      })
    })

    it('.log.ls', (done) => {
      ipfs.log.ls((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        expect(res).to.be.an('array')

        done()
      })
    })

    it('.log.level', (done) => {
      ipfs.log.level('all', 'error', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        expect(res).to.be.an('object')
        expect(res).to.not.have.property('Error')
        expect(res).to.have.property('Message')

        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.log.tail', () => {
      return ipfs.log.tail()
        .then((res) => {
          res.once('data', (obj) => {
            expect(obj).to.be.an('object')
          })
        })
    })

    it('.log.ls', () => {
      return ipfs.log.ls()
        .then((res) => {
          expect(res).to.exist()

          expect(res).to.be.an('array')
        })
    })

    it('.log.level', () => {
      return ipfs.log.level('all', 'error')
        .then((res) => {
          expect(res).to.exist()

          expect(res).to.be.an('object')
          expect(res).to.not.have.property('Error')
          expect(res).to.have.property('Message')
        })
    })
  })
})
