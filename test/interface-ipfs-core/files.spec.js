/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const test = require('interface-ipfs-core')
const loadFixture = require('aegir/fixtures')

const FactoryClient = require('../factory/factory-client')

let testfile
if (isNode) {
  testfile = loadFixture(__dirname, '../fixtures/testfile.txt')
} else {
  testfile = loadFixture(__dirname, 'fixtures/testfile.txt')
}

// add, cat, get and ls tests from interface-ipfs-core
let fc

const common = {
  setup: function (callback) {
    fc = new FactoryClient()
    callback(null, fc)
  },
  teardown: function (callback) {
    fc.dismantle(callback)
  }
}

test.files(common)

// mfs tests
describe('.files (pseudo mfs)', () => {
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

  it('files.mkdir', (done) => {
    ipfs.files.mkdir('/test-folder', function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('files.cp', (done) => {
    ipfs.files
      .cp(['/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', '/test-folder/test-file'], (err) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('files.ls', (done) => {
    ipfs.files.ls('/test-folder', (err, res) => {
      expect(err).to.not.exist
      expect(res.Entries.length).to.equal(1)
      done()
    })
  })

  it('files.write', (done) => {
    ipfs.files
      .write('/test-folder/test-file-2.txt', new Buffer('hello world'), {create: true}, (err) => {
        expect(err).to.not.exist

        ipfs.files.read('/test-folder/test-file-2.txt', (err, stream) => {
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
              expect(buf).to.be.equal('hello world')
              done()
            })
        })
      })
  })

  it('files.write without options', (done) => {
    ipfs.files
      .write('/test-folder/test-file-2.txt', new Buffer('hello world'), (err) => {
        expect(err).to.not.exist

        ipfs.files.read('/test-folder/test-file-2.txt', (err, stream) => {
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
              expect(buf).to.be.equal('hello world')
              done()
            })
        })
      })
  })

  it('files.stat', (done) => {
    ipfs.files.stat('/test-folder/test-file', (err, res) => {
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
    ipfs.files.stat('/test-folder/does-not-exist', (err, res) => {
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

    ipfs.files.read('/test-folder/test-file', (err, stream) => {
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

  it('files.rm without options', (done) => {
    ipfs.files.rm('/test-folder/test-file-2.txt', (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  it('files.rm', (done) => {
    ipfs.files.rm('/test-folder', {recursive: true}, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  describe('promise', () => {
    it('files.mkdir', () => {
      return ipfs.files.mkdir('/test-folder')
    })

    it('files.cp', () => {
      return ipfs.files
        .cp(['/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', '/test-folder/test-file'])
    })

    it('files.ls', () => {
      return ipfs.files.ls('/test-folder')
        .then((res) => {
          expect(res.Entries.length).to.equal(1)
        })
    })

    it('files.write', (done) => {
      ipfs.files
        .write('/test-folder/test-file-2.txt', new Buffer('hello world'), {create: true})
        .then(() => {
          return ipfs.files.read('/test-folder/test-file-2.txt')
        })
        .then((stream) => {
          let buf = ''
          stream
            .on('error', (err) => {
              expect(err).to.not.exist
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.be.equal('hello world')
              done()
            })
        })
        .catch(done)
    })

    it('files.write without options', (done) => {
      ipfs.files
        .write('/test-folder/test-file-2.txt', new Buffer('hello world'))
        .then(() => {
          return ipfs.files.read('/test-folder/test-file-2.txt')
        })
        .then((stream) => {
          let buf = ''
          stream
            .on('error', (err) => {
              expect(err).to.not.exist
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.be.equal('hello world')
              done()
            })
        })
        .catch(done)
    })

    it('files.stat', () => {
      return ipfs.files.stat('/test-folder/test-file')
        .then((res) => {
          expect(res).to.deep.equal({
            Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
            Size: 12,
            CumulativeSize: 20,
            Blocks: 0,
            Type: 'file'
          })
        })
    })

    it('files.stat file that does not exist', () => {
      return ipfs.files.stat('/test-folder/does-not-exist')
        .catch((err) => {
          expect(err).to.exist
          expect(err.code).to.be.eql(0)
        })
    })

    it('files.read', (done) => {
      if (!isNode) {
        return done()
      }

      ipfs.files.read('/test-folder/test-file')
        .then((stream) => {
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

    it('files.rm without options', () => {
      return ipfs.files.rm('/test-folder/test-file-2.txt')
    })

    it('files.rm', () => {
      return ipfs.files.rm('/test-folder', {recursive: true})
    })
  })
})
