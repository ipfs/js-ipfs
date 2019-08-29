/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const path = require('path')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: path.resolve(`${__dirname}/../../src/cli/bin.js`) })

describe('version endpoint', () => {
  let ipfs = null
  let ipfsd = null
  before(async function () {
    this.timeout(20 * 1000)
    ipfsd = await df.spawn({
      initOptions: { bits: 512 },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    })
    ipfs = ipfsd.api
  })

  after(() => ipfsd.stop())

  describe('.version', () => {
    it('get the version', (done) => {
      ipfs.version((err, result) => {
        expect(err).to.not.exist()
        expect(result).to.have.a.property('version')
        expect(result).to.have.a.property('commit')
        expect(result).to.have.a.property('repo')
        done()
      })
    })
  })
})
