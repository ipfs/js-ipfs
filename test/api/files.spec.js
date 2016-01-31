'use strict'

let testfile

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/../testfile.txt')
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.files', () => {
  it('files.mkdir', (done) => {
    apiClients['a'].files.mkdir('/test-folder', function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('files.cp', (done) => {
    apiClients['a'].files
      .cp(['/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', '/test-folder/test-file'], (err) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('files.ls', (done) => {
    apiClients['a'].files.ls('/test-folder', (err, res) => {
      expect(err).to.not.exist
      expect(res.Entries.length).to.equal(1)
      done()
    })
  })

  it('files.stat', (done) => {
    apiClients['a'].files.stat('/test-folder/test-file', (err, res) => {
      expect(err).to.not.exist
      expect(res).to.deep.equal({
        Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
        Size: 12,
        CumulativeSize: 20,
        Blocks: 0,
        Type: 'file'
      })

      done()
    })
  })

  it('files.stat file that does not exist', (done) => {
    apiClients['a'].files.stat('/test-folder/does-not-exist', (err, res) => {
      expect(err).to.exist
      if (err.code === 0) {
        return done()
      }
      throw err
    })
  })

  it('files.read', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients['a'].files.read('/test-folder/test-file', (err, stream) => {
      expect(err).to.not.exist
      let buf = ''
      stream
        .on('error', (err) => {
          expect(err).to.not.exist
        })
        .on('data', (data) => {
          buf += data
        })
        .on('end', () => {
          expect(new Buffer(buf)).to.deep.equal(testfile)
          done()
        })
    })
  })

  // -

  it('files.rm', (done) => {
    apiClients['a'].files.rm('/test-folder', { 'recursive': true }, (err) => {
      expect(err).to.not.exist
      done()
    })
  })
})
