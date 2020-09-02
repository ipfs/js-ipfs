/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const os = require('os')
const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')

const defaultOptions = {
  timeout: undefined
}

describe('version', () => {
  let ipfs

  before(() => {
    ipfs = {
      version: sinon.stub()
    }
  })

  it('get the version', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      version: 5
    })
    const out = await cli('version', { ipfs })
    expect(out).to.equal('js-ipfs version: 5\n')
  })

  it('handles --number', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      version: 5
    })
    const out = await cli('version --number', { ipfs })
    expect(out).to.equal('5\n')
  })

  it('handles --number (short option)', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      version: 5
    })
    const out = await cli('version -n', { ipfs })
    expect(out).to.equal('5\n')
  })

  it('handles --commit', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      version: 5,
      commit: '123'
    })
    const out = await cli('version --commit', { ipfs })
    expect(out).to.equal('js-ipfs version: 5-123\n')
  })

  it('handles --repo', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      repo: 6
    })

    const out = await cli('version --repo', { ipfs })
    expect(out).to.equal('6\n')
  })

  it('prints js-ipfs version with --all', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      version: 5
    })

    const out = await cli('version --all', { ipfs })
    expect(out).to.include('js-ipfs version: 5')
  })

  it('prints repo version with --all', async () => {
    ipfs.version.withArgs(defaultOptions).resolves({
      repo: 6
    })

    const out = await cli('version --all', { ipfs })
    expect(out).to.include('Repo version: 6')
  })

  it('prints arch/platform with --all', async () => {
    const out = await cli('version --all', { ipfs })
    expect(out).to.include(`System version: ${os.arch()}/${os.platform()}`)
  })

  it('prints Node.js version with --all', async () => {
    const out = await cli('version --all', { ipfs })
    expect(out).to.include(`Node.js version: ${process.version}`)
  })

  it('prints version with timeout', async () => {
    ipfs.version.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).resolves({
      version: 5
    })
    const out = await cli('version --timeout=1s', { ipfs })
    expect(out).to.equal('js-ipfs version: 5\n')
  })
})
