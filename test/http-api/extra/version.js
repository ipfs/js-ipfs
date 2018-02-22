/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const getCtl = require('./utils/get-ctl.js')

module.exports = (http) => {
  let ctl = null
  before(() => {
    ctl = getCtl(http)
  })
  describe('.version', () => {
    it('get the version', (done) => {
      ctl.version((err, result) => {
        expect(err).to.not.exist()
        expect(result).to.have.a.property('version')
        expect(result).to.have.a.property('commit')
        expect(result).to.have.a.property('repo')
        done()
      })
    })
  })
}
