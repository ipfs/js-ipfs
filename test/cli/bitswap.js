/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOn = require('../utils/on-and-off').on
const PeerId = require('peer-id')

describe('bitswap', () => runOn((thing) => {
  let ipfs
  let peerId
  const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

  before((done) => {
    ipfs = thing.ipfs
    ipfs('block get ' + key)
      .then(() => {})
      .catch(() => {})
    PeerId.create((err, peer) => {
      expect(err).to.not.exist()
      peerId = peer.toB58String()
      setTimeout(done, 250)
    })
  })

  it('wantlist', function () {
    this.timeout(20 * 1000)
    return ipfs('bitswap wantlist').then((out) => {
      expect(out).to.eql(key + '\n')
    })
  })

  it('wantlist peerid', function () {
    this.timeout(20 * 1000)
    return ipfs('bitswap wantlist ' + peerId).then((out) => {
      expect(out).to.eql('')
    })
  })

  it('stat', function () {
    this.timeout(20 * 1000)

    return ipfs('bitswap stat').then((out) => {
      expect(out).to.be.eql([
        'bitswap status',
        '  blocks received: 0',
        '  dup blocks received: 0',
        '  dup data received: 0B',
        '  wantlist [1 keys]',
        `    ${key}`,
        '  partners [0]',
        '    '
      ].join('\n') + '\n')
    })
  })

  it('unwant', function () {
    return ipfs('bitswap unwant ' + key).then((out) => {
      expect(out).to.eql(`Key ${key} removed from wantlist\n`)
    })
  })
}))
