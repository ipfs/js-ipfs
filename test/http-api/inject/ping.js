/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (http) => {
  describe('/ping', function () {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('returns 400 if both n and count are provided', async () => {
      const res = await api.inject({
        method: 'GET',
        url: `/api/v0/ping?arg=peerid&n=1&count=1`
      })

      expect(res.statusCode).to.equal(400)
    })

    it('returns 400 if arg is not provided', async () => {
      const res = await api.inject({
        method: 'GET',
        url: `/api/v0/ping?count=1`
      })

      expect(res.statusCode).to.equal(400)
    })

    it('returns 500 for incorrect Peer Id', async function () {
      this.timeout(90 * 1000)

      const res = await api.inject({
        method: 'GET',
        url: `/api/v0/ping?arg=peerid`
      })

      expect(res.statusCode).to.equal(500)
    })
  })
}
