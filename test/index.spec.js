/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const loadFixture = require('aegir/fixtures')
const ipfs = require('ipfs')
const DaemonFactory = require('ipfsd-ctl')
const getStream = require('get-stream')
const CID = require('cids')

const { getResponse } = require('../src')
const makeWebResponseEnv = require('./utils/web-response-env')

const df = DaemonFactory.create({ type: 'proc', exec: ipfs })

describe('resolve file (CIDv0)', function () {
  let ipfs = null
  let ipfsd = null

  const file = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(function (done) {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      ipfs.add(file.data, { cidVersion: 0 }, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(1)

        const retrievedFile = filesAdded[0]
        expect(new CID(retrievedFile.hash)).to.deep.equal(new CID(file.cid))
        expect(retrievedFile.size, 'ipfs.add result size should not be smaller than input buffer').greaterThan(file.data.length)

        done()
      })
    })
  })

  it('should resolve a CIDv0', async () => {
    const res = await getResponse(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res.status).to.equal(200)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/testfile.txt').toString()

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve file (CIDv1)', function () {
  let ipfs = null
  let ipfsd = null

  const file = {
    cid: 'bafkreidffqfydlguosmmyebv5rp72m45tbpbq6segnkosa45kjfnduix6u',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(function (done) {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      ipfs.add(file.data, { cidVersion: 1 }, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(1)
        const retrievedFile = filesAdded[0]
        expect(new CID(retrievedFile.hash)).to.deep.equal(new CID(file.cid))
        // expect(retrievedFile.size, 'ipfs.add result size should not be smaller than input buffer').greaterThan(file.data.length)

        done()
      })
    })
  })

  it('should resolve a CIDv1', async () => {
    const res = await getResponse(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res.status).to.equal(200)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/testfile.txt').toString()

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve directory (CIDv0)', function () {
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
    Object.assign(global, makeWebResponseEnv())

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

      ipfs.add(dirs, { cidVersion: 0 }, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(new CID(root.hash)).to.deep.equal(new CID(directory.cid))

        expect(res[0].size, 'ipfs.add 1st result size should not be smaller than 1st input buffer').greaterThan(dirs[0].content.length)
        expect(res[1].size, 'ipfs.add 2nd result size should not be smaller than 2nd input buffer').greaterThan(dirs[1].content.length)

        done()
      })
    })
  })

  it('should return the list of files of a directory', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}`, directory.cid)

    expect(res.status).to.equal(200)
    expect(res.body).to.match(/<html>/)
  })

  it('should return the pp.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/pp.txt`, directory.cid)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/test-folder/pp.txt').toString()

    expect(contents).to.equal(expectedContents)
  })

  it('should return the holmes.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/holmes.txt`, directory.cid)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/test-folder/holmes.txt').toString()

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve directory (CIDv1)', function () {
  let ipfs = null
  let ipfsd = null

  const directory = {
    cid: 'bafybeifhimn7nu6dgmdvj6o63zegwro3yznnpfqib6kkjnagc54h46ox5q',
    files: {
      'pp.txt': Buffer.from(loadFixture('test/fixtures/test-folder/pp.txt')),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt')
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

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

      ipfs.add(dirs, { cidVersion: 1 }, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]
        expect(root.path).to.equal('test-folder')
        // expect(res[0].size, 'ipfs.files.add 1st result size should not be smaller than 1st input buffer').greaterThan(dirs[0].content.length)
        // expect(res[1].size, 'ipfs.files.add 2nd result size should not be smaller than 2nd input buffer').greaterThan(dirs[1].content.length)
        expect(new CID(root.hash)).to.deep.equal(new CID(directory.cid))
        done()
      })
    })
  })

  it('should return the list of files of a directory', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}`, directory.cid)

    expect(res.status).to.equal(200)
    expect(res.body).to.match(/<html>/)
  })

  it('should return the pp.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/pp.txt`, directory.cid)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/test-folder/pp.txt').toString()

    expect(contents).to.equal(expectedContents)
  })

  it('should return the holmes.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/holmes.txt`, directory.cid)

    const contents = await getStream(res.body)
    const expectedContents = loadFixture('test/fixtures/test-folder/holmes.txt').toString()

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve web page (CIDv0)', function () {
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
    Object.assign(global, makeWebResponseEnv())

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

      ipfs.add(dirs, { cidVersion: 0 }, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-site')
        expect(new CID(root.hash)).to.deep.equal(new CID(webpage.cid))
        done()
      })
    })
  })

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}`, webpage.cid)

    expect(res.status).to.equal(302)
    expect(res.headers.get('Location')).to.equal(`/ipfs/${webpage.cid}/index.html`)
  })
})

describe('resolve web page (CIDv1)', function () {
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'bafybeibpkvlqjkwl73yam6ffsbrlgbwiffnehajc6qvnrhai5bve6jnawi',
    files: {
      'pp.txt': loadFixture('test/fixtures/test-site/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-site/holmes.txt'),
      'index.html': loadFixture('test/fixtures/test-site/index.html')
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

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

      ipfs.add(dirs, { cidVersion: 1 }, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]
        expect(root.path).to.equal('test-site')
        expect(new CID(root.hash)).to.deep.equal(new CID(webpage.cid))
        done()
      })
    })
  })

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}`, webpage.cid)

    expect(res.status).to.equal(302)
    expect(res.headers.get('Location')).to.equal(`/ipfs/${webpage.cid}/index.html`)
  })
})

// TODO: move mime-types to separate test file
describe('mime-types', () => {
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'QmWU1PAWCyd3MBAnALacXXbGU44RpgwdnGPrShSZoQj1H6',
    files: {
      'cat.jpg': loadFixture('test/fixtures/test-mime-types/cat.jpg'),
      'hexagons-xml.svg': loadFixture('test/fixtures/test-mime-types/hexagons-xml.svg'),
      'hexagons.svg': loadFixture('test/fixtures/test-mime-types/hexagons.svg'),
      'pp.txt': loadFixture('test/fixtures/test-mime-types/pp.txt'),
      'index.html': loadFixture('test/fixtures/test-mime-types/index.html')
    }
  }

  before(function (done) {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      const content = (name) => ({
        path: `test-mime-types/${name}`,
        content: webpage.files[name]
      })

      const dirs = [
        content('cat.jpg'),
        content('hexagons-xml.svg'),
        content('hexagons.svg'),
        content('pp.txt'),
        content('index.html')
      ]

      ipfs.add(dirs, { cidVersion: 0 }, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-mime-types')
        expect(new CID(root.hash)).to.deep.equal(new CID(webpage.cid))
        done()
      })
    })
  })

  it('should return the correct mime-type for pp.txt', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/pp.txt`, webpage.cid)

    expect(res.headers.get('Content-Type')).to.equal('text/plain; charset=utf-8')
  })

  it('should return the correct mime-type for cat.jpg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/cat.jpg`, webpage.cid)

    expect(res.headers.get('Content-Type')).to.equal('image/jpeg')
  })

  it('should return the correct mime-type for index.html', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/index.html`, webpage.cid)

    expect(res.headers.get('Content-Type')).to.equal('text/html; charset=utf-8')
  })

  it('should return the correct mime-type for hexagons.svg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/hexagons.svg`, webpage.cid)

    expect(res.headers.get('Content-Type')).to.equal('image/svg+xml')
  })

  it('should return the correct mime-type for hexagons.svg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/hexagons.svg`, webpage.cid)

    expect(res.headers.get('Content-Type')).to.equal('image/svg+xml')
  })
})
