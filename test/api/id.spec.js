/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.id', () => {
  it('id', (done) => {
    apiClients.a.id((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('ID')
      expect(res).to.have.a.property('PublicKey')
      done()
    })
  })

  describe('promise', () => {
    it('id', () => {
      return apiClients.a.id()
        .then((res) => {
          expect(res).to.have.a.property('ID')
          expect(res).to.have.a.property('PublicKey')
        })
    })
  })
})
