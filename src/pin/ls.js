/* eslint-env mocha */
'use strict'

const parallel = require('async/parallel')
const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pin.ls', function () {
    this.timeout(50 * 1000)

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
          populate()
        })
      })

      function populate () {
        parallel([
          (cb) => {
            ipfs.add(fixtures.files[0].data, { pin: false }, (err, res) => {
              if (err) return cb(err)
              ipfs.pin.add(fixtures.files[0].cid, { recursive: true }, cb)
            })
          },
          (cb) => {
            ipfs.add(fixtures.files[1].data, { pin: false }, (err, res) => {
              if (err) return cb(err)
              ipfs.pin.add(fixtures.files[1].cid, { recursive: false }, cb)
            })
          }
        ], done)
      }
    })

    after((done) => common.teardown(done))

    // 1st, because ipfs.add pins automatically
    it('should list recursive pins', (done) => {
      ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        done()
      })
    })

    it('should list indirect pins', (done) => {
      ipfs.pin.ls({ type: 'indirect' }, (err, pinset) => {
        expect(err).to.not.exist()
        // because the pinned files have no links
        expect(pinset).to.not.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        expect(pinset).to.not.deep.include({
          type: 'direct',
          hash: fixtures.files[1].cid
        })
        done()
      })
    })

    it('should list pins', (done) => {
      ipfs.pin.ls((err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.not.be.empty()
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        expect(pinset).to.deep.include({
          type: 'direct',
          hash: fixtures.files[1].cid
        })
        done()
      })
    })

    it('should list pins (promised)', () => {
      return ipfs.pin.ls()
        .then((pinset) => {
          expect(pinset).to.deep.include({
            type: 'recursive',
            hash: fixtures.files[0].cid
          })
          expect(pinset).to.deep.include({
            type: 'direct',
            hash: fixtures.files[1].cid
          })
        })
    })

    it('should list direct pins', (done) => {
      ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          type: 'direct',
          hash: fixtures.files[1].cid
        })
        done()
      })
    })

    it('should list pins for a specific hash', (done) => {
      ipfs.pin.ls(fixtures.files[0].cid, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.equal([{
          type: 'recursive',
          hash: fixtures.files[0].cid
        }])
        done()
      })
    })

    it('should list pins for a specific hash (promised)', () => {
      return ipfs.pin.ls(fixtures.files[0].cid)
        .then((pinset) => {
          expect(pinset).to.deep.equal([{
            type: 'recursive',
            hash: fixtures.files[0].cid
          }])
        })
    })
  })
}
