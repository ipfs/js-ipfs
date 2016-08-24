/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const multihash = require('multihashes')

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
      it('.put a buffer', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = Buffer('blorb')

        ipfs.block.put(blob, (err, block) => {
          expect(err).to.not.exist
          expect(block.key).to.eql(multihash.fromB58String(expectedHash))
          expect(block).to.have.a.property('data', blob)
          done()
        })
      })

      it('.put a block', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = new Block(new Buffer('blorb'))

        ipfs.block.put(blob, (err, block) => {
          expect(err).to.not.exist
          expect(block.key).to.eql(multihash.fromB58String(expectedHash))
          expect(block.data).to.eql(new Buffer('blorb'))
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

        ipfs.block.get(hash, (err, block) => {
          expect(err).to.not.exist
          expect(block.key).to.eql(multihash.fromB58String(hash))
          expect(block.data).to.eql(new Buffer('blorb'))
          done()
        })
      })

      it('block.stat', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

        ipfs.block.stat(hash, (err, stats) => {
          expect(err).to.not.exist
          expect(stats).to.have.property('key')
          expect(stats).to.have.property('size')
          done()
        })
      })

      it.skip('block.rm', (done) => {}) // TODO once block.rm is shipped in go-ipfs
    })

    describe('promise API', () => {
    })
  })
}
