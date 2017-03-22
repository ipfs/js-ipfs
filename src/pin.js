/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')

const testfile = loadFixture(__dirname, '../test/fixtures/testfile.txt', 'interface-ipfs-core')

module.exports = (common) => {
  describe('.pin', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          populate()
        })
      })

      function populate () {
        const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        ipfs.files.add(testfile, (err, res) => {
          expect(err).to.not.exist()

          expect(res).to.have.length(1)
          expect(res[0].hash).to.equal(expectedMultihash)
          expect(res[0].path).to.equal(expectedMultihash)
          done()
        })
      }
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      // 1st, because ipfs.files.add pins automatically
      it('.rm', (done) => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        ipfs.pin.rm(hash, { recursive: true }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.exist()
          ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
            expect(err).to.not.exist()
            expect(pinset).to.be.empty()
            done()
          })
        })
      })

      it('.add', (done) => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        ipfs.pin.add(hash, { recursive: false }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset[0]).to.be.equal(hash)
          done()
        })
      })

      it('.ls', (done) => {
        ipfs.pin.ls((err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          done()
        })
      })

      it('.ls type direct', (done) => {
        ipfs.pin.ls({ type: 'direct' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          done()
        })
      })

      it('.ls type indirect', (done) => {
        ipfs.pin.ls({ type: 'indirect' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          done()
        })
      })

      it('.ls type recursive', (done) => {
        ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.be.empty()
          done()
        })
      })

      it('.ls for a specific hash', (done) => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        ipfs.pin.ls(hash, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.exist()
          done()
        })
      })
    })

    describe('promise API', () => {
      it('.add', () => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        return ipfs.pin.add(hash, { recursive: false })
          .then((pinset) => {
            expect(pinset[0]).to.be.equal(hash)
          })
      })

      it('.ls', () => {
        return ipfs.pin.ls()
          .then((pinset) => {
            expect(pinset).to.exist()
            expect(pinset).to.not.be.empty()
          })
      })

      it('.ls hash', () => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        return ipfs.pin.ls(hash)
          .then((pinset) => {
            expect(pinset).to.exist()
          })
      })

      it('.rm', () => {
        const hash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

        return ipfs.pin.rm(hash, { recursive: false })
          .then((pinset) => {
            return ipfs.pin.ls({ type: 'direct' })
          })
          .then((pinset) => {
            expect(pinset).to.be.empty()
          })
      })
    })
  })
}
