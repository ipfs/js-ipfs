'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const formatMtime = require('../../src/files/format-mtime')

chai.use(dirtyChai)
const expect = chai.expect

describe('format-mtime', function () {
  it('formats mtime', function () {
    expect(formatMtime({ secs: 15768000, nsecs: 0 })).to.include('1970')
  })

  it('formats empty mtime', function () {
    expect(formatMtime()).to.equal('-')
  })
})
