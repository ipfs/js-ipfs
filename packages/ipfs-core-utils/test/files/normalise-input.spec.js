/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import blobToIt from 'blob-to-it'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import all from 'it-all'
import { File } from '@web-std/file'
import { normaliseInput } from '../../src/files/normalise-input.js'
import { isNode } from 'ipfs-utils/src/env.js'
import resolve from 'aegir/utils/resolve.js'

const { Blob, ReadableStream } = globalThis

const STRING = () => 'hello world'
const NEWSTRING = () => new String('hello world') // eslint-disable-line no-new-wrappers
const BUFFER = () => uint8ArrayFromString(STRING())
const ARRAY = () => Array.from(BUFFER())
const TYPEDARRAY = () => Uint8Array.from(ARRAY())
/** @type {() => Blob} */
let BLOB

if (Blob) {
  BLOB = () => new Blob([
    STRING()
  ])
}

/**
 * @param {import('ipfs-unixfs-importer').ImportCandidate[]} input
 */
async function verifyNormalisation (input) {
  expect(input.length).to.equal(1)
  expect(input[0].path).to.equal('')

  let content = input[0].content

  if (Blob && content instanceof Blob) {
    content = blobToIt(content)
  }

  if (!content || content instanceof Uint8Array) {
    throw new Error('Content expected')
  }

  await expect(all(content)).to.eventually.deep.equal([BUFFER()])
}

/**
 * @param {*} input
 */
async function testContent (input) {
  const result = await all(normaliseInput(input))

  await verifyNormalisation(result)
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

/**
 * @param {*} thing
 */
function browserReadableStreamOf (thing) {
  return new ReadableStream({
    start (controller) {
      controller.enqueue(thing)
      controller.close()
    }
  })
}

describe('normalise-input', function () {
  /**
   * @param {() => any} content
   * @param {string} name
   * @param {boolean} isBytes
   */
  function testInputType (content, name, isBytes) {
    it(name, async function () {
      await testContent(content())
    })

    if (isBytes) {
      if (ReadableStream) {
        it(`ReadableStream<${name}>`, async function () {
          await testContent(browserReadableStreamOf(content()))
        })
      }

      it(`Iterable<${name}>`, async function () {
        await testContent(iterableOf(content()))
      })

      it(`AsyncIterable<${name}>`, async function () {
        await testContent(asyncIterableOf(content()))
      })
    }

    it(`{ path: '', content: ${name} }`, async function () {
      await testContent({ path: '', content: content() })
    })

    if (isBytes) {
      if (ReadableStream) {
        it(`{ path: '', content: ReadableStream<${name}> }`, async function () {
          await testContent({ path: '', content: browserReadableStreamOf(content()) })
        })
      }

      it(`{ path: '', content: Iterable<${name}> }`, async function () {
        await testContent({ path: '', content: iterableOf(content()) })
      })

      it(`{ path: '', content: AsyncIterable<${name}> }`, async function () {
        await testContent({ path: '', content: asyncIterableOf(content()) })
      })
    }

    if (ReadableStream) {
      it(`ReadableStream<${name}>`, async function () {
        await testContent(browserReadableStreamOf(content()))
      })
    }

    it(`Iterable<{ path: '', content: ${name} }`, async function () {
      await testContent(iterableOf({ path: '', content: content() }))
    })

    it(`AsyncIterable<{ path: '', content: ${name} }`, async function () {
      await testContent(asyncIterableOf({ path: '', content: content() }))
    })

    if (isBytes) {
      if (ReadableStream) {
        it(`Iterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
          await testContent(iterableOf({ path: '', content: browserReadableStreamOf(content()) }))
        })
      }

      it(`Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: asyncIterableOf(content()) }))
      })

      if (ReadableStream) {
        it(`AsyncIterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
          await testContent(asyncIterableOf({ path: '', content: browserReadableStreamOf(content()) }))
        })
      }

      it(`AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }))
      })
    }
  }

  describe('String', () => {
    testInputType(STRING, 'String', true)
    testInputType(NEWSTRING, 'new String()', true)
  })

  describe('Buffer', () => {
    testInputType(BUFFER, 'Buffer', true)
  })

  describe('Blob', () => {
    if (!Blob) {
      return
    }

    testInputType(BLOB, 'Blob', false)
  })

  describe('@web-std/file', () => {
    it('normalizes File input', async () => {
      const FILE = new File([BUFFER()], 'test-file.txt')

      await testContent(FILE)
    })
  })

  describe('Iterable<Number>', () => {
    testInputType(ARRAY, 'Iterable<Number>', false)
  })

  describe('TypedArray', () => {
    testInputType(TYPEDARRAY, 'TypedArray', true)
  })

  if (isNode) {
    /** @type {import('fs')} */
    let fs

    before(async () => {
      fs = await import('fs')
    })

    describe('Node fs.ReadStream', () => {
      const NODEFSREADSTREAM = () => {
        const path = resolve('test/fixtures/file.txt', 'ipfs-core-utils')

        return fs.createReadStream(path)
      }

      testInputType(NODEFSREADSTREAM, 'Node fs.ReadStream', false)

      it('Iterable<Node fs.ReadStream>', async function () {
        await testContent(iterableOf(NODEFSREADSTREAM()))
      })

      it('AsyncIterable<Node fs.ReadStream>', async function () {
        await testContent(asyncIterableOf(NODEFSREADSTREAM()))
      })
    })
  }
})
