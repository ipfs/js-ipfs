'use strict'

const path = require('path')
const File = require('vinyl')
const Readable = require('stream').Readable

const isNode = !global.window

const testfilePath = __dirname + '/../testfile.txt'
let testfile
let testfileBig

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/../testfile.txt')
  testfileBig = require('fs').createReadStream(__dirname + '/../15mb.random', { bufferSize: 128 })
  // testfileBig = require('fs').createReadStream(__dirname + '/../100mb.random', { bufferSize: 128 })
} else {
  testfile = require('raw!../testfile.txt')
  // browser goes nuts with a 100mb in memory
  // testfileBig = require('raw!../100mb.random')
}

describe('.add', () => {
  it('add file', done => {
    if (!isNode) {
      return done()
    }

    const file = new File({
      cwd: path.dirname(testfilePath),
      base: path.dirname(testfilePath),
      path: testfilePath,
      contents: new Buffer(testfile)
    })

    apiClients['a'].add(file, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      expect(added).to.have.property('Hash', 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      expect(added).to.have.property('Name', path.basename(testfilePath))
      done()
    })
  })

  it('add buffer', done => {
    let buf = new Buffer(testfile)
    apiClients['a'].add(buf, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.length(1)
      expect(res[0]).to.have.property('Hash', 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('add BIG buffer', done => {
    if (!isNode) {
      return done()
    }

    apiClients['a'].add(testfileBig, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.length(1)
      expect(res[0]).to.have.a.property('Hash', 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq')
      done()
    })
  })

  it('add path', done => {
    if (!isNode) {
      return done()
    }

    apiClients['a'].add(testfilePath, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      expect(added).to.have.property('Hash', 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('add a nested dir', done => {
    apiClients['a'].add(__dirname + '/../test-folder', { recursive: true }, (err, res) => {
      if (isNode) {
        expect(err).to.not.exist

        const added = res[res.length - 1]
        expect(added).to.have.property('Hash', 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
        done()
      } else {
        expect(err.message).to.be.equal('Recursive uploads are not supported in the browser')
        done()
      }
    })
  })

  it('add stream', done => {
    const stream = new Readable()
    stream.push('Hello world')
    stream.push(null)
    apiClients['a'].add(stream, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      expect(added).to.have.a.property('Hash', 'QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
      done()
    })
  })

  it('add url', done => {
    const url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
    apiClients['a'].add(url, (err, res) => {
      expect(err).to.not.exist

      const added = res[0] != null ? res[0] : res
      expect(added).to.have.a.property('Hash', 'QmZmHgEX9baxUn3qMjsEXQzG6DyNcrVnwieQQTrpDdrFvt')
      done()
    })
  })
})
