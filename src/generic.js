/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.generic', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      it('.id', (done) => {
        ipfs.id((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.have.a.property('id')
          expect(res).to.have.a.property('publicKey')
          done()
        })
      })

      it('.version', (done) => {
        ipfs.version((err, result) => {
          expect(err).to.not.exist()
          expect(result).to.have.a.property('version')
          expect(result).to.have.a.property('commit')
          expect(result).to.have.a.property('repo')
          done()
        })
      })
    })

    describe('promise API', () => {
      it('.id', () => {
        return ipfs.id()
          .then((res) => {
            expect(res).to.have.a.property('id')
            expect(res).to.have.a.property('publicKey')
          })
      })

      it('.version', () => {
        return ipfs.version()
          .then((result) => {
            expect(result).to.have.a.property('version')
            expect(result).to.have.a.property('commit')
            expect(result).to.have.a.property('repo')
          })
      })
    })
  })
}
