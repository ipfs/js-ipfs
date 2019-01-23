/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('resolve', () => {
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

  it('should resolve an IPFS path non-link', (done) => {
    const content = { path: { to: { file: 'foobar' } } }
    const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }

    ipfs.dag.put(content, options, (err, cid) => {
      expect(err).to.not.exist()

      // FIXME: This should be /ipld/... but that's not supported yet.
      const path = `/ipfs/${cid.toBaseEncodedString()}/path/to/file`
      ipfs.resolve(path, (err, resolved) => {
        expect(err).to.not.exist()
        expect(resolved).to.equal(path)
        done()
      })
    })
  })
})
