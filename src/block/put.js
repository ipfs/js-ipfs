/* eslint-env mocha */
'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.put', () => {
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

    after((done) => common.teardown(done))

    it('should put a buffer, using defaults', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const blob = Buffer.from('blorb')

      ipfs.block.put(blob, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should put a buffer, using CID', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const blob = Buffer.from('blorb')

      ipfs.block.put(blob, { cid: cid }, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should put a buffer, using options', (done) => {
      const blob = Buffer.from(`TEST${Date.now()}`)

      ipfs.block.put(blob, {
        format: 'raw',
        mhtype: 'sha2-512',
        version: 1
      }, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.version).to.equal(1)
        expect(block.cid.codec).to.equal('raw')
        expect(multihash.decode(block.cid.multihash).name).to.equal('sha2-512')
        done()
      })
    })

    it('should put a Block instance', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const b = new Block(Buffer.from('blorb'), cid)

      ipfs.block.put(b, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(Buffer.from('blorb'))
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should error with array of blocks', (done) => {
      const blob = Buffer.from('blorb')

      ipfs.block.put([blob, blob], (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })
  })
}
