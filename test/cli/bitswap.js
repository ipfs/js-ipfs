/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOn = require('../utils/on-and-off').on
const PeerId = require('peer-id')
const CID = require('cids')
const waitFor = require('../utils/wait-for')

describe('bitswap', () => runOn((thing) => {
  let ipfs
  let peerId
  const key0 = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
  const key1 = 'zb2rhafnd6kEUujnoMkozHnWXY7XpWttyVDWKXfChqA42VTDU'

  before(() => {
    ipfs = thing.ipfs
  })

  before(() => {
    ipfs('block get ' + key0).catch(() => {})
    ipfs('block get ' + key1).catch(() => {})
  })

  before(function (done) {
    PeerId.create({ bits: 512 }, (err, peer) => {
      expect(err).to.not.exist()
      peerId = peer.toB58String()
      done()
    })
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

  it('wantlist', async function () {
    const out = await ipfs('bitswap wantlist')
    expect(out).to.include(key0)
    expect(out).to.include(key1)
  })

  it('should get wantlist with CIDs encoded in specified base', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap wantlist --cid-base=base64')
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64') + '\n')
  })

  it('wantlist peerid', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap wantlist ' + peerId)
    expect(out).to.eql('')
  })

  it('stat', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap stat')
    expect(out).to.include([
      'bitswap status',
      '  blocks received: 0',
      '  dup blocks received: 0',
      '  dup data received: 0B',
      // We sometimes pick up partners while the tests run and the order of
      // wanted keys is not defined so our assertion ends here.
      '  wantlist [2 keys]'
    ].join('\n'))
    expect(out).to.include(key0)
    expect(out).to.include(key1)
  })

  it('should get stats with wantlist CIDs encoded in specified base', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('bitswap stat --cid-base=base64')
    expect(out).to.include(new CID(key1).toBaseEncodedString('base64'))
  })

  it('unwant', async function () {
    const out = await ipfs('bitswap unwant ' + key0)
    expect(out).to.eql(`Key ${key0} removed from wantlist\n`)
  })
}))
