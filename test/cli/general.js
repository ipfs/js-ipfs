/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

// TODO have to figure out how to make this work exactly.
// Problem is that there is no `help` command to load...
const test = (thing) => describe.skip('general cli options', () => {
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
})
test.part = 'offline'
module.exports = test
