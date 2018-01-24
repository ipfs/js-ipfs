/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const pkgversion = require('../../package.json').version
const runOnAndOff = require('../utils/on-and-off')

function getRepoVersion (repoPath) {
  const versionPath = path.join(repoPath, 'version')
  return String(fs.readFileSync(versionPath))
}

describe('version', () => runOnAndOff((thing) => {
  let ipfs
  let repoVersion

  before(() => {
    ipfs = thing.ipfs
    repoVersion = getRepoVersion(ipfs.repoPath)
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
    return ipfs('version --all').then(out =>
      expect(out).to.include(
        `js-ipfs version: ${pkgversion}-
Repo version: ${repoVersion}
`
      )
    )
  })

  it('handles --repo', () => {
    return ipfs('version --repo').then(out => {
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })
}))
