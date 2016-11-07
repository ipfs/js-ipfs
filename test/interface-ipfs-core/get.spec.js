/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const fs = require('fs')
const concat = require('concat-stream')
const through = require('through2')
const streamEqual = require('stream-equal')
const path = require('path')
const loadFixture = require('aegir/fixtures')
const FactoryClient = require('../factory/factory-client')

let testfile
let testfileBig
let tfbPath
if (isNode) {
  tfbPath = path.join(__dirname, '../fixtures/15mb.random')
  testfileBig = fs.createReadStream(tfbPath, { bufferSize: 128 })
  testfile = loadFixture(__dirname, '../fixtures/testfile.txt')
} else {
  testfile = loadFixture(__dirname, 'fixtures/testfile.txt')
}

describe('.get', () => {
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

  it('get with no compression args', (done) => {
    ipfs
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        expect(err).to.not.exist

        // accumulate the files and their content
        var files = []
        res.pipe(through.obj((file, enc, next) => {
          file.content.pipe(concat((content) => {
            files.push({
              path: file.path,
              content: content
            })
            next()
          }))
        }, () => {
          expect(files).to.be.length(1)
          expect(files[0].content.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get with archive true', (done) => {
    ipfs
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {archive: true}, (err, res) => {
        expect(err).to.not.exist

        // accumulate the files and their content
        var files = []
        res.pipe(through.obj((file, enc, next) => {
          file.content.pipe(concat((content) => {
            files.push({
              path: file.path,
              content: content
            })
            next()
          }))
        }, () => {
          expect(files).to.be.length(1)
          expect(files[0].content.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get err with out of range compression level', (done) => {
    ipfs
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 10}, (err, res) => {
        expect(err).to.exist
        expect(err.toString()).to.equal('Error: Compression level must be between 1 and 9')
        done()
      })
  })

  it('get with compression level', (done) => {
    ipfs
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 1}, (err, res) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('add a BIG file (for testing get)', (done) => {
    if (!isNode) {
      return done()
    }

    const bigFile = fs.readFileSync(tfbPath)
    const expectedMultihash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

    ipfs.files.add(bigFile, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.length(1)
      expect(res[0].path).to.equal(expectedMultihash)
      expect(res[0].hash).to.equal(expectedMultihash)
      done()
    })
  })

  it('get BIG file', (done) => {
    if (!isNode) {
      return done()
    }

    ipfs.get('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, files) => {
      expect(err).to.not.exist

      files.on('data', (file) => {
        // Do not blow out the memory of nodejs :)
        streamEqual(file.content, testfileBig, (err, equal) => {
          expect(err).to.not.exist
          expect(equal).to.be.true
          done()
        })
      })
    })
  })

  describe('promise', () => {
    it('get', (done) => {
      ipfs.get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((files) => {
          files.on('data', (file) => {
            let buf = ''
            file.content
              .on('error', (err) => {
                throw err
              })
              .on('data', (data) => {
                buf += data.toString()
              })
              .on('end', () => {
                expect(buf).to.contain(testfile.toString())
                done()
              })
          })
        })
      .catch((err) => {
        expect(err).to.not.exist
      })
    })
  })
})
