/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const loadFixture = require('aegir/fixtures')
const mh = require('multihashes')
const CID = require('cids')
const pull = require('pull-stream')

const IPFSApi = require('../src')
const f = require('./utils/factory')
const expectTimeout = require('./utils/expect-timeout')

const testfile = loadFixture('test/fixtures/testfile.txt')

// TODO: Test against all algorithms Object.keys(mh.names)
// This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
const HASH_ALGS = [
  'sha1',
  'sha2-256',
  'sha2-512',
  'keccak-224',
  'keccak-256',
  'keccak-384',
  'keccak-512'
]

describe('.files (the MFS API part)', function () {
  this.timeout(120 * 1000)

  let ipfsd
  let ipfs

  const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

  before((done) => {
    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('add file for testing', (done) => {
    ipfs.files.add(testfile, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedMultihash)
      expect(res[0].path).to.equal(expectedMultihash)
      done()
    })
  })

  it('files.add with Buffer module', (done) => {
    let Buffer = require('buffer').Buffer

    let expectedBufferMultihash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    let file = Buffer.from('hello')

    ipfs.files.add(file, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedBufferMultihash)
      expect(res[0].path).to.equal(expectedBufferMultihash)
      done()
    })
  })

  it('files.add with empty path and buffer content', (done) => {
    const expectedHash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    const content = Buffer.from('hello')

    ipfs.files.add([{ path: '', content }], (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedHash)
      expect(res[0].path).to.equal(expectedHash)
      done()
    })
  })

  it('files.add with cid-version=1 and raw-leaves=false', (done) => {
    const expectedCid = 'zdj7Wh9x6gXdg4UAqhRYnjBTw9eJF7hvzUU4HjpnZXHYQz9jK'
    const options = { 'cid-version': 1, 'raw-leaves': false }

    ipfs.files.add(testfile, options, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedCid)
      expect(res[0].path).to.equal(expectedCid)
      done()
    })
  })

  it('files.add with only-hash=true', function () {
    this.slow(10 * 1000)
    const content = String(Math.random() + Date.now())

    return ipfs.files.add(Buffer.from(content), { onlyHash: true })
      .then(files => {
        expect(files).to.have.length(1)

        // 'ipfs.object.get(<hash>)' should timeout because content wasn't actually added
        return expectTimeout(ipfs.object.get(files[0].hash), 4000)
      })
  })

  it('files.add with options', (done) => {
    ipfs.files.add(testfile, { pin: false }, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedMultihash)
      expect(res[0].path).to.equal(expectedMultihash)
      done()
    })
  })

  it('files.add pins by default', (done) => {
    const newContent = Buffer.from(String(Math.random()))

    ipfs.pin.ls((err, pins) => {
      expect(err).to.not.exist()
      const initialPinCount = pins.length
      ipfs.files.add(newContent, (err, res) => {
        expect(err).to.not.exist()

        ipfs.pin.ls((err, pins) => {
          expect(err).to.not.exist()
          expect(pins.length).to.eql(initialPinCount + 1)
          done()
        })
      })
    })
  })

  it('files.add with pin=false', (done) => {
    const newContent = Buffer.from(String(Math.random()))

    ipfs.pin.ls((err, pins) => {
      expect(err).to.not.exist()
      const initialPinCount = pins.length
      ipfs.files.add(newContent, { pin: false }, (err, res) => {
        expect(err).to.not.exist()

        ipfs.pin.ls((err, pins) => {
          expect(err).to.not.exist()
          expect(pins.length).to.eql(initialPinCount)
          done()
        })
      })
    })
  })

  HASH_ALGS.forEach((name) => {
    it(`files.add with hash=${name} and raw-leaves=false`, (done) => {
      const content = String(Math.random() + Date.now())
      const file = {
        path: content + '.txt',
        content: Buffer.from(content)
      }
      const options = { hash: name, 'raw-leaves': false }

      ipfs.files.add([file], options, (err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        const cid = new CID(res[0].hash)
        expect(mh.decode(cid.multihash).name).to.equal(name)
        done()
      })
    })
  })

  it('files.add file with progress option', (done) => {
    let progress
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    ipfs.files.add(testfile, { progress: progressHandler }, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(progress).to.be.equal(testfile.byteLength)
      expect(progressCount).to.be.equal(1)

      done()
    })
  })

  it('files.add big file with progress option', (done) => {
    let progress = 0
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    // TODO: needs to be using a big file
    ipfs.files.add(testfile, { progress: progressHandler }, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(progress).to.be.equal(testfile.byteLength)
      expect(progressCount).to.be.equal(1)

      done()
    })
  })

  it('files.add directory with progress option', (done) => {
    let progress = 0
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    // TODO: needs to be using a directory
    ipfs.files.add(testfile, { progress: progressHandler }, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(progress).to.be.equal(testfile.byteLength)
      expect(progressCount).to.be.equal(1)

      done()
    })
  })

  it('files.add without progress options', (done) => {
    ipfs.files.add(testfile, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      done()
    })
  })

  HASH_ALGS.forEach((name) => {
    it(`files.add with hash=${name} and raw-leaves=false`, (done) => {
      const content = String(Math.random() + Date.now())
      const file = {
        path: content + '.txt',
        content: Buffer.from(content)
      }
      const options = { hash: name, 'raw-leaves': false }

      ipfs.files.add([file], options, (err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        const cid = new CID(res[0].hash)
        expect(mh.decode(cid.multihash).name).to.equal(name)
        done()
      })
    })
  })

  it('files.addPullStream with object chunks and pull stream content', (done) => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

    pull(
      pull.values([{ content: pull.values([Buffer.from('test')]) }]),
      ipfs.files.addPullStream(),
      pull.collect((err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        done()
      })
    )
  })

  it('files.add with pull stream (callback)', (done) => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

    ipfs.files.add(pull.values([Buffer.from('test')]), (err, res) => {
      if (err) return done(err)
      expect(res).to.have.length(1)
      expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
      done()
    })
  })

  it('files.add with pull stream (promise)', () => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

    return ipfs.files.add(pull.values([Buffer.from('test')]))
      .then((res) => {
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
      })
  })

  it('files.add with array of objects with pull stream content', () => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

    return ipfs.files.add([{ content: pull.values([Buffer.from('test')]) }])
      .then((res) => {
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
      })
  })

  it('files.mkdir', (done) => {
    ipfs.files.mkdir('/test-folder', done)
  })

  it('files.flush', (done) => {
    ipfs.files.flush('/', done)
  })

  it('files.cp', (done) => {
    ipfs.files.cp([
      '/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      '/test-folder/test-file'
    ], (err) => {
      expect(err).to.not.exist()
      done()
    })
  })

  it('files.ls', (done) => {
    ipfs.files.ls('/test-folder', (err, res) => {
      expect(err).to.not.exist()
      expect(res.length).to.equal(1)
      done()
    })
  })

  it('files.write', (done) => {
    ipfs.files
      .write('/test-folder/test-file-2.txt', Buffer.from('hello world'), {create: true}, (err) => {
        expect(err).to.not.exist()

        ipfs.files.read('/test-folder/test-file-2.txt', (err, buf) => {
          expect(err).to.not.exist()
          expect(buf.toString()).to.be.equal('hello world')
          done()
        })
      })
  })

  it('files.write without options', (done) => {
    ipfs.files
      .write('/test-folder/test-file-2.txt', Buffer.from('hello world'), (err) => {
        expect(err).to.not.exist()

        ipfs.files.read('/test-folder/test-file-2.txt', (err, buf) => {
          expect(err).to.not.exist()
          expect(buf.toString()).to.be.equal('hello world')
          done()
        })
      })
  })

  it('files.stat', (done) => {
    ipfs.files.stat('/test-folder/test-file', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.deep.equal({
        hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
        size: 12,
        cumulativeSize: 20,
        blocks: 0,
        type: 'file',
        withLocality: false,
        local: undefined,
        sizeLocal: undefined
      })

      done()
    })
  })

  it('files.stat file that does not exist()', (done) => {
    ipfs.files.stat('/test-folder/does-not-exist()', (err, res) => {
      expect(err).to.exist()
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

    ipfs.files.read('/test-folder/test-file', (err, buf) => {
      expect(err).to.not.exist()
      expect(Buffer.from(buf)).to.deep.equal(testfile)
      done()
    })
  })

  it('files.rm without options', (done) => {
    ipfs.files.rm('/test-folder/test-file-2.txt', done)
  })

  it('files.rm', (done) => {
    ipfs.files.rm('/test-folder', {recursive: true}, done)
  })
})
