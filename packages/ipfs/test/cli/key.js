/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')
const hat = require('hat')

describe('key', () => runOnAndOff.off((thing) => {
  const name = 'test-key-' + hat()
  const newName = 'test-key-' + hat()
  const pass = '--pass ' + hat()
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('gen', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs(`${pass} key gen ${name} --type rsa --size 2048`)
    expect(out).to.include(name)
  })

  it('list', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs(`${pass} key list`)
    expect(out).to.include(name)
  })

  it('rename', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs(`${pass} key rename ${name} ${newName}`)
    expect(out).to.include(newName)
  })

  it('rm', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs(`${pass} key rm ${newName}`)
    expect(out).to.include(newName)
  })
}))
