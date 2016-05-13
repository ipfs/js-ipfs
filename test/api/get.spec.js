/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const fs = require('fs')
const bl = require('bl')

const path = require('path')
const streamEqual = require('stream-equal')

let testfile
let testfileBig

if (isNode) {
  testfile = fs.readFileSync(path.join(__dirname, '/../testfile.txt'))
  testfileBig = fs.createReadStream(path.join(__dirname, '/../15mb.random'), { bufferSize: 128 })
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.get', () => {
  it('get with no compression args', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        expect(err).to.not.exist
        res.pipe(bl((err, bldata) => {
          expect(err).to.not.exist
          expect(bldata.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get with archive true', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {archive: true}, (err, res) => {
        expect(err).to.not.exist
        res.pipe(bl((err, bldata) => {
          expect(err).to.not.exist
          expect(bldata.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get err with out of range compression level', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 10}, (err, res) => {
        expect(err).to.exist
        expect(err.toString()).to.equal('Error: Compression level must be between 1 and 9')
        done()
      })
  })

  it('get with compression level', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 1}, (err, res) => {
        expect(err).to.not.exist
        done()
      })
  })

  it.skip('get BIG file', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.a.get('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
      expect(err).to.not.exist

      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        expect(err).to.not.exist
        expect(equal).to.be.true
        done()
      })
    })
  })

  describe('promise', () => {
    it.skip('get', (done) => {
      return apiClients.a.get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          let buf = ''
          res
            .on('error', (err) => {
              throw err
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.contain(testfile.toString())
              done()
            })
        })
    })
  })
})
