/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const statsTests = require('./utils/stats')
const expect = chai.expect
const pull = require('pull-stream')
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.stats', () => {
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
          node.id((err, id) => {
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

    it('.bitswap', (done) => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return done()
      }

      ipfs.stats.bitswap((err, res) => {
        statsTests.expectIsBitswap(err, res)
        done()
      })
    })

    it('.bitswap Promise', () => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return
      }

      return ipfs.stats.bitswap().then((res) => {
        statsTests.expectIsBitswap(null, res)
      })
    })

    it('.bw', (done) => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return done()
      }

      ipfs.stats.bw((err, res) => {
        statsTests.expectIsBandwidth(err, res)
        done()
      })
    })

    it('.bw Promise', () => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return
      }

      return ipfs.stats.bw().then((res) => {
        statsTests.expectIsBandwidth(null, res)
      })
    })

    it('.bwReadableStream', (done) => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return done()
      }

      const stream = ipfs.stats.bwReadableStream()

      stream.once('data', (data) => {
        statsTests.expectIsBandwidth(null, data)
        stream.destroy()
        done()
      })
    })

    it('.bwPullStream', (done) => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return done()
      }

      const stream = ipfs.stats.bwPullStream()

      pull(
        stream,
        pull.collect((err, data) => {
          statsTests.expectIsBandwidth(err, data[0])
          done()
        })
      )
    })

    it('.repo', (done) => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return done()
      }

      ipfs.stats.repo((err, res) => {
        statsTests.expectIsRepo(err, res)
        done()
      })
    })

    it('.repo Promise', () => {
      if (!withGo) {
        console.log('Not supported in js-ipfs yet')
        return
      }

      return ipfs.stats.repo().then((res) => {
        statsTests.expectIsRepo(null, res)
      })
    })
  })
}
