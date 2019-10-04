/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const hat = require('hat')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.rm', function () {
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

    it('should remove by CID object', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))

      // block should be present in the local store
      expect(await ipfs.refs.local()).to.deep.include({
        ref: cid.toString(),
        err: ''
      })

      const result = await ipfs.block.rm(cid)

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0]).to.have.property('hash', cid.toString())
      expect(result[0]).to.not.have.property('error')

      // did we actually remove the block?
      expect(await ipfs.refs.local()).to.not.deep.include({
        ref: cid.toString(),
        err: ''
      })
    })

    it('should remove by CID in string', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))
      const result = await ipfs.block.rm(cid.toString())

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0]).to.have.property('hash', cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should remove by CID in buffer', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))
      const result = await ipfs.block.rm(cid.buffer)

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0]).to.have.property('hash', cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should remove multiple CIDs', async () => {
      const cids = [
        await ipfs.dag.put(Buffer.from(hat())),
        await ipfs.dag.put(Buffer.from(hat())),
        await ipfs.dag.put(Buffer.from(hat()))
      ]

      const result = await ipfs.block.rm(cids)

      expect(result).to.be.an('array').and.to.have.lengthOf(3)

      result.forEach((res, index) => {
        expect(res).to.have.property('hash', cids[index].toString())
        expect(res).to.not.have.property('error')
      })
    })

    it('should error when removing non-existent blocks', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))

      // remove it
      await ipfs.block.rm(cid)

      // remove it again
      const result = await ipfs.block.rm(cid)

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0]).to.have.property('error').and.to.include('block not found')
    })

    it('should not error when force removing non-existent blocks', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))

      // remove it
      await ipfs.block.rm(cid)

      // remove it again
      const result = await ipfs.block.rm(cid, { force: true })

      expect(result).to.be.an('array').and.to.have.lengthOf(1)
      expect(result[0]).to.have.property('hash', cid.toString())
      expect(result[0]).to.not.have.property('error')
    })

    it('should return empty output when removing blocks quietly', async () => {
      const cid = await ipfs.dag.put(Buffer.from(hat()))
      const result = await ipfs.block.rm(cid, { quiet: true })

      expect(result).to.be.an('array').and.to.have.lengthOf(0)
    })
  })
}
