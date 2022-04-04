/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import blobToIt from 'blob-to-it'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import all from 'it-all'
import { File } from '@web-std/file'
import { normaliseInput } from '../../src/files/normalise-input-single.js'
import { isNode } from 'ipfs-utils/src/env.js'
import resolve from 'aegir/utils/resolve.js'

const { Blob, ReadableStream } = globalThis

const STRING = () => 'hello world'
const NEWSTRING = () => new String('hello world') // eslint-disable-line no-new-wrappers
const BUFFER = () => uint8ArrayFromString(STRING())
const ARRAY = () => Array.from(BUFFER())
const TYPEDARRAY = () => Uint8Array.from(ARRAY())
const FILE = () => new File([BUFFER()], 'test-file.txt')
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
 * @param {*} input
 * @param {RegExp} message
 */
async function testFailure (input, message) {
  await expect(all(normaliseInput(input))).to.eventually.be.rejectedWith(message)
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

describe('normalise-input-single', function () {
  /**
   * @param {() => any} content
   * @param {string} name
   * @param {{ acceptStream: boolean }} options
   */
  function testInputType (content, name, { acceptStream }) {
    it(name, async function () {
      await testContent(content())
    })

    if (acceptStream) {
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
    } else {
      if (ReadableStream) {
        it(`Failure ReadableStream<${name}>`, async function () {
          await testFailure(browserReadableStreamOf(content()), /Unexpected input/)
        })
      }

      it(`Failure Iterable<${name}>`, async function () {
        await testFailure(iterableOf(content()), /Unexpected input/)
      })

      it(`Failure AsyncIterable<${name}>`, async function () {
        await testFailure(asyncIterableOf(content()), /Unexpected input/)
      })
    }

    it(`{ path: '', content: ${name} }`, async function () {
      await testContent({ path: '', content: content() })
    })

    if (acceptStream) {
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
      if (acceptStream) {
        it(`ReadableStream<${name}>`, async function () {
          await testContent(browserReadableStreamOf(content()))
        })
      } else {
        it(`Failure ReadableStream<${name}>`, async function () {
          await testFailure(browserReadableStreamOf(content()), /multiple items passed/)
        })
      }
    }

    it(`Failure Iterable<{ path: '', content: ${name} }>`, async function () {
      await testFailure(iterableOf({ path: '', content: content() }), /multiple items passed/)
    })

    it(`Failure AsyncIterable<{ path: '', content: ${name} }>`, async function () {
      await testFailure(asyncIterableOf({ path: '', content: content() }), /multiple items passed/)
    })

    if (acceptStream) {
      if (ReadableStream) {
        it(`Failure Iterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
          await testFailure(iterableOf({ path: '', content: browserReadableStreamOf(content()) }), /multiple items passed/)
        })
      }

      it(`Failure Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testFailure(iterableOf({ path: '', content: iterableOf(content()) }), /multiple items passed/)
      })

      it(`Failure Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testFailure(iterableOf({ path: '', content: asyncIterableOf(content()) }), /multiple items passed/)
      })

      if (ReadableStream) {
        it(`Failure AsyncIterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
          await testFailure(asyncIterableOf({ path: '', content: browserReadableStreamOf(content()) }), /multiple items passed/)
        })
      }

      it(`Failure AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testFailure(asyncIterableOf({ path: '', content: iterableOf(content()) }), /multiple items passed/)
      })

      it(`Failure AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testFailure(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }), /multiple items passed/)
      })
    }
  }

  describe('String', () => {
    testInputType(STRING, 'String', {
      acceptStream: true
    })
    testInputType(NEWSTRING, 'new String()', {
      acceptStream: true
    })
  })

  describe('Buffer', () => {
    testInputType(BUFFER, 'Buffer', {
      acceptStream: true
    })
  })

  describe('Blob', () => {
    if (!Blob) {
      return
    }

    testInputType(BLOB, 'Blob', {
      acceptStream: false
    })
  })

  describe('@web-std/file', () => {
    testInputType(FILE, 'File', {
      acceptStream: false
    })
  })

  describe('Iterable<Number>', () => {
    testInputType(ARRAY, 'Iterable<Number>', {
      acceptStream: false
    })
  })

  describe('TypedArray', () => {
    testInputType(TYPEDARRAY, 'TypedArray', {
      acceptStream: true
    })
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

      testInputType(NODEFSREADSTREAM, 'Node fs.ReadStream', {
        acceptStream: false
      })
    })
  }
})
