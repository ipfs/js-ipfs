/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (thing) => describe.only('bitswap', () => {
  let ipfs
  const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

  it('wantlist', function () {
    this.timeout(20 * 1000)
    thing.ipfs('block get ' + key).catch(() => {})
    return new Promise((resolve) => {
      setTimeout(() => {
          thing.ipfs('bitswap wantlist').then((out) => {
            expect(out).to.eql(key + '\n')
            resolve()
          })
      }, 1000)
    })
  })

  // TODO @hacdias fix this with https://github.com/ipfs/js-ipfs/pull/1198
  it.skip('stat', function () {
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
})
module.exports.part = 'online'
