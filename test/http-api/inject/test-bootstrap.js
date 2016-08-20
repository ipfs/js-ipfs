/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (http) => {
  describe('/bootstrap', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    it('/list', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        expect(res.result).to.deep.equal(defaultList)
        done()
      })
    })

    it('/list alias', (done) => {
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap'
      }, (res) => {
        expect(res.result).to.deep.equal(defaultList)
        done()
      })
    })

    it.skip('/add', (done) => { // TODO
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/add',
        payload: {
          arg: '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
        }
      }, (res) => {
        // TODO assess
      })
    })

    it.skip('/rm', (done) => { // TODO
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/rm',
        payload: {
          arg: '/ip4/111.111.111.111/tcp/1001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLUVIT'
        }
      }, (res) => {
        // TODO assess
      })
    })

    it.skip('/list confirm it changed', (done) => { // TODO
      api.inject({
        method: 'GET',
        url: '/api/v0/bootstrap/list'
      }, (res) => {
        // TODO assess
      })
    })
  })
}

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
