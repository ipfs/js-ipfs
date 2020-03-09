/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const toAsyncIterable = require('../src/lib/stream-to-async-iterable')

describe('lib/stream-to-async-iterable', () => {
  it('should return input if already async iterable', () => {
    const input = {
      [Symbol.asyncIterator] () {
        return this
      }
    }
    const res = { body: input }
    expect(toAsyncIterable(res)).to.equal(input)
  })

  it('should convert reader to async iterable', async () => {
    const inputData = [2, 31, 3, 4]

    const input = {
      getReader () {
        let i = 0
        return {
          read () {
            return Promise.resolve(
              i === inputData.length
                ? { done: true }
                : { value: inputData[i++] }
            )
          },
          releaseLock () { }
        }
      }
    }
    const res = { body: input }

    const chunks = []
    for await (const chunk of toAsyncIterable(res)) {
      chunks.push(chunk)
    }

    expect(chunks).to.eql(inputData)
  })

  it('should return an async iterable even if res.body is undefined', async () => {
    const inputData = [2]
    const res = {
      arrayBuffer () {
        return Promise.resolve(inputData[0])
      }
    }

    const chunks = []
    for await (const chunk of toAsyncIterable(res)) {
      chunks.push(chunk)
    }

    expect(chunks).to.eql(inputData)
  })

  it('should throw if res.body and res.arrayBuffer are undefined', () => {
    const res = {}
    expect(() => toAsyncIterable(res)).to.throw('Neither Response.body nor Response.arrayBuffer is defined')
  })

  it('should throw on unknown stream', () => {
    const res = { body: {} }
    expect(() => toAsyncIterable(res)).to.throw('unknown stream')
  })
})
