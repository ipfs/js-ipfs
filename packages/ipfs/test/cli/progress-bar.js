/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const createProgressBar = require('../../src/cli/utils').createProgressBar

describe('progress bar', () => {
  it('created with the correct properties', () => {
    const total = 1000

    const bar = createProgressBar(total)
    expect(bar.total).to.eql(total)
    expect(typeof bar.tick).to.eql('function')
  })
})
