/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')

function expectKey (block, expected, callback) {
  block.key((err, key) => {
    if (err) {
      return callback(err)
    }
    expect(key).to.be.eql(expected)
    callback()
  })
}

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
        const cid = new CID(expectedHash)
        const blob = Buffer('blorb')

        ipfs.block.put(blob, cid, (err, block) => {
          expect(err).to.not.exist
          expect(block).to.have.a.property('data', blob)
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('.put a block', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(expectedHash)
        const blob = new Block(new Buffer('blorb'))

        ipfs.block.put(blob, cid, (err, block) => {
          expect(err).to.not.exist
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('.put a block (without using CID, legacy mode)', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = new Block(new Buffer('blorb'))

        ipfs.block.put(blob, (err, block) => {
          expect(err).to.not.exist
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('.put error with array of blocks', (done) => {
        const blob = Buffer('blorb')

        ipfs.block.put([blob, blob], 'fake cids', (err) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })

      it('block.get', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(hash)

        ipfs.block.get(cid, (err, block) => {
          expect(err).to.not.exist
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, cid.multihash, done)
        })
      })

      it('block.get (without using CID, legacy mode)', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

        ipfs.block.get(hash, (err, block) => {
          expect(err).to.not.exist
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, multihash.fromB58String(hash), done)
        })
      })

      it('block.stat', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(hash)

        ipfs.block.stat(cid, (err, stats) => {
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
