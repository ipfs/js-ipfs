/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

describe('dns', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      dns: sinon.stub()
    }
  })

  it('resolves ipfs.io dns', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      recursive: true,
      format: undefined
    }).returns(path)

    const out = await cli('dns ipfs.io', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('resolves ipfs.io dns non-recursively', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      recursive: false,
      format: undefined
    }).returns(path)

    const out = await cli('dns ipfs.io --recursive=false', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('resolves ipfs.io dns recursively (short option)', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      recursive: false,
      format: undefined
    }).returns(path)

    const out = await cli('dns ipfs.io -r false', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('resolves ipfs.io dns with a format', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      recursive: true,
      format: 'derp'
    }).returns(path)

    const out = await cli('dns ipfs.io --format derp', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })
})
