/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (ctl) => {
  describe('.version', () => {
    it.only('gets the version', (done) => {
      ctl.version((err, result) => {
        console.log('Success! version results:', result)
        expect(err).to.not.exist()
        expect(result).to.have.a.property('version')
        expect(result).to.have.a.property('commit')
        expect(result).to.have.a.property('repo')
        done()
      })
    })
  })
}
