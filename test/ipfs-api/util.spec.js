/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const path = require('path')
const fs = require('fs')
const FactoryClient = require('../factory/factory-client')

describe('.util', () => {
  if (!isNode) {
    return
  }

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

  it('.streamAdd', (done) => {
    const tfpath = path.join(__dirname, '/../fixtures/testfile.txt')
    const rs = fs.createReadStream(tfpath)
    rs.path = '' // clean the path for testing purposes

    ipfs.util.addFromStream(rs, (err, result) => {
      expect(err).to.not.exist
      expect(result.length).to.equal(1)
      done()
    })
  })

  describe('.fsAdd should add', () => {
    it('a directory', (done) => {
      const filesPath = path.join(__dirname, '../fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('a directory with an odd name', (done) => {
      const filesPath = path.join(__dirname, '../fixtures/weird name folder [v0]')
      ipfs.util.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('add and ignore a directory', (done) => {
      const filesPath = path.join(__dirname, '../fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true, ignore: ['files/**'] }, (err, result) => {
        expect(err).to.not.exist
        expect(result.length).to.be.below(9)
        done()
      })
    })

    it('a file', (done) => {
      const filePath = path.join(__dirname, '../fixtures/testfile.txt')
      ipfs.util.addFromFs(filePath, (err, result) => {
        expect(err).to.not.exist
        expect(result.length).to.be.equal(1)
        expect(result[0].path).to.be.equal('testfile.txt')
        done()
      })
    })

    it('a hidden file in a directory', (done) => {
      const filesPath = path.join(__dirname, '../fixtures/test-folder')
      ipfs.util.addFromFs(filesPath, { recursive: true, hidden: true }, (err, result) => {
        expect(err).to.not.exist
        expect(result.length).to.be.above(10)
        expect(result.map(object => object.path)).to.include('test-folder/.hiddenTest.txt')
        expect(result.map(object => object.hash)).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
        done()
      })
    })
  })

  it('.urlAdd http', (done) => {
    ipfs.util.addFromURL('http://example.com/', (err, result) => {
      expect(err).to.not.exist
      expect(result.length).to.equal(1)
      done()
    })
  })

  it('.urlAdd https', (done) => {
    ipfs.util.addFromURL('https://example.com/', (err, result) => {
      expect(err).to.not.exist
      expect(result.length).to.equal(1)
      done()
    })
  })
})
