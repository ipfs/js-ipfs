/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (ctl) => {
  describe('.files', () => {
    describe('.add', () => {}) // TODO

    describe('.cat', () => {
      it('returns error for request without argument', (done) => {
        ctl.cat(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.cat('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns a buffer', (done) => {
        ctl.cat('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o', (err, result) => {
          expect(err).to.not.exist
          expect(result).to.deep.equal(new Buffer('hello world' + '\n'))
          done()
        })
      })
    })

    describe('.get', () => {}) // TODO

    describe('.ls', () => {}) // TODO
  })
}
