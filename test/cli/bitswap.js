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
  const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

  before(() => {
    ipfs = thing.ipfs
  })

  before(() => {
    ipfs('block get ' + key).catch(() => {})
  })

  before(function (done) {
    this.timeout(60 * 1000)

    PeerId.create({ bits: 512 }, (err, peer) => {
      expect(err).to.not.exist()
      peerId = peer.toB58String()
      done()
    })
  })

  before(function (done) {
    this.timeout(2 * 60 * 1000)

    const test = (cb) => {
      ipfs('bitswap wantlist')
        .then(out => cb(null, out.includes(key)))
        .catch(cb)
    }

    waitFor(test, {
      name: key + ' to be wanted',
      timeout: 60 * 1000
    }, done)
  })

  it('wantlist', function () {
    this.timeout(20 * 1000)
    return ipfs('bitswap wantlist').then((out) => {
      expect(out).to.eql(key + '\n')
    })
  })

  it('should get wantlist with CIDs encoded in specified base', function () {
    this.timeout(20 * 1000)
    return ipfs('bitswap wantlist --cid-base=base64').then((out) => {
      expect(out).to.eql(new CID(key).toV1().toBaseEncodedString('base64') + '\n')
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

  it('should get stats with wantlist CIDs encoded in specified base', function () {
    this.timeout(20 * 1000)
    return ipfs('bitswap stat --cid-base=base64').then((out) => {
      expect(out).to.include(new CID(key).toV1().toBaseEncodedString('base64'))
    })
  })

  it('unwant', function () {
    return ipfs('bitswap unwant ' + key).then((out) => {
      expect(out).to.eql(`Key ${key} removed from wantlist\n`)
    })
  })
}))
