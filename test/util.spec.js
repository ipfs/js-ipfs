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
const os = require('os')

const IPFSApi = require('../src')
const f = require('./utils/factory')
const expectTimeout = require('./utils/expect-timeout')

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

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

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

    it('with only-hash=true', function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())
      const filepath = path.join(os.tmpdir(), `${content}.txt`)
      fs.writeFileSync(filepath, content)

      return ipfs.util.addFromFs(filepath, { onlyHash: true })
        .then(out => {
          fs.unlinkSync(filepath)
          return expectTimeout(ipfs.object.get(out[0].hash), 4000)
        })
    })
  })

  describe('.urlAdd', () => {
    it('http', function (done) {
      this.timeout(20 * 1000)

      ipfs.util.addFromURL('http://example.com/', (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.equal(1)
        done()
      })
    })

    it('https', function (done) {
      this.timeout(20 * 1000)

      ipfs.util.addFromURL('https://example.com/', (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.equal(1)
        done()
      })
    })

    it('http with redirection', function (done) {
      this.timeout(20 * 1000)

      ipfs.util.addFromURL('http://covers.openlibrary.org/book/id/969165.jpg', (err, result) => {
        expect(err).to.not.exist()
        expect(result[0].hash).to.equal('QmaL9zy7YUfvWmtD5ZXp42buP7P4xmZJWFkm78p8FJqgjg')
        done()
      })
    })

    it('.urlAdd http with redirection', function (done) {
      this.timeout(20 * 1000)

      ipfs.util.addFromURL('https://coverartarchive.org/release/6e2a1694-d8b9-466a-aa33-b1077b2333c1', (err, result) => {
        expect(err).to.not.exist()
        expect(result[0].hash).to.equal('QmSUdDvmXuq5YGrL4M3SEz7UZh5eT9WMuAsd9K34sambSj')
        done()
      })
    })

    it('with only-hash=true', function () {
      this.timeout(40 * 1000)

      return ipfs.util.addFromURL('http://www.randomtext.me/#/gibberish', { onlyHash: true })
        .then(out => expectTimeout(ipfs.object.get(out[0].hash), 4000))
    })

    it('with wrap-with-directory=true', function (done) {
      this.timeout(20 * 1000)

      ipfs.util.addFromURL('http://ipfs.io/ipfs/QmWjppACLcFLQ2qL38unKQvJBhXH3RUtcGLPk7zmrTwV61/969165.jpg?foo=bar#buzz', {
        wrapWithDirectory: true
      }, (err, result) => {
        expect(err).to.not.exist()
        expect(result[0].hash).to.equal('QmaL9zy7YUfvWmtD5ZXp42buP7P4xmZJWFkm78p8FJqgjg')
        expect(result[0].path).to.equal('969165.jpg')
        expect(result[1].hash).to.equal('QmWjppACLcFLQ2qL38unKQvJBhXH3RUtcGLPk7zmrTwV61')
        expect(result.length).to.equal(2)
        done()
      })
    })

    it('with wrap-with-directory=true and URL-escaped file name', (done) => {
      // Sample URL contains URL-escaped ( ) and local diacritics
      ipfs.util.addFromURL('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Doma%C5%BElice%2C_Jir%C3%A1skova_43_%289102%29.jpg/320px-Doma%C5%BElice%2C_Jir%C3%A1skova_43_%289102%29.jpg?foo=bar#buzz', {
        wrapWithDirectory: true
      }, (err, result) => {
        expect(err).to.not.exist()
        expect(result[0].hash).to.equal('QmRJ9ExxSMV4BLF9ZJUb2mLngupm6BXZEek755VHGTJo2Y')
        expect(result[0].path).to.equal('320px-Domažlice,_Jiráskova_43_(9102).jpg')
        expect(result[1].hash).to.equal('QmbxsHFU3sCfr8wszDHuDLA76C2xCv9HT8L3aC1pBwgaHk')
        expect(result.length).to.equal(2)
        done()
      })
    })

    it('with invalid url', function (done) {
      ipfs.util.addFromURL('http://invalid', (err, result) => {
        expect(err.code).to.equal('ENOTFOUND')
        expect(result).to.not.exist()
        done()
      })
    })
  })

  describe('.getEndpointConfig', () => {
    it('should return the endpoint configured host and port', function () {
      const endpoint = ipfs.util.getEndpointConfig()

      expect(endpoint).to.have.property('host')
      expect(endpoint).to.have.property('port')
    })
  })

  describe('.crypto', () => {
    it('should contain the crypto primitives object', function () {
      const cripto = ipfs.util.crypto

      expect(cripto).to.exist()
    })
  })

  describe('.isIPFS', () => {
    it('should contain the isIPFS utilities object', function () {
      const isIPFS = ipfs.util.isIPFS

      expect(isIPFS).to.exist()
    })
  })
})
