/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.rm', function () {
    let ipfs, cid

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

    beforeEach(function (done) {
      const blob = Buffer.from('blorb')
      ipfs.block.put(blob, (err, block) => {
        if (err) return done(err)
        cid = block.cid
        done()
      })
    })

    afterEach(function () {
      cid = undefined
    })

    after((done) => common.teardown(done))

    it('should remove by CID object', (done) => {
      ipfs.block.rm(cid, (err, resp) => {
        expect(err).to.not.exist()
        expect(resp).to.have.property('hash')
        expect(resp.error).to.not.exist()
        done()
      })
    })

    it('should remove by CID in string', (done) => {
      ipfs.block.rm(cid.toString(), (err, resp) => {
        expect(err).to.not.exist()
        expect(resp).to.have.property('hash')
        expect(resp.error).to.not.exist()
        done()
      })
    })

    it('should remove by CID in buffer', (done) => {
      ipfs.block.rm(cid.buffer, (err, resp) => {
        expect(err).to.not.exist()
        expect(resp).to.have.property('hash')
        expect(resp.error).to.not.exist()
        done()
      })
    })

    it('should remove multiple CIDs', (done) => {
      const blob = Buffer.from('more blorb')
      ipfs.block.put(blob, (err, block) => {
        if (err) return done(err)
        const cid1 = block.cid
        ipfs.block.rm([cid, cid1], (err, resp) => {
          expect(err).to.not.exist()
          expect(resp).to.have.property('hash')
          expect(resp.error).to.not.exist()
          done()
        })
      })
    })
  })
}
