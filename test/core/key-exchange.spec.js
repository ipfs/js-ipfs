/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const hat = require('hat')
const factory = require('../utils/factory')

describe('key exchange', function () {
  this.timeout(20 * 1000)
  const df = factory()
  let ipfs
  let selfPem
  const passwordPem = hat()

  before(async () => {
    ipfs = (await df.spawn({
      ipfsOptions: {
        pass: hat()
      }
    })).api
  })

  after(() => df.clean())

  it('exports', (done) => {
    ipfs.key.export('self', passwordPem, (err, pem) => {
      expect(err).to.not.exist()
      expect(pem).to.exist()
      selfPem = pem
      done()
    })
  })

  it('imports', function (done) {
    ipfs.key.import('clone', selfPem, passwordPem, (err, key) => {
      expect(err).to.not.exist()
      expect(key).to.exist()
      expect(key).to.have.property('name', 'clone')
      expect(key).to.have.property('id')
      done()
    })
  })
})
