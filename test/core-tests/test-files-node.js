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

  it('should add a small file (smaller than a block)', (done) => {
    ipfs.files.add(path.join(__dirname, '../test-data/files-test/anotherlevel/Test.txt'), {}, (err, fs) => {
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

  it('should add a small file (multiple blocks)', (done) => {
    ipfs.files.add(path.join(__dirname, '../test-data/files-test/ipfs-p2p-file-system.pdf'), {}, (err, fs) => {
      expect(err).to.not.exist
      expect(fs).to.have.property('Size', 213377)
      expect(fs).to.have.property('Name', 'ipfs-p2p-file-system.pdf')
      expect(fs).to.have.property('Hash')
      expect(bs58.encode(fs.Hash).toString())
          .to.equal('QmV9tSDx9UiPeWExXEeH6aoDvmihvx6jD5eLb4jbTaKGps')
      expect(fs.Size).to.equal(213377)
      done()
    })
  })

  it('should add a directory', (done) => {
    ipfs.files.add(path.join(__dirname, '../test-data/files-test'), {recursive: true}, (err, fs) => {
      expect(err).to.not.exist
      expect(fs).to.have.property('Size', 213648)
      expect(fs).to.have.property('Name', 'files-test')
      expect(fs).to.have.property('Hash')
      expect(bs58.encode(fs.Hash).toString())
          .to.equal('QmVCr7Jj7GGLrKJmj331M9NKH7YJKLGwekCG4yVeApfAHC')
      expect(fs.Size).to.equal(213648)
      done()
    })
  })

  it('should add a buffer', (done) => {
    ipfs.files.add(new Buffer('42 is the answer', 'ascii'), {}, (err, fs) => {
      expect(err).to.not.exist
      console.log('FS', fs)
      expect(fs).to.have.property('Size', 24)
      expect(fs).to.not.have.property('Name')
      expect(fs).to.have.property('Hash')
      expect(bs58.encode(fs.Hash).toString())
          .to.equal('Qmex7CQFgntjL4SR9tBYYgDyYHg7aoiSG7sGybWd6SVE9W')
      expect(fs.Size).to.equal(24)
      done()
    })
  })
})
