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

describe('.cat', function () {
  it('cat', function (done) {
    this.timeout(10000)

    apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      if (err) {
        throw err
      }

      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          assert.equal(buf, testfile)
          done()
        })
    })
  })

  it('cat BIG file', function (done) {
    if (!isNode) {
      return done()
    }
    this.timeout(1000000)

    apiClients['a'].cat('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
      if (err) {
        throw err
      }

      testfileBig = require('fs').createReadStream(__dirname + '/../15mb.random', { bufferSize: 128 })

      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        if (err) throw err
        assert(equal)
        done()
      })
    })
  })
})
