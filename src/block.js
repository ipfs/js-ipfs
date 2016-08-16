/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect

module.exports = (common) => {
  describe('.block', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      it('.put', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = Buffer('blorb')

        ipfs.block.put(blob, (err, res) => {
          expect(err).to.not.exist
          expect(res).to.have.a.property('Key', expectedHash)
          done()
        })
      })

      it('.put error with array of blocks', () => {
        const blob = Buffer('blorb')

        ipfs.block.put([blob, blob], (err) => {
          expect(err).to.be.an.instanceof(Error)
        })
      })

      it('block.get', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

        ipfs.block.get(hash, (err, res) => {
          expect(err).to.not.exist

          // TODO review this
          let buf = ''
          res
            .on('data', function (data) { buf += data })
            .on('end', function () {
              expect(buf).to.be.equal('blorb')
              done()
            })
        })
      })

      it('block.stat', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

        ipfs.block.stat(hash, (err, res) => {
          expect(err).to.not.exist
          expect(res).to.have.property('Key')
          expect(res).to.have.property('Size')
          done()
        })
      })
    })

    describe('promise API', () => {
    })
  })
}
