/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.log', () => {
  it('.log.tail', (done) => {
    const req = apiClients.a.log.tail((err, res) => {
      expect(err).to.not.exist
      expect(req).to.exist

      res.once('data', (obj) => {
        expect(obj).to.be.an('object')
        done()
      })
    })
  })

  describe('promise', () => {
    it('.log.tail', (done) => {
      return apiClients.a.log.tail()
        .then((res) => {
          res.once('data', (obj) => {
            expect(obj).to.be.an('object')
            done()
          })
        })
    })
  })
})
