/* eslint-env mocha */
import { expect } from 'aegir/utils/chai.js'
import loadFixture from 'aegir/utils/fixtures.js'
import { createFactory } from 'ipfsd-ctl'
import getStream from 'get-stream'
import all from 'it-all'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { getResponse } from '../src/index.js'
import makeWebResponseEnv from './utils/web-response-env.js'
import * as ipfsModule from 'ipfs-core'

const factory = createFactory({
  test: true,
  type: 'proc',
  ipfsModule
})

describe('resolve file (CIDv0)', function () {
  /** @type {*} */
  let ipfs = null

  const file = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    const ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    const retrievedFile = await ipfs.add(file.data, { cidVersion: 0 })
    expect(retrievedFile.cid.toString()).to.equal(file.cid)
    expect(retrievedFile.size, 'ipfs.add result size should not be smaller than input buffer').greaterThan(file.data.length)
  })

  after(() => factory.clean())

  it('should resolve a CIDv0', async () => {
    const res = await getResponse(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res.status).to.equal(200)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/testfile.txt'))

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve file (CIDv1)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const file = {
    cid: 'bafkreidffqfydlguosmmyebv5rp72m45tbpbq6segnkosa45kjfnduix6u',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    const retrievedFile = await ipfs.add(file.data, { cidVersion: 1 })
    expect(retrievedFile.cid.toString()).to.equal(file.cid)
    expect(retrievedFile.size, 'ipfs.add result size should equal input buffer').to.equal(file.data.length)
  })

  after(() => factory.clean())

  it('should resolve a CIDv1', async () => {
    const res = await getResponse(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res.status).to.equal(200)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/testfile.txt'))

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve directory (CIDv0)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const directory = {
    cid: 'QmU1aW5x8tXfbRpJ71zoEVwxrRDHybC2iTVacCMabCUniZ',
    /** @type {Record<string, Uint8Array>} */
    files: {
      'pp.txt': loadFixture('test/fixtures/test-folder/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt')
    }
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    /**
     * @param {string} name
     */
    const content = (name) => ({
      path: `test-folder/${name}`,
      content: directory.files[name]
    })

    const dirs = [
      content('pp.txt'),
      content('holmes.txt')
    ]

    const res = await all(ipfs.addAll(dirs, { cidVersion: 0 }))
    const root = res[res.length - 1]

    expect(root.path).to.equal('test-folder')
    expect(root.cid.toString()).to.equal(directory.cid)

    expect(res[0].size, 'ipfs.add 1st result size should not be smaller than 1st input buffer').greaterThan(dirs[0].content.length)
    expect(res[1].size, 'ipfs.add 2nd result size should not be smaller than 2nd input buffer').greaterThan(dirs[1].content.length)
  })

  after(() => factory.clean())

  it('should return the list of files of a directory', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}`)

    expect(res.status).to.equal(200)
    expect(res.body).to.match(/<html>/)
  })

  it('should return the pp.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/pp.txt`)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/test-folder/pp.txt'))

    expect(contents).to.equal(expectedContents)
  })

  it('should return the holmes.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/holmes.txt`)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/test-folder/holmes.txt'))

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve directory (CIDv1)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const directory = {
    cid: 'bafybeifhimn7nu6dgmdvj6o63zegwro3yznnpfqib6kkjnagc54h46ox5q',
    /** @type {Record<string, Uint8Array>} */
    files: {
      'pp.txt': loadFixture('test/fixtures/test-folder/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt')
    }
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    /**
     * @param {string} name
     */
    const content = (name) => ({
      path: `test-folder/${name}`,
      content: directory.files[name]
    })

    const dirs = [
      content('pp.txt'),
      content('holmes.txt')
    ]

    const res = await all(ipfs.addAll(dirs, { cidVersion: 1 }))
    const root = res[res.length - 1]
    expect(root.path).to.equal('test-folder')
    // expect(res[0].size, 'ipfs.files.add 1st result size should not be smaller than 1st input buffer').greaterThan(dirs[0].content.length)
    // expect(res[1].size, 'ipfs.files.add 2nd result size should not be smaller than 2nd input buffer').greaterThan(dirs[1].content.length)
    expect(root.cid.toString()).to.equal(directory.cid)
  })

  after(() => factory.clean())

  it('should return the list of files of a directory', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}`)

    expect(res.status).to.equal(200)
    expect(res.body).to.match(/<html>/)
  })

  it('should return the pp.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/pp.txt`)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/test-folder/pp.txt'))

    expect(contents).to.equal(expectedContents)
  })

  it('should return the holmes.txt file', async () => {
    const res = await getResponse(ipfs, `/ipfs/${directory.cid}/holmes.txt`)

    // @ts-expect-error types are wrong
    const contents = await getStream(res.body)
    const expectedContents = uint8ArrayToString(loadFixture('test/fixtures/test-folder/holmes.txt'))

    expect(contents).to.equal(expectedContents)
  })
})

describe('resolve web page (CIDv0)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'QmR3fdaM5B3LZog6TqpuHvoHYWQpRoaYwFTZ5YmdzGX5U5',
    /** @type {Record<string, Uint8Array>} */
    files: {
      'pp.txt': loadFixture('test/fixtures/test-site/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-site/holmes.txt'),
      'index.html': loadFixture('test/fixtures/test-site/index.html')
    }
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    /**
     * @param {string} name
     */
    const content = (name) => ({
      path: `test-site/${name}`,
      content: webpage.files[name]
    })

    const dirs = [
      content('pp.txt'),
      content('holmes.txt'),
      content('index.html')
    ]

    const res = await all(ipfs.addAll(dirs, { cidVersion: 0 }))
    const root = res[res.length - 1]

    expect(root.path).to.equal('test-site')
    expect(root.cid.toString()).to.equal(webpage.cid)
  })

  after(() => factory.clean())

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}`)

    expect(res.status).to.equal(302)
    expect(res.headers.get('Location')).to.equal(`/ipfs/${webpage.cid}/index.html`)
  })
})

describe('resolve web page (CIDv1)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'bafybeibpkvlqjkwl73yam6ffsbrlgbwiffnehajc6qvnrhai5bve6jnawi',
    /** @type {Record<string, Uint8Array>} */
    files: {
      'pp.txt': loadFixture('test/fixtures/test-site/pp.txt'),
      'holmes.txt': loadFixture('test/fixtures/test-site/holmes.txt'),
      'index.html': loadFixture('test/fixtures/test-site/index.html')
    }
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    /**
     * @param {string} name
     */
    const content = (name) => ({
      path: `test-site/${name}`,
      content: webpage.files[name]
    })

    const dirs = [
      content('pp.txt'),
      content('holmes.txt'),
      content('index.html')
    ]

    const res = await all(ipfs.addAll(dirs, { cidVersion: 1 }))
    const root = res[res.length - 1]

    expect(root.path).to.equal('test-site')
    expect(root.cid.toString()).to.equal(webpage.cid)
  })

  after(() => factory.clean())

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}`)

    expect(res.status).to.equal(302)
    expect(res.headers.get('Location')).to.equal(`/ipfs/${webpage.cid}/index.html`)
  })
})

// TODO: move mime-types to separate test file
describe('mime-types', () => {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const webpage = {
    cid: 'QmWU1PAWCyd3MBAnALacXXbGU44RpgwdnGPrShSZoQj1H6',
    /** @type {Record<string, Uint8Array>} */
    files: {
      'cat.jpg': loadFixture('test/fixtures/test-mime-types/cat.jpg'),
      'hexagons-xml.svg': loadFixture('test/fixtures/test-mime-types/hexagons-xml.svg'),
      'hexagons.svg': loadFixture('test/fixtures/test-mime-types/hexagons.svg'),
      'pp.txt': loadFixture('test/fixtures/test-mime-types/pp.txt'),
      'index.html': loadFixture('test/fixtures/test-mime-types/index.html')
    }
  }

  before(async function () {
    this.timeout(20 * 1000)
    Object.assign(global, makeWebResponseEnv())

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    /**
     * @param {string} name
     * @returns
     */
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

    const res = await all(ipfs.addAll(dirs, { cidVersion: 0 }))
    const root = res[res.length - 1]

    expect(root.path).to.equal('test-mime-types')
    expect(root.cid.toString()).to.equal(webpage.cid)
  })

  after(() => factory.clean())

  it('should return the correct mime-type for pp.txt', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/pp.txt`)

    expect(res.headers.get('Content-Type')).to.equal('text/plain; charset=utf-8')
  })

  it('should return the correct mime-type for cat.jpg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/cat.jpg`)

    expect(res.headers.get('Content-Type')).to.equal('image/jpeg')
  })

  it('should return the correct mime-type for index.html', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/index.html`)

    expect(res.headers.get('Content-Type')).to.equal('text/html; charset=utf-8')
  })

  it('should return the correct mime-type for hexagons.svg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/hexagons.svg`)

    expect(res.headers.get('Content-Type')).to.equal('image/svg+xml')
  })

  it('should return the correct mime-type for hexagons.svg', async () => {
    const res = await getResponse(ipfs, `/ipfs/${webpage.cid}/hexagons.svg`)

    expect(res.headers.get('Content-Type')).to.equal('image/svg+xml')
  })
})
