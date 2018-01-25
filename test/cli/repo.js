/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

function getRepoVersion (repoPath) {
  const versionPath = path.join(repoPath, 'version')
  return String(fs.readFileSync(versionPath))
}

describe('repo', () => runOnAndOff((thing) => {
  let ipfs
  let repoVersion

  before(() => {
    ipfs = thing.ipfs
    repoVersion = getRepoVersion(ipfs.repoPath)
  })

  it('get the repo version', () => {
    return ipfs('repo version').then((out) => {
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })
}))
