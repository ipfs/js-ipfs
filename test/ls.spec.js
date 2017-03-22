/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const waterfall = require('async/waterfall')
const path = require('path')

const FactoryClient = require('./ipfs-factory/client')

describe('.ls', () => {
  if (!isNode) { return }

  let ipfs
  let fc
  let folder

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    waterfall([
      (cb) => fc.spawnNode(cb),
      (node, cb) => {
        ipfs = node
        const filesPath = path.join(__dirname, '/fixtures/test-folder')
        ipfs.util.addFromFs(filesPath, { recursive: true }, cb)
      },
      (hashes, cb) => {
        folder = hashes[hashes.length - 1].hash
        expect(folder).to.be.eql('QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh')
        cb()
      }
    ], done)
  })

  after((done) => fc.dismantle(done))

  describe('Callback API', () => {
    it('should correctly retrieve links', function (done) {
      ipfs.ls(folder, (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.have.a.property('Objects')
        expect(res.Objects[0]).to.have.a.property('Links')
        expect(res.Objects[0]).to.have.property('Hash', 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh')
        done()
      })
    })

    it('should correctly handle a nonexist()ing hash', function (done) {
      ipfs.ls('surelynotavalidhashheh?', (err, res) => {
        expect(err).to.exist()
        expect(res).to.not.exist()
        done()
      })
    })

    it('should correctly handle a nonexist()ing path', function (done) {
      ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there', (err, res) => {
        expect(err).to.exist()
        expect(res).to.not.exist()
        done()
      })
    })
  })

  describe('Promises API', () => {
    it('should correctly retrieve links', () => {
      return ipfs.ls(folder)
        .then((res) => {
          expect(res).to.have.a.property('Objects')
          expect(res.Objects[0]).to.have.a.property('Links')
          expect(res.Objects[0]).to.have.property('Hash', 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh')
        })
    })

    it('should correctly handle a nonexist()ing hash', () => {
      return ipfs.ls('surelynotavalidhashheh?')
        .catch((err) => expect(err).to.exist())
    })

    it('should correctly handle a nonexist()ing path', () => {
      return ipfs.ls('QmRNjDeKStKGTQXnJ3NFqeQ9oW/folder_that_isnt_there')
        .catch((err) => expect(err).to.exist())
    })
  })
})
