/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { nanoid } = require('nanoid')
const factory = require('../utils/factory')

describe('key exchange', function () {
  this.timeout(20 * 1000)
  const df = factory()
  let ipfs
  let selfPem
  const passwordPem = nanoid()

  before(async () => {
    ipfs = (await df.spawn()).api
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

  it('should create ed25519 keys', async () => {
    const name = 'my-ed-key'
    const pass = 'password for my ed key'
    const key = await ipfs.key.gen(name, { type: 'ed25519' })
    // export it
    const exportedKey = await ipfs.key.export(name, pass)
    // delete it
    await ipfs.key.rm(name)
    // import it back to the same name
    const imported = await ipfs.key.import(name, exportedKey, pass)
    expect(imported.id).to.equal(key.id)
  })

  it('should create secp256k1 keys', async () => {
    const name = 'my-secp-key'
    const pass = 'password for my secp key'
    const key = await ipfs.key.gen(name, { type: 'secp256k1' })
    // export it
    const exportedKey = await ipfs.key.export(name, pass)
    // delete it
    await ipfs.key.rm(name)
    // import it back to the same name
    const imported = await ipfs.key.import(name, exportedKey, pass)
    expect(imported.id).to.equal(key.id)
  })
})
