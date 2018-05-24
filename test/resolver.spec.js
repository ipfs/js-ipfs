/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const loadFixture = require('aegir/fixtures')
const ipfs = require('ipfs')
const DaemonFactory = require('ipfsd-ctl')

const ipfsResolver = require('../src/resolver')

const df = DaemonFactory.create({ type: 'proc', exec: ipfs })

describe('resolve file', function () {
  let ipfs = null
  let ipfsd = null

  const file = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(function (done) {
    this.timeout(20 * 1000)
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      ipfs.files.add(file.data, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(1)

        const retrievedFile = filesAdded[0]
        expect(retrievedFile.hash).to.equal(file.cid)

        done()
      })
    })
  })

  it('should resolve a multihash', async () => {
    const res = await ipfsResolver.multihash(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res).to.deep.include({
      multihash: file.cid
    })
  })
})

describe('resolve directory', function () {
  let ipfs = null
  let ipfsd = null

  const directory = {
    cid: 'QmU1aW5x8tXfbRpJ71zoEVwxrRDHybC2iTVacCMabCUniZ',
    files: {
      'pp.txt': loadFixture('test/fixtures/test-folder/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt')
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      const content = (name) => ({
        path: `test-folder/${name}`,
        content: directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      ipfs.files.add(dirs, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(directory.cid)
        done()
      })
    })
  })

  it('should throw an error when trying to fetch a directory', async () => {
    try {
      const res = await ipfsResolver.multihash(ipfs, `/ipfs/${directory.cid}`)

      expect(res).to.not.exist()
    } catch (err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  it('should return the list of files of a directory', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${directory.cid}`, directory.cid)

    expect(res).to.exist()
  })
})

describe('resolve web page', function () {
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'QmR3fdaM5B3LZog6TqpuHvoHYWQpRoaYwFTZ5YmdzGX5U5',
    files: {
      'pp.txt': loadFixture('test/fixtures/test-site/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-site/holmes.txt'),
      'index.html': loadFixture('test/fixtures/test-site/index.html')
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      const content = (name) => ({
        path: `test-site/${name}`,
        content: webpage.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('index.html')
      ]

      ipfs.files.add(dirs, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-site')
        expect(root.hash).to.equal(webpage.cid)
        done()
      })
    })
  })

  it('should throw an error when trying to fetch a directory containing a web page', async () => {
    try {
      const res = await ipfsResolver.multihash(ipfs, `/ipfs/${webpage.cid}`)

      expect(res).to.not.exist()
    } catch (err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${webpage.cid}`, webpage.cid)

    expect(res).to.exist()
    expect(res[0]).to.deep.include({
      name: 'index.html'
    })
  })
})
