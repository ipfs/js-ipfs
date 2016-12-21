/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.ping', () => {
  it('ping another peer', (done) => {
    apiClients.b.id((err, id) => {
      expect(err).to.not.exist

      apiClients.a.ping(id.id, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Success')
        expect(res).to.have.a.property('Time')
        expect(res).to.have.a.property('Text')
        expect(res.Text).to.contain('Average latency')
        expect(res.Time).to.be.a('number')
        done()
      })
    })
  })

  describe('promise', () => {
    it('ping another peer', () => {
      return apiClients.b.id()
        .then((id) => {
          return apiClients.a.ping(id.id)
        })
        .then((res) => {
          expect(res).to.have.a.property('Success')
          expect(res).to.have.a.property('Time')
          expect(res).to.have.a.property('Text')
          expect(res.Text).to.contain('Average latency')
          expect(res.Time).to.be.a('number')
        })
    })
  })
})
