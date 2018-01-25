/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.repo', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

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

    it('.version', (done) => {
      ipfs.repo.version((err, version) => {
        expect(err).to.not.exist()
        expect(version).to.exist()
        done()
      })
    })

    it('.version Promise', () => {
      return ipfs.repo.version().then((version) => {
        expect(version).to.exist()
      })
    })

    it('.stat', (done) => {
      ipfs.repo.stat((err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.exist()
        expect(stat).to.have.property('numObjects')
        expect(stat).to.have.property('repoSize')
        expect(stat).to.have.property('repoPath')
        expect(stat).to.have.property('version')
        expect(stat).to.have.property('storageMax')
        done()
      })
    })

    it('.stat Promise', () => {
      return ipfs.repo.stat().then((stat) => {
        expect(stat).to.exist()
        expect(stat).to.have.property('numObjects')
        expect(stat).to.have.property('repoSize')
        expect(stat).to.have.property('repoPath')
        expect(stat).to.have.property('version')
        expect(stat).to.have.property('storageMax')
      })
    })

    it('.gc', (done) => {
      ipfs.repo.gc((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('.gc Promise', () => {
      return ipfs.repo.gc().then((res) => {
        expect(res).to.exist()
      })
    })
  })
}
