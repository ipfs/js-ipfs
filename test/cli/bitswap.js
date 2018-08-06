/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const PeerId = require('peer-id')

const test = (thing) => describe.skip('bitswap', () => {
  let ipfs
  let peerId
  const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

  before(function (done) {
    this.timeout(60 * 1000)
    ipfs = thing.ipfs
    ipfs('block get ' + key)
      .then(() => {})
      .catch(() => {})
    PeerId.create((err, peer) => {
      if (err) {
        return done(err)
      }
      peerId = peer.toB58String()
      done()
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
      expect(out).to.include([
        'bitswap status',
        '  blocks received: 0',
        '  dup blocks received: 0',
        '  dup data received: 0B',
        '  wantlist [1 keys]',
        `    ${key}`,
        // We sometimes pick up partners while the tests run so our assertion ends here
        '  partners'
      ].join('\n'))
    })
  })

  // TODO Uncaught Error: Block was unwanted before it could be remotely retrieved
  it.skip('unwant', function () {
    return ipfs('bitswap unwant ' + key).then((out) => {
      expect(out).to.eql(`Key ${key} removed from wantlist\n`)
    })
  })
})
test.part = 'online'
module.exports = test
