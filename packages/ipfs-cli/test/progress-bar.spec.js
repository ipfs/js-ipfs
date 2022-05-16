/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { createProgressBar } from '../src/utils.js'

describe('progress bar', () => {
  it('created with the correct properties', () => {
    const total = 1000

    const bar = createProgressBar(total)
    expect(bar.total).to.eql(total)
    expect(typeof bar.tick).to.eql('function')
  })
})
