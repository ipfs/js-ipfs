'use strict'

const streamEqual = require('stream-equal')

let testfile
let testfileBig

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/../testfile.txt')
  testfileBig = require('fs').createReadStream(__dirname + '/../15mb.random', { bufferSize: 128 })
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.cat', () => {
  it('cat', done => {
    apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      expect(err).to.not.exist

      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          expect(buf).to.be.equal(testfile.toString())
          done()
        })
    })
  })

  it('cat BIG file', done => {
    if (!isNode) {
      return done()
    }

    apiClients['a'].cat('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
      expect(err).to.not.exist

      testfileBig = require('fs').createReadStream(__dirname + '/../15mb.random', { bufferSize: 128 })

      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        expect(err).to.not.exist
        expect(equal).to.be.true
        done()
      })
    })
  })
})
