/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const FactoryClient = require('../factory/factory-client')
const fs = require('fs')
const path = require('path')

const testfile = fs.readFileSync(path.join(__dirname, '/../data/testfile.txt'))

describe('.pin', () => {
  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  it('add file for testing', (done) => {
    const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

    ipfs.files.add(testfile, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedMultihash)
      expect(res[0].path).to.equal(expectedMultihash)
      done()
    })
  })

  it('.pin.remove', (done) => {
    ipfs.pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      ipfs.pin.list('direct', (err, res) => {
        expect(err).to.not.exist
        expect(res).to.exist
        expect(res.Keys).to.be.empty
        done()
      })
    })
  })

  it('.pin.add', (done) => {
    ipfs.pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
      expect(err).to.not.exist
      expect(res.Pins[0]).to.be.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('.pin.list', (done) => {
    ipfs.pin.list((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.pin.list hash', (done) => {
    ipfs.pin.list({hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  describe('promise', () => {
    it('.pin.add', () => {
      return ipfs.pin
        .add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false})
        .then((res) => {
          expect(res.Pins[0]).to.be.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        })
    })

    it('.pin.list', () => {
      return ipfs.pin.list()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.pin.list hash', () => {
      return ipfs.pin.list({
        hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      })
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.pin.remove', () => {
      return ipfs.pin
        .remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false})
        .then((res) => {
          expect(res).to.exist
          return ipfs.pin.list('direct')
        })
        .then((res) => {
          expect(res).to.exist
          expect(res.Keys).to.be.empty
        })
    })
  })
})
