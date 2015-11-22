'use strict'

let testfile

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/../testfile.txt')
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.files', function () {
  it('files.mkdir', function (done) {
    this.timeout(20000)

    apiClients['a'].files.mkdir('/test-folder', function (err) {
      assert(!err)
      if (err) {
        return done()
      }
      done()
    })
  })

  it('files.cp', function (done) {
    this.timeout(20000)

    apiClients['a'].files
      .cp(['/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', '/test-folder/test-file'], function (err) {
        assert(!err)
        if (err) {
          return done()
        }
        done()
      })
  })

  it('files.ls', function (done) {
    this.timeout(20000)

    apiClients['a'].files.ls('/test-folder', function (err, res) {
      assert(!err)
      if (err) {
        return done()
      }
      assert.equal(res.Entries.length, 1)
      done()
    })
  })

  it('files.stat', function (done) {
    this.timeout(20000)

    apiClients['a'].files.stat('/test-folder/test-file', function (err, res) {
      assert(!err)
      if (err) {
        return done()
      }
      assert.deepEqual(res, {
        Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
        Size: 12,
        CumulativeSize: 20,
        Blocks: 0
      })

      done()
    })
  })

  // -

  it('files.read', function (done) {
    this.timeout(20000)

    apiClients['a'].files.read('/test-folder/test-file', function (err, stream) {
      if (err) throw err
      let buf = ''
      stream
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, testfile)
          done()
        })
    })
  })

  // -

  it('files.rm', function (done) {
    this.timeout(20000)

    apiClients['a'].files.rm('/test-folder', { 'recursive': true }, function (err) {
      assert(!err)
      done()
    })
  })
})
