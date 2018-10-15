/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const hat = require('hat')

const test = (thing) => describe('key', () => {
  const name = 'test-key-' + hat()
  const newName = 'test-key-' + hat()
  const pass = '--pass ' + hat()
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('gen', function () {
    this.timeout(40 * 1000)

    return ipfs(`${pass} key gen ${name} --type rsa --size 2048`)
      .then((out) => {
        expect(out).to.include(name)
      })
  })

  it('list', function () {
    this.timeout(20 * 1000)

    return ipfs(`${pass} key list`)
      .then((out) => {
        expect(out).to.include(name)
      })
  })

  it('rename', function () {
    this.timeout(20 * 1000)

    return ipfs(`${pass} key rename ${name} ${newName}`)
      .then((out) => {
        expect(out).to.include(newName)
      })
  })

  it('rm', function () {
    this.timeout(20 * 1000)

    return ipfs(`${pass} key rm ${newName}`)
      .then((out) => {
        expect(out).to.include(newName)
      })
  })
})
test.part = 'offline'
module.exports = test
