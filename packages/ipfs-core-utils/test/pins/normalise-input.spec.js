'use strict'

/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const normalise = require('../../src/pins/normalise-input')
const all = require('it-all')
const CID = require('cids')

const STRING = () => '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt'
const PLAIN_CID = () => new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
const OBJECT_CID = () => ({ cid: new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'), recursive: true, metadata: { key: 'hello world' } })
const OBJECT_PATH = () => ({ path: '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt', recursive: true, metadata: { key: 'hello world' } })

async function verifyNormalisation (input, withOptions) {
  const result = await all(normalise(input))

  expect(result).to.have.lengthOf(1)
  expect(result[0]).to.have.property('path')

  if (withOptions) {
    expect(result[0]).to.have.property('recursive', true)
    expect(result[0]).to.have.deep.property('metadata', { key: 'hello world' })
  }
}

function iterableOf (thing) {
  return [thing]
}

function asyncIterableOf (thing) {
  return (async function * () { // eslint-disable-line require-await
    yield thing
  }())
}

describe('pin normalise-input', function () {
  function testInputType (content, name, withOptions) {
    it(name, async function () {
      await verifyNormalisation(content(), withOptions)
    })

    it(`Iterable<${name}>`, async function () {
      await verifyNormalisation(iterableOf(content()), withOptions)
    })

    it(`AsyncIterable<${name}>`, async function () {
      await verifyNormalisation(asyncIterableOf(content()), withOptions)
    })
  }

  describe('String', () => {
    testInputType(STRING, 'String')
  })

  describe('CID', () => {
    testInputType(PLAIN_CID, 'CID')
  })

  describe('Object with CID', () => {
    testInputType(OBJECT_CID, 'Object with CID', true)
  })

  describe('Object with path', () => {
    testInputType(OBJECT_PATH, 'Object with path', true)
  })
})
