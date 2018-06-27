/* eslint-env mocha */
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

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.data(node.multihash, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(node.data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by multihash (promised)', () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      return ipfs.object.put(testObj).then((node) => {
        return ipfs.object.data(node.multihash).then((data) => {
          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(node.data).to.deep.equal(data)
        })
      })
    })

    it('should get data by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(node.multihash), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(node.data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(node.multihash).toString(), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer if the
          // returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(node.data).to.eql(data)
          done()
        })
      })
    })
  })
}
