/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('general cli options', () => runOnAndOff.off((thing) => {
  it('should handle --silent flag', () => {
    return thing.ipfs('help --silent').then((out) => {
      expect(out).to.be.empty()
    })
  })

  it('should handle unknown arguments correctly', () => {
    return thing.ipfs('random --again').then((out) => {
      expect(out).to.include('Unknown arguments: again, random')
      expect(out).to.include('random')
      expect(out).to.include('again')
    })
  })
}))
