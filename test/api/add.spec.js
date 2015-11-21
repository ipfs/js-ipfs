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

describe('.add', function () {
  it('add file', function (done) {
    if (!isNode) {
      return done()
    }

    this.timeout(10000)

    const file = new File({
      cwd: path.dirname(testfilePath),
      base: path.dirname(testfilePath),
      path: testfilePath,
      contents: new Buffer(testfile)
    })

    apiClients['a'].add(file, (err, res) => {
      if (err) throw err

      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      assert.equal(added.Name, path.basename(testfilePath))
      done()
    })
  })

  it('add buffer', function (done) {
    this.timeout(10000)

    let buf = new Buffer(testfile)
    apiClients['a'].add(buf, (err, res) => {
      if (err) throw err

      // assert.equal(res.length, 1)
      const added = res[0] !== null ? res[0] : res
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('add BIG buffer', function (done) {
    if (!isNode) {
      return done()
    }
    this.timeout(10000)

    apiClients['a'].add(testfileBig, (err, res) => {
      if (err) throw err

      // assert.equal(res.length, 1)
      const added = res[0] !== null ? res[0] : res
      assert.equal(added.Hash, 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq')
      done()
    })
  })

  it('add path', function (done) {
    if (!isNode) {
      return done()
    }

    this.timeout(10000)

    apiClients['a'].add(testfilePath, (err, res) => {
      if (err) throw err

      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('add a nested dir', function (done) {
    this.timeout(10000)

    apiClients['a'].add(__dirname + '/../test-folder', { recursive: true }, (err, res) => {
      if (isNode) {
        if (err) throw err

        const added = res[res.length - 1]
        assert.equal(added.Hash, 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
        done()
      } else {
        assert.equal(err.message, 'Recursive uploads are not supported in the browser')
        done()
      }
    })
  })

  it('add stream', function (done) {
    this.timeout(10000)

    const stream = new Readable()
    stream.push('Hello world')
    stream.push(null)
    apiClients['a'].add(stream, (err, res) => {
      if (err) throw err

      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
      done()
    })
  })

  it('add url', function (done) {
    this.timeout(10000)

    const url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
    apiClients['a'].add(url, (err, res) => {
      if (err) throw err

      const added = res[0] != null ? res[0] : res
      assert.equal(added.Hash, 'QmZmHgEX9baxUn3qMjsEXQzG6DyNcrVnwieQQTrpDdrFvt')
      done()
    })
  })
})
