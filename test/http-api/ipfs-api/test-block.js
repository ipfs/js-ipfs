/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multihash = require('multihashes')

module.exports = (ctl) => {
  describe('.block', () => {
    describe('.put', () => {
      it('updates value', (done) => {
        const data = new Buffer('hello world\n')
        const expectedResult = {
          key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          size: 12
        }

        ctl.block.put(data, (err, block) => {
          expect(err).not.to.exist
          expect(block.key()).to.deep.equal(multihash.fromB58String(expectedResult.key))
          done()
        })
      })
    })

    describe('.get', () => {
      it('returns error for request without argument', (done) => {
        ctl.block.get(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.block.get('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.block.get('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist
          expect(result.data.toString())
            .to.equal('hello world\n')
          done()
        })
      })
    })

    describe('.stat', () => {
      it('returns error for request without argument', (done) => {
        ctl.block.stat(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.block.stat('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.block.stat('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist
          expect(result.key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(result.size).to.equal(12)
          done()
        })
      })
    })
  })
}
