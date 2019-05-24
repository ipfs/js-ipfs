/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const CID = require('cids')
const waitFor = require('../../utils/wait-for').promises

module.exports = (http) => {
  describe('/bitswap', () => {
    const wantedCid0 = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
    const wantedCid1 = 'zb2rhafnd6kEUujnoMkozHnWXY7XpWttyVDWKXfChqA42VTDU'
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    before(function () {
      this.timeout(120 * 1000)

      // Add a CID to the wantlist
      api.inject({ method: 'GET', url: `/api/v0/block/get?arg=${wantedCid0}` })
      api.inject({ method: 'GET', url: `/api/v0/block/get?arg=${wantedCid1}` })

      const test = async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/bitswap/wantlist'
        })

        if (res.statusCode !== 200) {
          throw new Error(`unexpected status ${res.statusCode}`)
        }

        const isWanted0 = res.result.Keys.some(k => k['/'] === wantedCid0)
        const isWanted1 = res.result.Keys.some(k => k['/'] === wantedCid1)

        return isWanted0 && isWanted1
      }

      return waitFor(test, {
        name: `${wantedCid0} and ${wantedCid1} to be wanted`,
        timeout: 60 * 1000
      })
    })

    it('/wantlist', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/wantlist'
      })

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.have.property('Keys')
      expect(res.result.Keys).to.deep.include({ '/': wantedCid0 })
    })

    it('/wantlist?cid-base=base64', async () => {
      const base64Cid = new CID(wantedCid1).toString('base64')
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/wantlist?cid-base=base64'
      })

      expect(res.statusCode).to.equal(200)
      expect(res.result.Keys).to.deep.include({ '/': base64Cid })
    })

    it('/wantlist?cid-base=invalid', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/wantlist?cid-base=invalid'
      })

      expect(res.statusCode).to.equal(400)
      expect(res.result.Message).to.include('Invalid request query input')
    })

    it('/stat', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/stat'
      })

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.have.property('ProvideBufLen')
      expect(res.result).to.have.property('BlocksReceived')
      expect(res.result).to.have.property('Wantlist')
      expect(res.result).to.have.property('Peers')
      expect(res.result).to.have.property('DupBlksReceived')
      expect(res.result).to.have.property('DupDataReceived')
      expect(res.result).to.have.property('DataReceived')
      expect(res.result).to.have.property('BlocksSent')
      expect(res.result).to.have.property('DataSent')
    })

    it('/stat?cid-base=base64', async () => {
      const base64Cid = new CID(wantedCid1).toString('base64')
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/stat?cid-base=base64'
      })

      expect(res.statusCode).to.equal(200)
      expect(res.result.Wantlist).to.deep.include({ '/': base64Cid })
    })

    it('/stat?cid-base=invalid', async () => {
      const res = await api.inject({
        method: 'GET',
        url: '/api/v0/bitswap/stat?cid-base=invalid'
      })

      expect(res.statusCode).to.equal(400)
      expect(res.result.Message).to.include('Invalid request query input')
    })
  })
}
