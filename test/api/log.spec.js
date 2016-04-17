/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')

// For some reason these tests time out in PhantomJS so we need to skip them
const isPhantom = !isNode && typeof navigator !== 'undefined' && navigator.userAgent.match(/PhantomJS/)

describe('.log', () => {
  it('.log.tail', (done) => {
    if (isPhantom) {
      return done()
    }
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
      if (isPhantom) {
        return done()
      }

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
