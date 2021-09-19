

/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import blobToIt from 'blob-to-it'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import all from 'it-all'
import { File } from '@web-std/file'
import { isBrowser, isWebWorker, isElectronRenderer } from 'ipfs-utils/src/env.js'

const { Blob, ReadableStream } = globalThis

let { normaliseInput } = require('../../src/files/normalise-input')

if (isBrowser || isWebWorker || isElectronRenderer) {
  normaliseInput = require('../../src/files/normalise-input/index.browser').normaliseInput
}

const STRING = () => 'hello world'
const NEWSTRING = () => new String('hello world') // eslint-disable-line no-new-wrappers
const BUFFER = () => uint8ArrayFromString(STRING())
const ARRAY = () => Array.from(BUFFER())
const TYPEDARRAY = () => Uint8Array.from(ARRAY())
let BLOB

if (Blob) {
  BLOB = () => new Blob([
    STRING()
  ])
}

async function verifyNormalisation (input) {
  expect(input.length).to.equal(1)
  expect(input[0].path).to.equal('')

  let content = input[0].content

  if (isBrowser || isWebWorker || isElectronRenderer) {
    expect(content).to.be.an.instanceOf(Blob)
    content = blobToIt(content)
  }

  expect(content[Symbol.asyncIterator] || content[Symbol.iterator]).to.be.ok('Content should have been an iterable or an async iterable')

  await expect(all(content)).to.eventually.deep.equal([BUFFER()])
}

async function testContent (input) {
  const result = await all(normaliseInput(input))

  await verifyNormalisation(result)
}

function iterableOf (thing) {
  return [thing]
}

function asyncIterableOf (thing) {
  return (async function * () { // eslint-disable-line require-await
    yield thing
  }())
}

function browserReadableStreamOf (thing) {
  return new ReadableStream({
    start (controller) {
      controller.enqueue(thing)
      controller.close()
    }
  })
}

describe('normalise-input', function () {
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
})
