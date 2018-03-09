/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.miscellaneous', () => {
    let ipfs
    let withGo

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          ipfs.id((err, id) => {
            expect(err).to.not.exist()
            withGo = id.agentVersion.startsWith('go-ipfs')
            done()
          })
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

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

    it('.dns', (done) => {
      ipfs.dns('ipfs.io', (err, path) => {
        expect(err).to.not.exist()
        expect(path).to.exist()
        done()
      })
    })

    it('.id Promises support', () => {
      return ipfs.id()
        .then((res) => {
          expect(res).to.have.a.property('id')
          expect(res).to.have.a.property('publicKey')
        })
    })

    it('.version Promises support', () => {
      return ipfs.version()
        .then((result) => {
          expect(result).to.have.a.property('version')
          expect(result).to.have.a.property('commit')
          expect(result).to.have.a.property('repo')
        })
    })

    it('.dns Promises support', () => {
      return ipfs.dns('ipfs.io')
        .then((res) => {
          expect(res).to.exist()
        })
    })

    // must be last test to run
    it('.stop', function (done) {
      this.timeout(10 * 1000)
      ipfs.stop((err) => {
        // TODO: go-ipfs returns an error, https://github.com/ipfs/go-ipfs/issues/4078
        if (!withGo) {
          expect(err).to.not.exist()
        }
        // Trying to stop an already stopped node should return an error
        // as the node can't respond to requests anymore
        ipfs.stop((err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
}
