/* eslint-env mocha */

const expect = require('chai').expect
const APIctl = require('ipfs-api')

describe('bootstrap', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    it('list', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap'
      }, (res) => {
        expect(res.result).to.deep.equal(defaultList)
        done()
      })
    })

    it('list 2', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        expect(res.result).to.deep.equal(defaultList)
        done()
      })
    })

    it('add', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/add',
        payload: {
          arg: '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
        }
      }, (res) => {
        done()
      })
    })

    it('rm', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/rm',
        payload: {
          arg: '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
        }
      }, (res) => {
        done()
      })
    })

    it('confirm list is as expected', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        expect(res.result).to.deep.equal(defaultList)
        done()
      })
    })
  })

  describe('gateway', () => {})

  describe('using js-ipfs-api', () => {
    var ctl

    it('start IPFS API ctl', (done) => {
      ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
      done()
    })

    // TODO: needs https://github.com/ipfs/js-ipfs-api/issues/217
    it.skip('list', (done) => {
      ctl.boostrap.list((err, result) => {
        expect(err).to.not.exist
        expect(result).to.deep.equal(defaultList)
        done()
      })
    })

    it.skip('add', (done) => {})
    it.skip('rm', (done) => {})
  })
})

const defaultList = [
  '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
  '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
  '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
  '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
  '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
  '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
  '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx'
]
