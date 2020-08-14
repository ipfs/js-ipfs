'use strict'

/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const formatMtime = require('../../src/files/format-mtime')

describe('format-mtime', function () {
  it('formats mtime', function () {
    expect(formatMtime({ secs: 15768000, nsecs: 0 })).to.include('1970')
  })

  it('formats empty mtime', function () {
    expect(formatMtime()).to.equal('-')
  })
})
