/* globals describe, it */

'use strict'

const expect = require('chai').expect

describe('version', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    it('get the version', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/version'
      }, res => {
        expect(res.result).to.equal('0.4.0-dev')
        done()
      })
    })
  })

  describe('gateway', () => {})
})
