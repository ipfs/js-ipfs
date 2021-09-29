/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { formatMtime } from '../../src/files/format-mtime.js'

describe('format-mtime', function () {
  it('formats mtime', function () {
    expect(formatMtime({ secs: 15768000, nsecs: 0 })).to.include('1970')
  })

  it('formats empty mtime', function () {
    expect(formatMtime()).to.equal('-')
  })
})
