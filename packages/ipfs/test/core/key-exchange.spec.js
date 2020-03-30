/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { nanoid } = require('nanoid')
const factory = require('../utils/factory')

describe('key exchange', function () {
  this.timeout(20 * 1000)
  const df = factory()
  let ipfs
  let selfPem
  const passwordPem = nanoid()

  before(async () => {
    ipfs = (await df.spawn({
      ipfsOptions: {
        pass: nanoid()
      }
    })).api
  })

  after(() => df.clean())

  it('should export key', async () => {
    const pem = await ipfs.key.export('self', passwordPem)
    expect(pem).to.exist()
    selfPem = pem
  })

  it('should import key', async () => {
    const key = await ipfs.key.import('clone', selfPem, passwordPem)
    expect(key).to.exist()
    expect(key).to.have.property('name', 'clone')
    expect(key).to.have.property('id')
  })
})
