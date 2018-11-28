/* eslint-env mocha */
'use strict'

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
})
