/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const os = require('os')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const repoVersion = require('ipfs-repo').repoVersion
const pkgversion = require('../../package.json').version
const runOnAndOff = require('../utils/on-and-off')

describe('version', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the version', async () => {
    const out = await ipfs('version')
    expect(out).to.eql(`js-ipfs version: ${pkgversion}\n`)
  })

  it('handles --number', async () => {
    const out = await ipfs('version --number')
    expect(out).to.eql(`${pkgversion}\n`)
  })

  it('handles --commit', async () => {
    const out = await ipfs('version --commit')
    expect(out).to.eql(`js-ipfs version: ${pkgversion}-\n`)
  })

  describe('handles --all', function () {
    it('prints js-ipfs version', async () => {
      const out = await ipfs('version --all')
      expect(out).to.include(`js-ipfs version: ${pkgversion}`)
    })

    it('prints repo version', async () => {
      const out = await ipfs('version --all')
      expect(out).to.include(`Repo version: ${repoVersion}`)
    })

    it('prints arch/platform', async () => {
      const out = await ipfs('version --all')
      expect(out).to.include(`System version: ${os.arch()}/${os.platform()}`)
    })

    it('prints Node.js version', async () => {
      const out = await ipfs('version --all')
      expect(out).to.include(`Node.js version: ${process.version}`)
    })
  })

  it('handles --repo', async () => {
    const out = await ipfs('version --repo')
    expect(out).to.eql(`${repoVersion}\n`)
  })
}))
