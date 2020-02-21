'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const supports = require('../src/supports')
const env = require('../src/env')

chai.use(dirtyChai)
const expect = chai.expect

describe('supports', function () {
  it('supportsFileReader should return false in node', function () {
    if (env.isNode) {
      expect(supports.supportsFileReader).to.be.false()
    } else {
      this.skip()
    }
  })

  it('supportsFileReader should return true in browser', function () {
    if (env.isBrowser) {
      expect(supports.supportsFileReader).to.be.true()
    } else {
      this.skip()
    }
  })

  it('supportsFileReader should return true in Web Worker', function () {
    if (env.isWebWorker) {
      expect(supports.supportsFileReader).to.be.true()
    } else {
      this.skip()
    }
  })

  it('supportsFileReader should return false in Electron main', function () {
    if (env.isElectron && !env.isElectronRenderer) {
      expect(supports.supportsFileReader).to.be.false()
    } else {
      this.skip()
    }
  })

  it('supportsFileReader should return true in Electron renderer', function () {
    if (env.isElectronRenderer) {
      expect(supports.supportsFileReader).to.be.true()
    } else {
      this.skip()
    }
  })
})
