'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const normalise = require('../../src/files/normalise-input')
const { supportsFileReader } = require('../../src/supports')
const { Buffer } = require('buffer')
const all = require('it-all')
const globalThis = require('../../src/globalthis')

chai.use(dirtyChai)
const expect = chai.expect

const STRING = () => 'hello world'
const BUFFER = () => Buffer.from(STRING())
const ARRAY = () => Array.from(BUFFER())
const TYPEDARRAY = () => Uint8Array.from(ARRAY())
let BLOB
let WINDOW_READABLE_STREAM

if (supportsFileReader) {
  BLOB = () => new globalThis.Blob([
    STRING()
  ])

  WINDOW_READABLE_STREAM = () => new globalThis.ReadableStream({
    start (controller) {
      controller.enqueue(BUFFER())
      controller.close()
    }
  })
}

async function verifyNormalisation (input) {
  expect(input.length).to.equal(1)

  if (!input[0].content[Symbol.asyncIterator] && !input[0].content[Symbol.iterator]) {
    chai.assert.fail('Content should have been an iterable or an async iterable')
  }

  expect(await all(input[0].content)).to.deep.equal([BUFFER()])
  expect(input[0].path).to.equal('')
}

async function testContent (input) {
  const result = await all(normalise(input))

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

describe('normalise-input', function () {
  function testInputType (content, name, isBytes) {
    it(name, async function () {
      await testContent(content())
    })

    if (isBytes) {
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
      it(`{ path: '', content: Iterable<${name}> }`, async function () {
        await testContent({ path: '', content: iterableOf(content()) })
      })

      it(`{ path: '', content: AsyncIterable<${name}> }`, async function () {
        await testContent({ path: '', content: asyncIterableOf(content()) })
      })
    }

    it(`Iterable<{ path: '', content: ${name} }`, async function () {
      await testContent(iterableOf({ path: '', content: content() }))
    })

    it(`AsyncIterable<{ path: '', content: ${name} }`, async function () {
      await testContent(asyncIterableOf({ path: '', content: content() }))
    })

    if (isBytes) {
      it(`Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: asyncIterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }))
      })
    }
  }

  describe('String', () => {
    testInputType(STRING, 'String', false)
  })

  describe('Buffer', () => {
    testInputType(BUFFER, 'Buffer', true)
  })

  describe('Blob', () => {
    if (!supportsFileReader) {
      return
    }

    testInputType(BLOB, 'Blob', false)
  })

  describe('window.ReadableStream', () => {
    if (!supportsFileReader) {
      return
    }

    testInputType(WINDOW_READABLE_STREAM, 'window.ReadableStream', false)
  })

  describe('Iterable<Number>', () => {
    testInputType(ARRAY, 'Iterable<Number>', false)
  })

  describe('TypedArray', () => {
    testInputType(TYPEDARRAY, 'TypedArray', true)
  })
})
