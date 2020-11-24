/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const CID = require('cids')
const cli = require('./utils/cli')
const sinon = require('sinon')

const defaultOptions = {
  recursive: false,
  cidBase: undefined,
  timeout: undefined
}

describe('resolve', () => {
  let ipfs
  const cid = new CID('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')

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

  it('resolves a CID recursively', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      recursive: true
    }).resolves(resolved)

    const out = await cli(`resolve ${cid} --recursive`, { ipfs })
    expect(out).to.equal(resolved + '\n')
  })

  it('resolves a CID recursively (short option)', async () => {
    const resolved = `/ipfs/${cid}`

    ipfs.resolve.withArgs(cid.toString(), {
      ...defaultOptions,
      recursive: true
    }).resolves(resolved)

    const out = await cli(`resolve ${cid} -r`, { ipfs })
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
