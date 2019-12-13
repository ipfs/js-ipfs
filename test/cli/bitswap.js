/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOn = require('../utils/on-and-off').on
const CID = require('cids')
const waitFor = require('../utils/wait-for')

describe('bitswap', () => runOn((thing) => {
  let ipfs
  const key0 = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
  const key1 = 'zb2rhafnd6kEUujnoMkozHnWXY7XpWttyVDWKXfChqA42VTDU'

  before(() => {
    ipfs = thing.ipfs
  })

  before(() => {
    ipfs('block get ' + key0).catch(() => {})
    ipfs('block get ' + key1).catch(() => {})
  })

  before(async () => {
    const test = async () => {
      const out = await ipfs('bitswap wantlist')

      return out.includes(key0) && out.includes(key1)
    }

    await waitFor(test, {
      name: `${key0} and ${key1} to be wanted`,
      timeout: 60 * 1000
    })
  })

  it('should get wantlist with CIDs encoded in specified base', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap wantlist --cid-base=base64')
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64') + '\n')
  })

  it('stat --human', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap stat --human')

    expect(out).to.include('bitswap status')
    expect(out).to.match(/provides buffer:\s\d+$/m)
    expect(out).to.match(/blocks received:\s\d+$/m)
    expect(out).to.match(/blocks sent:\s\d+$/m)
    expect(out).to.match(/data received:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/data sent:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/dup blocks received:\s\d+$/m)
    expect(out).to.match(/dup data received:\s+[\d.]+\s[PTGMK]?B$/m)
    expect(out).to.match(/wantlist\s\[\d+\skeys\]$/m)
    expect(out).to.not.include(key0)
    expect(out).to.not.include(key1)
    expect(out).to.match(/partners\s\[\d+\]$/m)
  })

  it('should get stats with wantlist CIDs encoded in specified base', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap stat --cid-base=base64')
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64'))
  })

  // TODO: missing unwant with cid-base arg
}))
