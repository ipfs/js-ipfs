'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const formatMtime = require('../../src/files/format-mtime')

chai.use(dirtyChai)
const expect = chai.expect

describe('format-mtime', function () {
  it('formats mtime', function () {
    expect((new Date(formatMtime(0))).getTime()).to.equal(0)
  })
})
