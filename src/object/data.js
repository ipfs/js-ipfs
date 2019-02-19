/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const bs58 = require('bs58')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.data', function () {
    this.timeout(80 * 1000)

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

    it('should get data by multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(nodeCid, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)
      let data = await ipfs.object.data(nodeCid)

      // because js-ipfs-api can't infer
      // if the returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.deep.equal(data)
    })

    it('should get data by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(nodeCid.buffer), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(nodeCid.buffer).toString(), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer if the
          // returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })
  })
}
