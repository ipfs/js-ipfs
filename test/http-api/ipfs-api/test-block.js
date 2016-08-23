/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (ctl) => {
  describe('.block', () => {
    describe('.put', () => {
      it('updates value', (done) => {
        const filePath = 'test/test-data/hello'
        const expectedResult = {
          Key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          Size: 12
        }

        ctl.block.put(filePath, (err, res) => {
          expect(err).not.to.exist
          expect(res).to.deep.equal(expectedResult)
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
          expect(result.toString())
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
          expect(result.Key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(result.Size).to.equal(12)
          done()
        })
      })
    })
  })
}
