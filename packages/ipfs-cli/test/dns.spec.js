/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

const defaultOptions = {
  recursive: true,
  timeout: undefined
}

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

    ipfs.dns.withArgs(domain, defaultOptions).returns(path)

    const out = await cli('dns ipfs.io', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('resolves ipfs.io dns non-recursively', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      recursive: false
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
      ...defaultOptions,
      recursive: false
    }).returns(path)

    const out = await cli('dns ipfs.io -r false', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('resolves ipfs.io dns with a timeout', async () => {
    const domain = 'ipfs.io'
    const path = 'path'

    ipfs.dns.withArgs(domain, {
      ...defaultOptions,
      timeout: 1000
    }).returns(path)

    const out = await cli('dns ipfs.io --timeout=1s', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })

  it('strips control characters from response', async () => {
    const domain = 'ipfs.io'
    const path = 'path'
    const junkPath = `${path}\n\b\t`

    ipfs.dns.withArgs(domain, defaultOptions).returns(junkPath)

    const out = await cli('dns ipfs.io', {
      ipfs
    })
    expect(out).to.equal(`${path}\n`)
  })
})
