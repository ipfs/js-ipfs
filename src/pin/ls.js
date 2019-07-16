/* eslint-env mocha */
'use strict'

const series = require('async/series')
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
        series([
          // two files wrapped in directories, only root CID pinned recursively
          cb => {
            const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
            ipfs.add(dir, { pin: false, cidVersion: 0 }, cb)
          },
          cb => ipfs.pin.add(fixtures.directory.cid, { recursive: true }, cb),
          // a file (CID pinned recursively)
          cb => ipfs.add(fixtures.files[0].data, { pin: false, cidVersion: 0 }, cb),
          cb => ipfs.pin.add(fixtures.files[0].cid, { recursive: true }, cb),
          // a single CID (pinned directly)
          cb => ipfs.add(fixtures.files[1].data, { pin: false, cidVersion: 0 }, cb),
          cb => ipfs.pin.add(fixtures.files[1].cid, { recursive: false }, cb)
        ], done)
      }
    })

    after((done) => common.teardown(done))

    // 1st, because ipfs.add pins automatically
    it('should list all recursive pins', (done) => {
      ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.directory.cid
        })
        done()
      })
    })

    it('should list all indirect pins', (done) => {
      ipfs.pin.ls({ type: 'indirect' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.not.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        expect(pinset).to.not.deep.include({
          type: 'direct',
          hash: fixtures.files[1].cid
        })
        expect(pinset).to.not.deep.include({
          type: 'recursive',
          hash: fixtures.directory.cid
        })
        expect(pinset).to.deep.include({
          type: 'indirect',
          hash: fixtures.directory.files[0].cid
        })
        expect(pinset).to.deep.include({
          type: 'indirect',
          hash: fixtures.directory.files[1].cid
        })
        done()
      })
    })

    it('should list all types of pins', (done) => {
      ipfs.pin.ls((err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.not.be.empty()
        // check the three "roots"
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.directory.cid
        })
        expect(pinset).to.deep.include({
          type: 'recursive',
          hash: fixtures.files[0].cid
        })
        expect(pinset).to.deep.include({
          type: 'direct',
          hash: fixtures.files[1].cid
        })
        expect(pinset).to.deep.include({
          type: 'indirect',
          hash: fixtures.directory.files[0].cid
        })
        expect(pinset).to.deep.include({
          type: 'indirect',
          hash: fixtures.directory.files[1].cid
        })
        done()
      })
    })

    it('should list all types of pins (promised)', () => {
      return ipfs.pin.ls()
        .then((pinset) => {
          expect(pinset).to.not.be.empty()
          // check our three "roots"
          expect(pinset).to.deep.include({
            type: 'recursive',
            hash: fixtures.directory.cid
          })
          expect(pinset).to.deep.include({
            type: 'recursive',
            hash: fixtures.files[0].cid
          })
          expect(pinset).to.deep.include({
            type: 'direct',
            hash: fixtures.files[1].cid
          })
          expect(pinset).to.deep.include({
            type: 'indirect',
            hash: fixtures.directory.files[0].cid
          })
          expect(pinset).to.deep.include({
            type: 'indirect',
            hash: fixtures.directory.files[1].cid
          })
        })
    })

    it('should list all direct pins', (done) => {
      ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.have.lengthOf(1)
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

    it('should throw an error on missing direct pins for existing path', (done) => {
      // ipfs.txt is an indirect pin, so lookup for direct one should throw an error
      ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/files/ipfs.txt`, { type: 'direct' }, (err, pinset) => {
        expect(err).to.exist()
        expect(pinset).to.not.exist()
        expect(err.message).to.be.equal(`path '/ipfs/${fixtures.directory.cid}/files/ipfs.txt' is not pinned`)
        done()
      })
    })

    it('should throw an error on missing link for a specific path', (done) => {
      ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/I-DONT-EXIST.txt`, { type: 'direct' }, (err, pinset) => {
        expect(err).to.exist()
        expect(pinset).to.not.exist()
        expect(err.message).to.be.equal(`no link named "I-DONT-EXIST.txt" under ${fixtures.directory.cid}`)
        done()
      })
    })

    it('should list indirect pins for a specific path', (done) => {
      ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/files/ipfs.txt`, { type: 'indirect' }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          type: `indirect through ${fixtures.directory.cid}`,
          hash: fixtures.directory.files[1].cid
        })
        done()
      })
    })

    it('should list recursive pins for a specific hash (promised)', () => {
      return ipfs.pin.ls(fixtures.files[0].cid, { type: 'recursive' })
        .then((pinset) => {
          expect(pinset).to.deep.equal([{
            type: 'recursive',
            hash: fixtures.files[0].cid
          }])
        })
    })
  })
}
