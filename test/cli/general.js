/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')

describe('general cli options', () => runOnAndOff.off((thing) => {
  it('should handle --silent flag', async () => {
    const out = await thing.ipfs('help --silent')
    expect(out).to.be.empty()
  })

  it('should handle unknown arguments correctly', async () => {
    const out = await thing.ipfs('random --again')
    expect(out).to.include('Unknown arguments: again, random')
    expect(out).to.include('random')
    expect(out).to.include('again')
  })
}))
