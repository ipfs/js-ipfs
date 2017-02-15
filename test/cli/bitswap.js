/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOn = require('../utils/on-and-off').on

describe('bitswap', () => runOn((thing) => {
  let ipfs
  const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

  before((done) => {
    ipfs = thing.ipfs
    ipfs('block get ' + key)
      .then(() => {})
      .catch(() => {})
    setTimeout(done, 100)
  })

  it('wantlist', () => {
    return ipfs('bitswap wantlist').then((out) => {
      expect(out).to.eql(key)
    })
  })

  it('stat', () => {
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
      ].join('\n'))
    })
  })
}))
