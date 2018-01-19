/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')
const Buffer = require('safe-buffer').Buffer

function expectKey (block, expected, callback) {
  expect(block.cid.multihash).to.eql(expected)
  callback()
}

module.exports = (common) => {
  describe('.block', () => {
    let ipfs
    let ipfsd

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, df, type, exec) => {
        expect(err).to.not.exist()
        df.spawn({ type, exec }, (err, node) => {
          expect(err).to.not.exist()
          ipfsd = node
          ipfs = node.api
          done()
        })
      })
    })

    after((done) => ipfsd.stop(done))

    describe('.put', () => {
      it('a buffer, using defaults', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = new Buffer('blorb')

        ipfs.block.put(blob, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.be.eql(blob)
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('a buffer, using CID', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(expectedHash)
        const blob = new Buffer('blorb')

        ipfs.block.put(blob, { cid: cid }, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.be.eql(blob)
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('a buffer, using options', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const blob = new Buffer('blorb')

        ipfs.block.put(blob, {
          format: 'dag-pb',
          mhtype: 'sha2-256',
          version: 0
        }, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.be.eql(blob)
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('a Block instance', (done) => {
        const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(expectedHash)
        const b = new Block(new Buffer('blorb'), cid)

        ipfs.block.put(b, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, multihash.fromB58String(expectedHash), done)
        })
      })

      it('error with array of blocks', (done) => {
        const blob = Buffer('blorb')

        ipfs.block.put([blob, blob], (err) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })

      // TODO it.skip('Promises support', (done) => {})
    })

    describe('.get', () => {
      it('by CID object', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(hash)

        ipfs.block.get(cid, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, cid.multihash, done)
        })
      })

      it('by CID in Str', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

        ipfs.block.get(hash, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.eql(new Buffer('blorb'))
          expectKey(block, multihash.fromB58String(hash), done)
        })
      })

      // TODO it.skip('Promises support', (done) => {})
    })

    describe('.stat', () => {
      it('by CID', (done) => {
        const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
        const cid = new CID(hash)

        ipfs.block.stat(cid, (err, stats) => {
          expect(err).to.not.exist()
          expect(stats).to.have.property('key')
          expect(stats).to.have.property('size')
          done()
        })
      })

      // TODO it.skip('Promises support', (done) => {})
    })
  })
}
