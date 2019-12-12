/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const factory = require('../utils/factory')

describe('dag', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfs

  before(async () => {
    ipfs = (await df.spawn()).api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should callback with error for invalid string CID input', (done) => {
      ipfs.dag.get('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })

    it('should callback with error for invalid buffer CID input', (done) => {
      ipfs.dag.get(Buffer.from('INVALID CID'), (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })

  describe('tree', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.dag.tree('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })
})
