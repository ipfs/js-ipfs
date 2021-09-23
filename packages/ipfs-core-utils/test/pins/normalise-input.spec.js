/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { normaliseInput } from '../../src/pins/normalise-input.js'
import all from 'it-all'
import { CID } from 'multiformats/cid'

const STRING = () => '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt'
const PLAIN_CID = () => CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
const OBJECT_CID = () => ({ cid: CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'), recursive: true, metadata: { key: 'hello world' } })
const OBJECT_PATH = () => ({ path: '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt', recursive: true, metadata: { key: 'hello world' } })

/**
 * @param {import('../../src/pins/normalise-input').Source} input
 * @param {boolean} [withOptions]
 */
async function verifyNormalisation (input, withOptions) {
  const result = await all(normaliseInput(input))

  expect(result).to.have.lengthOf(1)
  expect(result[0]).to.have.property('path')

  if (withOptions) {
    expect(result[0]).to.have.property('recursive', true)
    expect(result[0]).to.have.deep.property('metadata', { key: 'hello world' })
  }
}

/**
 * @template T
 * @param {T} thing
 * @returns {T[]}
 */
function iterableOf (thing) {
  return [thing]
}

/**
 * @template T
 * @param {T} thing
 * @returns {AsyncIterable<T>}
 */
function asyncIterableOf (thing) {
  return (async function * () { // eslint-disable-line require-await
    yield thing
  }())
}

describe('pin normalise-input', function () {
  /**
   * @param {() => any} content
   * @param {string} name
   * @param {boolean} [withOptions]
   */
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
