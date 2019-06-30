/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('refs-local', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  it('prints CID of all blocks', function () {
    this.timeout(20 * 1000)

    return ipfs('refs-local')
      .then((out) => {
        const lines = out.split('\n')
        expect(lines.includes('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN')).to.eql(true)
        expect(lines.includes('QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU')).to.eql(true)
      })
  })
}))
