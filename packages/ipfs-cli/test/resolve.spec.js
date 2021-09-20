/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { CID } from 'multiformats/cid'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

const defaultOptions = {
  recursive: true,
  cidBase: 'base58btc',
  timeout: undefined
}

describe('resolve', () => {
  let ipfs
  const cid = CID.parse('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')

  beforeEach(() => {
    ipfs = {
      resolve: sinon.stub()
    }
  })

  it('resolves a CID', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), defaultOptions).resolves(resolved)

    const out = await cli(`resolve ${cid}`, { ipfs })
    expect(out).to.equal(resolved + '\n')
  })

  it('resolves a CID recursively by default', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), defaultOptions).resolves(resolved)

    const out = await cli(`resolve ${cid} --recursive`, { ipfs })
    expect(out).to.equal(resolved + '\n')
  })

  it('allows non-recursive lookups with flag', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      recursive: false
    }).resolves(resolved)

    const out = await cli(`resolve ${cid} --recursive=false`, { ipfs })
    expect(out).to.equal(resolved + '\n')
  })

  it('resolves a CID with a timeout', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).resolves(resolved)

    const out = await cli(`resolve ${cid} --timeout 1s`, { ipfs })
    expect(out).to.equal(resolved + '\n')
  })

  it('strips control characters when resolving a CID', async () => {
    const resolved = `/ipfs/${cid}/derp/\bherp`

    ipfs.resolve.withArgs(cid.toString(), defaultOptions).resolves(resolved)

    const out = await cli(`resolve ${cid}`, { ipfs })
    expect(out).to.equal(`/ipfs/${cid}/derp/herp\n`)
  })
})
