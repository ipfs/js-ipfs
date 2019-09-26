/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')
const path = require('path')

describe('dag', () => runOnAndOff.off((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get', async function () {
    this.timeout(20 * 1000)

    // put test eth-block
    const out = await ipfs(`block put --format eth-block --mhtype keccak-256 ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/eth-block`)
    expect(out).to.eql('bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq\n')

    // lookup path on eth-block
    const out2 = await ipfs('dag get bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq/parentHash')
    const expectHash = Buffer.from('c8c0a17305adea9bbb4b98a52d44f0c1478f5c48fc4b64739ee805242501b256', 'hex')
    expect(out2).to.be.eql('0x' + expectHash.toString('hex') + '\n')
  })
}))
