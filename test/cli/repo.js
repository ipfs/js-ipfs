/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoVersion = require('ipfs-repo').repoVersion

module.exports = (thing) => describe('repo', () => {
  it('get the repo version', () => {
    return thing.ipfs('repo version').then((out) => {
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })
})
