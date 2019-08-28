/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const toIterable = require('../src/lib/stream-to-iterable')

describe('lib/stream-to-iterable', () => {
  it('should return input if already async iterable', () => {
    const input = { [Symbol.asyncIterator] () { return this } }
    expect(toIterable(input)).to.equal(input)
  })

  it('should convert reader to async iterable', async () => {
    const inputData = [2, 31, 3, 4]
    const input = {
      getReader () {
        let i = 0
        return {
          read () {
            return i === inputData.length
              ? { done: true }
              : { value: inputData[i++] }
          },
          releaseLock () {}
        }
      }
    }

    const chunks = []
    for await (const chunk of toIterable(input)) {
      chunks.push(chunk)
    }

    expect(chunks).to.eql(inputData)
  })

  it('should throw on unknown stream', () => {
    expect(() => toIterable({})).to.throw('unknown stream')
  })
})
