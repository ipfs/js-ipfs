/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('.dns', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(20 * 1000)

    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = _ipfsd.api
      done()
    })
  })

  after((done) => {
    if (ipfsd) {
      ipfsd.stop(done)
    } else {
      done()
    }
  })

  // skipping because there is an error in https://ipfs.io/api/v0/dns?arg=ipfs.io
  // unskip once this is resolved: https://github.com/ipfs/go-ipfs/issues/6086
  it.skip('should resolve ipfs.io', () => {
    return ipfs.dns('ipfs.io').then(res => {
      // matches pattern /ipns/<ipnsaddress>
      expect(res).to.match(/\/ipns\/.+$/)
    })
  })

  it('should recursively resolve ipfs.io', () => {
    return ipfs.dns('ipfs.io', { recursive: true }).then(res => {
      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })
  })

  it('should resolve subdomain docs.ipfs.io', () => {
    return ipfs.dns('docs.ipfs.io').then(res => {
      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })
  })
})
