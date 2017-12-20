/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')
const hat = require('hat')

describe('key', () => runOnAndOff.off((thing) => {
  const name = 'test-key-' + hat()
  const newName = 'test-key-' + hat()
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('gen', function () {
    this.timeout(40 * 1000)

    return ipfs(`key gen ${name} --type rsa --size 2048`)
      .then((out) => {
        expect(out).to.include(`generated ${name}`)
      })
  })

  it('list', function () {
    this.timeout(20 * 1000)

    return ipfs('key list')
      .then((out) => {
        expect(out).to.include(name)
      })
  })

  it('rename', function () {
    this.timeout(20 * 1000)

    return ipfs(`key rename ${name} ${newName}`)
      .then((out) => {
        expect(out).to.include(`renamed to ${newName}`)
      })
  })

  it('rm', function () {
    this.timeout(20 * 1000)

    return ipfs(`key rm ${newName}`)
      .then((out) => {
        expect(out).to.include(newName)
      })
  })
}))
