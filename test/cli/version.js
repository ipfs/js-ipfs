/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pkgversion = require('../../package.json').version
const runOnAndOff = require('../utils/on-and-off')

describe('version', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the version', () => {
    return ipfs('version').then((out) => {
      expect(out).to.eql(
        `js-ipfs version: ${pkgversion}\n`
      )
    })
  })

  it('handles --number', () => {
    return ipfs('version --number').then(out =>
      expect(out).to.eql(`${pkgversion}\n`)
    )
  })

  it('handles --commit', () => {
    return ipfs('version --commit').then(out =>
      expect(out).to.eql(`js-ipfs version: ${pkgversion}-\n`)
    )
  })

  it('handles --all', () => {
    // NOTE does not confirm repo version number
    return ipfs('version --all').then(out =>
      expect(out).to.include(
        `js-ipfs version: ${pkgversion}-
Repo version: `
      )
    )
  })

  it('handles --repo', () => {
    // TODO how can we get the repo version number to confirm test is correct?
    return ipfs('version --repo').then(out =>
      expect(out).to.include('\n') // printed something
    )
  })
}))
