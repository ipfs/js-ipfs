/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pkgversion = require('../../package.json').version
const repoPath = require('./index').repoPath
const runOnAndOff = require('../utils/on-and-off')
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe('version', () => runOnAndOff(repoPath, () => {
  it('get the version', () => {
    return ipfs('version').then((out) => {
      expect(out).to.be.eql(
        `js-ipfs version: ${pkgversion}`
      )
    })
  })
}))
