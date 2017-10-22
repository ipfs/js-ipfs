/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')

const testFile = loadFixture(__dirname, '../test/fixtures/testfile.txt', 'interface-ipfs-core')
const testHash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

module.exports = (common) => {
  describe('.pin', function () {
    this.timeout(50 * 1000)

    let ipfs

    before((done) => {
      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          populate()
        })
      })

      function populate () {
        ipfs.files.add(testFile, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.have.length(1)
          expect(res[0].hash).to.equal(testHash)
          expect(res[0].path).to.equal(testHash)
          done()
        })
      }
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      // 1st, because ipfs.files.add pins automatically
      it('.ls type recursive', (done) => {
        ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'recursive'
          })
          done()
        })
      })

      it.skip('.ls type indirect', (done) => {
        ipfs.pin.ls({ type: 'indirect' }, (err, pinset) => {
          expect(err).to.not.exist()
          // because the pinned file has no links
          expect(pinset).to.be.empty()
          done()
        })
      })

      it('.rm', (done) => {
        ipfs.pin.rm(testHash, { recursive: true }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash
          }])
          ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
            expect(err).to.not.exist()
            expect(pinset).to.not.deep.include({
              hash: testHash,
              type: 'recursive'
            })
            done()
          })
        })
      })

      it('.add', (done) => {
        ipfs.pin.add(testHash, { recursive: false }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash
          }])
          done()
        })
      })

      it('.ls', (done) => {
        ipfs.pin.ls((err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'direct'
          })
          done()
        })
      })

      it('.ls type direct', (done) => {
        ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.include({
            hash: testHash,
            type: 'direct'
          })
          done()
        })
      })

      it('.ls for a specific hash', (done) => {
        ipfs.pin.ls(testHash, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.deep.equal([{
            hash: testHash,
            type: 'direct'
          }])
          done()
        })
      })
    })

    describe('promise API', () => {
      it('.add', () => {
        return ipfs.pin.add(testHash, { recursive: false })
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash
            }])
          })
      })

      it('.ls', () => {
        return ipfs.pin.ls()
          .then((pinset) => {
            expect(pinset).to.deep.include({
              hash: testHash,
              type: 'direct'
            })
          })
      })

      it('.ls hash', () => {
        return ipfs.pin.ls(testHash)
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash,
              type: 'direct'
            }])
          })
      })

      it('.rm', () => {
        return ipfs.pin.rm(testHash, { recursive: false })
          .then((pinset) => {
            expect(pinset).to.deep.equal([{
              hash: testHash
            }])
            return ipfs.pin.ls({ type: 'direct' })
          })
          .then((pinset) => {
            expect(pinset).to.not.deep.include({
              hash: testHash
            })
          })
      })
    })
  })
}
