/* eslint-env mocha */
'use strict'

const encoder = require('../../src/utils/keychain-encoder')
const Key = require('interface-datastore').Key
const { expect } = require('interface-ipfs-core/src/utils/mocha')

function test (input, expected, fnc) {
  input = new Key(input)
  const output = fnc(input)

  expect(output.toString()).to.equal(expected)
}

describe('keychain-encode', () => {
  it('encode keys', () => {
    test('/self', '/key_onswyzq', encoder.convert)
    test('bbbba', '/key_mjrgeytb', encoder.convert)
    test('/some/path/self', '/some/path/key_onswyzq', encoder.convert)
  })
  it('decode keys', () => {
    test('/key_onswyzq', '/self', encoder.invert)
    test('key_mjrgeytb', '/bbbba', encoder.invert)
    test('/some/path/key_onswyzq', '/some/path/self', encoder.invert)
  })
  it('decode expects specific format', () => {
    expect(() => { encoder.invert(new Key('/some/path/onswyzq')) }).to.throw('Unknown')
  })
})
