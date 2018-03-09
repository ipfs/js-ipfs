/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const path = require('path')
const fs = require('fs')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.util', () => {
  if (!isNode) { return }

  let ipfsd
  let ipfs

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('.streamAdd', (done) => {
    const tfpath = path.join(__dirname, '/fixtures/testfile.txt')
    const rs = fs.createReadStream(tfpath)
    rs.path = '' // clean the path for testing purposes

    ipfs.util.addFromStream(rs, (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.equal(1)
      done()
    })
  })

  describe('.fsAdd should add', () => {
    it('a directory', (done) => {
      const filesPath = path.join(__dirname, '/fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('a directory with an odd name', (done) => {
      const filesPath = path.join(__dirname, '/fixtures/weird name folder [v0]')
      ipfs.util.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('add and ignore a directory', (done) => {
      const filesPath = path.join(__dirname, '/fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true, ignore: ['files/**'] }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.below(9)
        done()
      })
    })

    it('a file', (done) => {
      const filePath = path.join(__dirname, '/fixtures/testfile.txt')
      ipfs.util.addFromFs(filePath, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.equal(1)
        expect(result[0].path).to.be.equal('testfile.txt')
        done()
      })
    })

    it('a hidden file in a directory', (done) => {
      const filesPath = path.join(__dirname, '/fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true, hidden: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(10)
        expect(result.map(object => object.path)).to.include('test-folder/.hiddenTest.txt')
        expect(result.map(object => object.hash)).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
        done()
      })
    })
  })

  it('.urlAdd http', function (done) {
    this.timeout(20 * 1000)

    ipfs.util.addFromURL('http://example.com/', (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.equal(1)
      done()
    })
  })

  it('.urlAdd https', (done) => {
    ipfs.util.addFromURL('https://example.com/', (err, result) => {
      expect(err).to.not.exist()
      expect(result.length).to.equal(1)
      done()
    })
  })

  it('.urlAdd http with redirection', (done) => {
    ipfs.util.addFromURL('https://coverartarchive.org/release/6e2a1694-d8b9-466a-aa33-b1077b2333c1', (err, result) => {
      expect(err).to.not.exist()
      expect(result[0].hash).to.equal('QmSUdDvmXuq5YGrL4M3SEz7UZh5eT9WMuAsd9K34sambSj')
      done()
    })
  })
})
