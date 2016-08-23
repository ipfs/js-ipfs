/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (ctl) => {
  describe('.version', () => {
    it('get the version', (done) => {
      ctl.version((err, result) => {
        expect(err).to.not.exist
        expect(result).to.have.a.property('version')
        expect(result).to.have.a.property('commit')
        expect(result).to.have.a.property('repo')
        done()
      })
    })
  })
}
