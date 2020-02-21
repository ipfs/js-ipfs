/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
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
        url: '/api/v0/name/resolve'
      })

      expect(res).to.exist()
      expect(res.result.Path).to.satisfy(checkAll([`/ipfs/${cid}`]))
    })

    it('should publish and resolve a record with explicit CIDv1 in Base32', async function () {
      this.timeout(160 * 1000)

      // ensure PeerID is represented as CIDv1 in Base32
      const { id } = await http.api._ipfs.id()
      let cidv1 = new CID(id)
      if (cidv1.version === 0) cidv1 = cidv1.toV1() // future-proofing
      const peerIdAsCidv1b32 = cidv1.toString('base32')

      let res = await api.inject({
        method: 'GET',
        url: `/api/v0/name/publish?arg=${cid}&resolve=false`
      })

      expect(res).to.exist()
      expect(res.result.Value).to.equal(`/ipfs/${cid}`)

      res = await api.inject({
        method: 'GET',
        url: `/api/v0/name/resolve?arg=${peerIdAsCidv1b32}`
      })

      expect(res).to.exist()
      expect(res.result.Path).to.satisfy(checkAll([`/ipfs/${cid}`]))
    })
  })
}
