/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const {
  createMfs
} = require('./helpers')

describe('flush', function () {
  let mfs

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  it('flushes the root node', () => {
    return mfs.flush()
  })

  it('throws a error when trying to flush non-existent directories', async () => {
    try {
      await mfs.flush(`/some-dir-${Math.random()}`)
      throw new Error('No error was thrown')
    } catch (err) {
      expect(err.message).to.include('does not exist')
    }
  })
})
