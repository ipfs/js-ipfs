/* eslint-env mocha */
import { expect } from 'aegir/utils/chai.js'
import loadFixture from 'aegir/utils/fixtures.js'
import { createFactory } from 'ipfsd-ctl'
import all from 'it-all'
import * as ipfsResolver from '../src/resolver.js'
import * as ipfsModule from 'ipfs-core'

const factory = createFactory({
  test: true,
  type: 'proc',
  ipfsModule
})

describe('resolve file (CIDv0)', function () {
  /** @type {any} */
  let ipfs = null
  let ipfsd = null

  const file = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('test/fixtures/testfile.txt')
  }

  before(async function () {
    this.timeout(20 * 1000)

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    const retrievedFile = await ipfs.add(file.data, { cidVersion: 0 })
    expect(retrievedFile.cid.toString()).to.equal(file.cid)
  })

  after(() => factory.clean())

  it('should resolve a cid', async () => {
    const res = await ipfsResolver.cid(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res).to.have.property('cid')
    expect(res.cid.toString()).to.equal(file.cid)
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

    ipfsd = await factory.spawn()
    ipfs = ipfsd.api

    const retrievedFile = await ipfs.add(file.data, { cidVersion: 1 })
    expect(retrievedFile.cid.toString()).to.equal(file.cid)
    expect(retrievedFile.size, 'ipfs.files.add result size should not be smaller than input buffer').equal(file.data.length)
  })

  after(() => factory.clean())

  it('should resolve a cid', async () => {
    const res = await ipfsResolver.cid(ipfs, `/ipfs/${file.cid}`)

    expect(res).to.exist()
    expect(res).to.have.property('cid')
    expect(res.cid.toString()).to.equal(file.cid)
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
  })

  after(() => factory.clean())

  it('should throw an error when trying to fetch a directory', async () => {
    try {
      const res = await ipfsResolver.cid(ipfs, `/ipfs/${directory.cid}`)

      expect(res).to.not.exist()
    } catch (/** @type {any} */ err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  // TODO: unskip when https://github.com/ipfs/js-ipfs/pull/3556 lands
  it.skip('should return HTML listing of files of a directory', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${directory.cid}`, directory.cid)

    expect(res).to.exist()
    expect(res).to.include('</html>')
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
    // console.log('ipfs.files.add result', res)
    expect(root.path).to.equal('test-folder')
    // expect(res[0].size, 'ipfs.files.add 1st result size should not be smaller than 1st input buffer').greaterThan(dirs[0].content.length)
    // expect(res[1].size, 'ipfs.files.add 2nd result size should not be smaller than 2nd input buffer').greaterThan(dirs[1].content.length)
    expect(root.cid.toString()).to.equal(directory.cid)
  })

  after(() => factory.clean())

  it('should throw an error when trying to fetch a directory', async () => {
    try {
      const res = await ipfsResolver.cid(ipfs, `/ipfs/${directory.cid}`)

      expect(res).to.not.exist()
    } catch (/** @type {any} */ err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  // TODO: unskip when https://github.com/ipfs/js-ipfs/pull/3556 lands
  it.skip('should return HTML listing of files of a directory', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${directory.cid}`, directory.cid)
    expect(res).to.exist()
    expect(res).to.include('pp.txt')
    expect(res).to.include('holmes.txt')
    expect(res).to.include('</html>')
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
    expect(root.cid.toString()).to.deep.equal(webpage.cid)
  })

  after(() => factory.clean())

  it('should throw an error when trying to fetch a directory containing a web page', async () => {
    try {
      const res = await ipfsResolver.cid(ipfs, `/ipfs/${webpage.cid}`)

      expect(res).to.not.exist()
    } catch (/** @type {any} */ err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${webpage.cid}`, webpage.cid)

    expect(res).to.exist()
    expect(res[0]).to.deep.include({
      Name: 'index.html'
    })
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
    // console.log(res)
    const root = res[res.length - 1]
    expect(root.path).to.equal('test-site')
    expect(root.cid.toString()).to.equal(webpage.cid)
  })

  after(() => factory.clean())

  it('should throw an error when trying to fetch a directory containing a web page', async () => {
    try {
      const res = await ipfsResolver.cid(ipfs, `/ipfs/${webpage.cid}`)

      expect(res).to.not.exist()
    } catch (/** @type {any} */ err) {
      expect(err.toString()).to.equal('Error: This dag node is a directory')
    }
  })

  it('should return the entry point of a web page when a trying to fetch a directory containing a web page', async () => {
    const res = await ipfsResolver.directory(ipfs, `/ipfs/${webpage.cid}`, webpage.cid)

    expect(res).to.exist()
    expect(res[0]).to.deep.include({
      Name: 'index.html'
    })
  })
})
