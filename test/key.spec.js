/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.key', function () {
  this.timeout(50 * 1000)

  let ipfsd
  let ipfs

  before(async () => {
    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })
    ipfs = ipfsClient(ipfsd.apiAddr)
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  describe('.gen', () => {
    it('create a new rsa key', async () => {
      const res = await ipfs.key.gen('foobarsa', { type: 'rsa', size: 2048 })

      expect(res).to.exist()
    })

    it('create a new ed25519 key', async () => {
      const res = await ipfs.key.gen('bazed', { type: 'ed25519' })

      expect(res).to.exist()
    })
  })

  describe('.list', () => {
    it('both keys show up + self', async () => {
      const res = await ipfs.key.list()

      expect(res).to.exist()
      expect(res.length).to.equal(3)
    })
  })
})
