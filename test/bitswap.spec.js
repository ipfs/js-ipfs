/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const FactoryClient = require('./ipfs-factory/client')

describe('.bitswap', () => {
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

  after((done) => {
    fc.dismantle(done)
  })

  describe('Callback API', () => {
    it('.wantlist', (done) => {
      ipfs.bitswap.wantlist((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.to.be.eql({
          Keys: null
        })
        done()
      })
    })

    it('.stat', (done) => {
      ipfs.bitswap.stat((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.property('BlocksReceived')
        expect(res).to.have.property('DupBlksReceived')
        expect(res).to.have.property('DupDataReceived')
        expect(res).to.have.property('Peers')
        expect(res).to.have.property('ProvideBufLen')
        expect(res).to.have.property('Wantlist')

        done()
      })
    })

    it('.unwant', (done) => {
      const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      ipfs.bitswap.unwant(key, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.wantlist', () => {
      return ipfs.bitswap.wantlist()
        .then((res) => {
          expect(res).to.have.to.be.eql({
            Keys: null
          })
        })
    })

    it('.stat', () => {
      return ipfs.bitswap.stat()
        .then((res) => {
          expect(res).to.have.property('BlocksReceived')
          expect(res).to.have.property('DupBlksReceived')
          expect(res).to.have.property('DupDataReceived')
          expect(res).to.have.property('Peers')
          expect(res).to.have.property('ProvideBufLen')
          expect(res).to.have.property('Wantlist')
        })
    })

    it('.unwant', () => {
      const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      return ipfs.bitswap.unwant(key)
    })
  })
})
