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
  describe('.dns', () => {
    it('resolve ipfs.io dns', (done) => {
      ctl.dns('ipfs.io', (err, result) => {
        expect(err).to.not.exist()
        expect(result).to.exist()
        done()
      })
    })
  })
}
