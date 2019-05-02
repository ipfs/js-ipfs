'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const env = require('../src/env')

chai.use(dirtyChai)
const expect = chai.expect

describe('env', function () {
  it('isElectron should have the correct value in each env', function () {
    if (env.isElectron) {
      return expect(env.isElectron).to.be.true()
    }
    if (env.isElectronRenderer) {
      return expect(env.isElectron).to.be.true()
    }
    if (env.isBrowser) {
      return expect(env.isElectron).to.be.false()
    }
    if (env.isNode) {
      return expect(env.isElectron).to.be.false()
    }
    if (env.isWebWorker) {
      return expect(env.isElectron).to.be.false()
    }
  })

  it('isElectronRenderer should have the correct value in each env', function () {
    if (env.isElectron && !env.isElectronRenderer) {
      return expect(env.isElectronRenderer).to.be.false()
    }
    if (env.isElectronRenderer) {
      return expect(env.isElectronRenderer).to.be.true()
    }
    if (env.isBrowser) {
      return expect(env.isElectronRenderer).to.be.false()
    }
    if (env.isNode) {
      return expect(env.isElectronRenderer).to.be.false()
    }
    if (env.isWebWorker) {
      return expect(env.isElectronRenderer).to.be.false()
    }
  })

  it('isNode should have the correct value in each env', function () {
    if (env.isElectron) {
      return expect(env.isNode).to.be.false()
    }
    if (env.isElectronRenderer) {
      return expect(env.isNode).to.be.false()
    }
    if (env.isBrowser) {
      return expect(env.isNode).to.be.false()
    }
    if (env.isNode) {
      return expect(env.isNode).to.be.true()
    }
    if (env.isWebWorker) {
      return expect(env.isNode).to.be.false()
    }
  })

  it('isBrowser should have the correct value in each env', function () {
    if (env.isElectron) {
      return expect(env.isBrowser).to.be.false()
    }
    if (env.isElectronRenderer) {
      return expect(env.isBrowser).to.be.false()
    }
    if (env.isBrowser) {
      return expect(env.isBrowser).to.be.true()
    }
    if (env.isNode) {
      return expect(env.isBrowser).to.be.false()
    }
    if (env.isWebWorker) {
      return expect(env.isBrowser).to.be.false()
    }
  })

  it('isWebWorker should have the correct value in each env', function () {
    if (env.isElectron) {
      return expect(env.isWebWorker).to.be.false()
    }
    if (env.isElectronRenderer) {
      return expect(env.isWebWorker).to.be.false()
    }
    if (env.isBrowser) {
      return expect(env.isWebWorker).to.be.false()
    }
    if (env.isNode) {
      return expect(env.isWebWorker).to.be.false()
    }
    if (env.isWebWorker) {
      return expect(env.isWebWorker).to.be.true()
    }
  })
})
