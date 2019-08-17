/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const path = require('path')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: path.resolve(`${__dirname}/../../src/cli/bin.js`) })

describe('dns endpoint', () => {
  let ipfs = null
  let ipfsd = null
  before(async function () {
    this.timeout(20 * 1000)
    ipfsd = await df.spawn({
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    })
    ipfs = ipfsd.api
  })

  after(() => ipfsd.stop())

  describe('.dns', () => {
    it('resolve ipfs.io dns', function (done) {
      this.timeout(40 * 1000)

      ipfs.dns('ipfs.io', (err, result) => {
        expect(err).to.not.exist()
        expect(result).to.exist()
        done()
      })
    })
  })
})
