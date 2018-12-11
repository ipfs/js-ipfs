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
      api = http.api.server.select('API')
    })

    it('should publish a record', function (done) {
      this.timeout(80 * 1000)

      api.inject({
        method: 'GET',
        url: `/api/v0/name/publish?arg=${cid}&resolve=false`
      }, (res) => {
        expect(res).to.exist()
        expect(res.result.Value).to.equal(`/ipfs/${cid}`)
        done()
      })
    })

    it('should publish and resolve a record', function (done) {
      this.timeout(160 * 1000)

      api.inject({
        method: 'GET',
        url: `/api/v0/name/publish?arg=${cid}&resolve=false`
      }, (res) => {
        expect(res).to.exist()
        expect(res.result.Value).to.equal(`/ipfs/${cid}`)

        api.inject({
          method: 'GET',
          url: `/api/v0/name/resolve`
        }, (res) => {
          expect(res).to.exist()
          expect(res.result.Path).to.satisfy(checkAll([`/ipfs/${cid}`]))

          done()
        })
      })
    })
  })
}
