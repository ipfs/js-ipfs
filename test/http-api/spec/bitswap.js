/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const setup = require('../index')

describe('/bitswap', () => {
  let api
  let http

  before((done) => {
    setup.before((err, _http) => {
      if (err) {
        return done(err)
      }
      http = _http
      api = http.api.server.select('API')
      done()
    })
  })

  after((done) => {
    setup.after(http, done)
  })

  it('/wantlist', (done) => {
    api.inject({
      method: 'GET',
      url: '/api/v0/bitswap/wantlist'
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.result).to.have.property('Keys')
      done()
    })
  })

  it('/stat', (done) => {
    api.inject({
      method: 'GET',
      url: '/api/v0/bitswap/stat'
    }, (res) => {
      expect(res.statusCode).to.equal(200)

      expect(res.result).to.have.keys([
        'BlocksReceived',
        'Wantlist',
        'Peers',
        'DupBlksReceived',
        'DupDataReceived'
      ])
      done()
    })
  })
})
