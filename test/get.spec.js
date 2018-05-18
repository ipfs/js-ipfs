/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const series = require('async/series')
const loadFixture = require('aegir/fixtures')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.get (specific go-ipfs features)', function () {
  this.timeout(20 * 1000)

  function fixture (path) {
    return loadFixture(path, 'interface-ipfs-core')
  }

  const smallFile = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: fixture('js/test/fixtures/testfile.txt')
  }

  let ipfsd
  let ipfs

  before(function (done) {
    series([
      (cb) => f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = IPFSApi(_ipfsd.apiAddr)
        cb()
      }),
      (cb) => ipfs.files.add(smallFile.data, cb)
    ], done)
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('no compression args', (done) => {
    ipfs.get(smallFile.cid, (err, files) => {
      expect(err).to.not.exist()

      expect(files).to.be.length(1)
      expect(files[0].content.toString()).to.contain(smallFile.data.toString())
      done()
    })
  })

  it('archive true', (done) => {
    ipfs.get(smallFile.cid, { archive: true }, (err, files) => {
      expect(err).to.not.exist()

      expect(files).to.be.length(1)
      expect(files[0].content.toString()).to.contain(smallFile.data.toString())
      done()
    })
  })

  it('err with out of range compression level', (done) => {
    ipfs.get(smallFile.cid, {
      compress: true,
      'compression-level': 10
    }, (err, files) => {
      expect(err).to.exist()
      expect(err.toString()).to.equal('Error: compression level must be between 1 and 9')
      done()
    })
  })

  // TODO Understand why this test started failing
  it.skip('with compression level', (done) => {
    ipfs.get(smallFile.cid, { compress: true, 'compression-level': 1 }, done)
  })

  it('add path containing "+"s (for testing get)', (done) => {
    if (!isNode) {
      return done()
    }

    const filename = 'ti,c64x+mega++mod-pic.txt'
    const subdir = 'tmp/c++files'
    const expectedCid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    ipfs.add([{
      path: subdir + '/' + filename,
      content: Buffer.from(subdir + '/' + filename, 'utf-8')
    }], (err, files) => {
      expect(err).to.not.exist()
      expect(files[2].hash).to.equal(expectedCid)
      done()
    })
  })

  it('get path containing "+"s', (done) => {
    if (!isNode) {
      return done()
    }

    const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    let count = 0
    ipfs.get(cid, (err, files) => {
      expect(err).to.not.exist()
      files.forEach((file) => {
        if (file.path !== cid) {
          count++
          expect(file.path).to.contain('+')
          if (count === 2) done()
        }
      })
    })
  })
})
