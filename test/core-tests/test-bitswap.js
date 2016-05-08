/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const IPFS = require('../../src/core')

describe('bitswap', () => {
  let ipfs

  beforeEach((done) => {
    ipfs = new IPFS(require('./repo-path'))
    ipfs.load(done)
  })

  describe('wantlist', (done) => {
    it('throws if offline', () => {
      expect(
        () => ipfs.bitswap.wantlist()
      ).to.throw(/online/)
    })

    it('returns an array of wanted blocks', (done) => {
      ipfs.goOnline((err) => {
        expect(err).to.not.exist

        expect(
          ipfs.bitswap.wantlist()
        ).to.be.eql(
          []
        )

        done()
      })
    })

    describe('stat', () => {
      it('throws if offline', () => {
        expect(
          () => ipfs.bitswap.stat()
        ).to.throw(/online/)
      })

      it('returns the stats', (done) => {
        ipfs.goOnline((err) => {
          expect(err).to.not.exist

          let stats = ipfs.bitswap.stat()

          expect(stats).to.have.keys([
            'blocksReceived',
            'wantlist',
            'peers',
            'dupDataReceived',
            'dupBlksReceived'
          ])
          done()
        })
      })
    })

    describe('unwant', () => {
      it('throws if offline', () => {
        expect(
          () => ipfs.bitswap.unwant('my key')
        ).to.throw(/online/)
      })
    })
  })
})
