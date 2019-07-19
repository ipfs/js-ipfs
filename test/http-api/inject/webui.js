/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('Web UI', function () {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('allow /webui', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/webui'
      })
      // it should return a redirect
      expect(res.statusCode).to.equal(302)
      expect(res.headers.location).to.exist()
    })

    it('disallow /ipfs/ paths that are not webui', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn' // empty dir
      })
      expect(res.statusCode).to.equal(404)
    })

    it('disallow /ipns/ paths that are not webui', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/ipns/ipfs.io' // empty dir
      })
      expect(res.statusCode).to.equal(404)
    })

    /* DNSLink + fetching actual webui is too slow to include in the test :'-(
    it('/ipns/webui.ipfs.io', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/ipns/webui.ipfs.io'
      })
      expect(res.statusCode).to.equal(302)
      expect(res.headers.location).to.exist()
    })

    it('/ipns/webui.ipfs.io/', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/ipns/webui.ipfs.io/'
      })
      expect(res.statusCode).to.equal(200)
    })
    it('/ipns/ipfs.io/', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/ipns/ipfs.io/'
      })
      expect(res.statusCode).to.equal(404)
    })
    */
  })
}
