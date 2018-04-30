/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const f = require('./utils/factory')
const ipfsAPI = require('../src/index.js')

function clientWorks (client, done) {
  client.id((err, id) => {
    expect(err).to.not.exist()

    expect(id).to.have.a.property('id')
    expect(id).to.have.a.property('publicKey')
    done()
  })
}

describe('ipfs-api constructor tests', () => {
  describe('parameter permuations', () => {
    let apiAddr
    let ipfsd

    before(function (done) {
      this.timeout(60 * 1000) // slow CI

      f.spawn({ initOptions: { bits: 1024 } }, (err, node) => {
        expect(err).to.not.exist()
        ipfsd = node
        apiAddr = node.apiAddr.toString()
        done()
      })
    })

    after((done) => ipfsd.stop(done))

    it('opts', (done) => {
      const splitted = apiAddr.split('/')
      clientWorks(ipfsAPI({
        host: splitted[2],
        port: splitted[4],
        protocol: 'http'
      }), done)
    })

    it('mutliaddr, opts', (done) => {
      clientWorks(ipfsAPI(apiAddr, { protocol: 'http' }), done)
    })

    it('host, port', (done) => {
      const splitted = apiAddr.split('/')

      clientWorks(ipfsAPI(splitted[2], splitted[4]), done)
    })

    it('host, port, opts', (done) => {
      const splitted = apiAddr.split('/')

      clientWorks(ipfsAPI(splitted[2], splitted[4], { protocol: 'http' }), done)
    })
  })
})
