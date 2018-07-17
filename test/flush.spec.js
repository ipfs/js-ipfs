/* eslint-env mocha */
'use strict'

const {
  createMfs
} = require('./helpers')

describe('flush', function () {
  this.timeout(30000)

  let mfs

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  it('flushes the root node', () => {
    return mfs.flush()
  })
})
