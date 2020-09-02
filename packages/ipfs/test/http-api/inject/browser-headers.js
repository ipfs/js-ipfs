/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const http = require('../../utils/http')

module.exports = () => {
  describe('browser headers', () => {
    let ipfs

    before(() => {
      ipfs = {
        id: sinon.stub().returns({})
      }
    })

    it('should block Mozilla* browsers that do not provide origins', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'
        }
      }, { ipfs })

      expect(res.statusCode).to.equal(403)
    })

    it('should not block on GETs', async () => {
      const res = await http({
        method: 'GET',
        url: '/api/v0/id',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'
        }
      }, { ipfs })

      expect(res).to.have.property('statusCode', 405)
    })

    it('should not block a Mozilla* browser that provides an allowed Origin', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/id',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0',
          Origin: 'null'
        }
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })
}
