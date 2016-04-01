/* eslint-env mocha */

const expect = require('chai').expect
const IPFS = require('../../src/core')
const bs58 = require('bs58')
const path = require('path')

describe('files', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('should add a file', (done) => {
    ipfs.files.add(path.join(__dirname, '../test-data/files-test/Test.txt'), {}, (err, fs) => {
      expect(err).to.not.exist
      expect(fs).to.have.property('Size', 90)
      expect(fs).to.have.property('Name', 'Test.txt')
      expect(fs).to.have.property('Hash')
      expect(bs58.encode(fs.Hash).toString())
         .to.equal('QmfUVDCvgSZuKjovHH7hsebgaQfr75uR9oCsd9AoQ5bryf')
      expect(fs.Size).to.equal(90)
      done()
    })
  })

  it('should add a directory', (done) => {
    ipfs.files.add(path.join(__dirname, '../test-data/files-test'), {recursive: true}, (err, fs) => {
      expect(err).to.not.exist
      expect(fs).to.have.property('Size', 144)
      expect(fs).to.have.property('Name', 'files-test')
      expect(fs).to.have.property('Hash')
      expect(bs58.encode(fs.Hash).toString())
          .to.equal('QmRJuPPM7ME2HCqGDtgQRnM1Ky9F2MEkHiLSf1q5JkMptY')
      expect(fs.Size).to.equal(144)
      done()
    })
  })
})
