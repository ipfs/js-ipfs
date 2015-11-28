'use strict'

const ipfsAPI = require('../src/index.js')

describe('ipfsAPI constructor tests', () => {
  describe('parameter permuations', () => {
    const apiAddrs = require('./tmp-disposable-nodes-addrs.json')
    const apiAddr = apiAddrs.a.split('/')

    function clientWorks (client, done) {
      client.id((err, id) => {
        expect(err).to.not.exist

        expect(id).to.have.a.property('ID')
        expect(id).to.have.a.property('PublicKey')
        done()
      })
    }

    it('opts', (done) => {
      clientWorks(ipfsAPI({
        host: apiAddr[2],
        port: apiAddr[4],
        protocol: 'http'
      }), done)
    })

    it('mutliaddr, opts', (done) => {
      clientWorks(ipfsAPI(
        apiAddrs.a,
        {protocol: 'http'}
      ), done)
    })

    it('host, port', (done) => {
      clientWorks(ipfsAPI(
        apiAddr[2],
        apiAddr[4]
      ), done)
    })

    it('host, port, opts', (done) => {
      clientWorks(ipfsAPI(
        apiAddr[2],
        apiAddr[4],
        {protocol: 'http'}
      ), done)
    })
  })
})
