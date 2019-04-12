/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')

const expect = chai.expect
chai.use(dirtyChai)

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))

module.exports = (http) => {
  describe('/name', function () {
    const cid = 'QmbndGRXYRyfU41TUvc52gMrwq87JJg18QsDPcCeaMcM61'
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    it('should publish a record', async function () {
      this.timeout(80 * 1000)

      const res = await api.inject({
        method: 'GET',
        url: `/api/v0/name/publish?arg=${cid}&resolve=false`
      })

      expect(res).to.exist()
      expect(res.result.Value).to.equal(`/ipfs/${cid}`)
    })

    it('should publish and resolve a record', async function () {
      this.timeout(160 * 1000)

      let res = await api.inject({
        method: 'GET',
        url: `/api/v0/name/publish?arg=${cid}&resolve=false`
      })

      expect(res).to.exist()
      expect(res.result.Value).to.equal(`/ipfs/${cid}`)

      res = await api.inject({
        method: 'GET',
        url: `/api/v0/name/resolve`
      })

      expect(res).to.exist()
      expect(res.result.Path).to.satisfy(checkAll([`/ipfs/${cid}`]))
    })
  })
}
