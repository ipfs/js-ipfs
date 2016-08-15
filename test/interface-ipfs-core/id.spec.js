/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const FactoryClient = require('../factory/factory-client')

describe('.id', () => {
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

  it('id', (done) => {
    ipfs.id((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('ID')
      expect(res).to.have.a.property('PublicKey')
      done()
    })
  })

  describe('promise', () => {
    it('id', () => {
      return ipfs.id()
        .then((res) => {
          expect(res).to.have.a.property('ID')
          expect(res).to.have.a.property('PublicKey')
        })
    })
  })
})
