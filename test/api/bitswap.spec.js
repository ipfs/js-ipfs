/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.bitswap', () => {
  it('.wantlist', (done) => {
    apiClients.a.bitswap.wantlist((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.to.be.eql({
        Keys: null
      })
      done()
    })
  })

  it('.stat', (done) => {
    apiClients.a.bitswap.stat((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.to.be.eql({
        BlocksReceived: 0,
        DupBlksReceived: 0,
        DupDataReceived: 0,
        Peers: null,
        ProvideBufLen: 0,
        Wantlist: null
      })
      done()
    })
  })

  it('.unwant', (done) => {
    const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
    apiClients.a.bitswap.unwant(key, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  describe('promise', () => {
    it('.wantlist', () => {
      return apiClients.a.bitswap.wantlist()
        .then((res) => {
          expect(res).to.have.to.be.eql({
            Keys: null
          })
        })
    })

    it('.stat', () => {
      return apiClients.a.bitswap.stat()
        .then((res) => {
          expect(res).to.have.to.be.eql({
            BlocksReceived: 0,
            DupBlksReceived: 0,
            DupDataReceived: 0,
            Peers: null,
            ProvideBufLen: 0,
            Wantlist: null
          })
        })
    })

    it('.unwant', () => {
      const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      return apiClients.a.bitswap.unwant(key)
    })
  })
})
