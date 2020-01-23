/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const loadFixture = require('aegir/fixtures')
const mh = require('multihashes')
const all = require('it-all')
const pipe = require('it-pipe')
const { TimeoutError } = require('ky-universal')

const f = require('./utils/factory')

const testfile = loadFixture('test/fixtures/testfile.txt')

// TODO: Test against all algorithms Object.keys(mh.names)
// This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
const HASH_ALGS = [
  'sha1',
  'sha2-256',
  'sha2-512',
  // 'keccak-224', // go throws
  'keccak-256',
  // 'keccak-384', // go throws
  'keccak-512'
]

describe('.files (the MFS API part)', function () {
  this.timeout(20 * 1000)

  let ipfs

  const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('.add file for testing', async () => {
    const res = await all(ipfs.add(testfile))

    expect(res).to.have.length(1)
    expect(res[0].cid.toString()).to.equal(expectedMultihash)
    expect(res[0].path).to.equal(expectedMultihash)
  })

  it('.add with Buffer module', async () => {
    const { Buffer } = require('buffer')

    const expectedBufferMultihash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    const file = Buffer.from('hello')

    const res = await all(ipfs.add(file))

    expect(res).to.have.length(1)
    expect(res[0].cid.toString()).to.equal(expectedBufferMultihash)
    expect(res[0].path).to.equal(expectedBufferMultihash)
  })

  it('.add with empty path and buffer content', async () => {
    const expectedHash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    const content = Buffer.from('hello')

    const res = await all(ipfs.add([{ path: '', content }]))

    expect(res).to.have.length(1)
    expect(res[0].cid.toString()).to.equal(expectedHash)
    expect(res[0].path).to.equal(expectedHash)
  })

  it('.add with cid-version=1 and raw-leaves=false', async () => {
    const expectedCid = 'bafybeifogzovjqrcxvgt7g36y7g63hvwvoakledwk4b2fr2dl4wzawpnny'
    const options = { cidVersion: 1, rawLeaves: false }

    const res = await all(ipfs.add(testfile, options))

    expect(res).to.have.length(1)
    expect(res[0].cid.toString()).to.equal(expectedCid)
    expect(res[0].path).to.equal(expectedCid)
  })

  it('.add with only-hash=true', async () => {
    const content = String(Math.random() + Date.now())

    const files = await all(ipfs.add(Buffer.from(content), { onlyHash: true }))
    expect(files).to.have.length(1)

    // 'ipfs.object.get(<hash>)' should timeout because content wasn't actually added
    return expect(ipfs.object.get(files[0].cid, { timeout: 2000 }))
      .to.be.rejectedWith(TimeoutError)
  })

  it('.add with options', async () => {
    const res = await all(ipfs.add(testfile, { pin: false }))

    expect(res).to.have.length(1)
    expect(res[0].cid.toString()).to.equal(expectedMultihash)
    expect(res[0].path).to.equal(expectedMultihash)
  })

  it('.add pins by default', async () => {
    const newContent = Buffer.from(String(Math.random()))

    const initialPins = await all(ipfs.pin.ls())

    await all(ipfs.add(newContent))

    const pinsAfterAdd = await all(ipfs.pin.ls())

    expect(pinsAfterAdd.length).to.eql(initialPins.length + 1)
  })

  it('.add with pin=false', async () => {
    const newContent = Buffer.from(String(Math.random()))

    const initialPins = await all(ipfs.pin.ls())

    await all(ipfs.add(newContent, { pin: false }))

    const pinsAfterAdd = await all(ipfs.pin.ls())

    expect(pinsAfterAdd.length).to.eql(initialPins.length)
  })

  HASH_ALGS.forEach((name) => {
    it(`.add with hash=${name} and raw-leaves=false`, async () => {
      const content = String(Math.random() + Date.now())
      const file = {
        path: content + '.txt',
        content: Buffer.from(content)
      }
      const options = { hashAlg: name, rawLeaves: false }

      const res = await all(ipfs.add([file], options))

      expect(res).to.have.length(1)
      const { cid } = res[0]
      expect(mh.decode(cid.multihash).name).to.equal(name)
    })
  })

  it('.add file with progress option', async () => {
    let progress
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    const res = await all(ipfs.add(testfile, { progress: progressHandler }))

    expect(res).to.have.length(1)
    expect(progress).to.be.equal(testfile.byteLength)
    expect(progressCount).to.be.equal(1)
  })

  it('.add big file with progress option', async () => {
    let progress = 0
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    // TODO: needs to be using a big file
    const res = await all(ipfs.add(testfile, { progress: progressHandler }))

    expect(res).to.have.length(1)
    expect(progress).to.be.equal(testfile.byteLength)
    expect(progressCount).to.be.equal(1)
  })

  it('.add directory with progress option', async () => {
    let progress = 0
    let progressCount = 0

    const progressHandler = (p) => {
      progressCount += 1
      progress = p
    }

    // TODO: needs to be using a directory
    const res = await all(ipfs.add(testfile, { progress: progressHandler }))

    expect(res).to.have.length(1)
    expect(progress).to.be.equal(testfile.byteLength)
    expect(progressCount).to.be.equal(1)
  })

  it('.add without progress options', async () => {
    const res = await all(ipfs.add(testfile))

    expect(res).to.have.length(1)
  })

  HASH_ALGS.forEach((name) => {
    it(`.add with hash=${name} and raw-leaves=false`, async () => {
      const content = String(Math.random() + Date.now())
      const file = {
        path: content + '.txt',
        content: Buffer.from(content)
      }
      const options = { hashAlg: name, rawLeaves: false }

      const res = await all(ipfs.add([file], options))

      expect(res).to.have.length(1)
      const { cid } = res[0]
      expect(mh.decode(cid.multihash).name).to.equal(name)
    })
  })

  it('.add with object chunks and iterable content', async () => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

    const res = await pipe(
      [{ content: [Buffer.from('test')] }],
      ipfs.add,
      all
    )

    expect(res).to.have.length(1)
    res[0].cid = res[0].cid.toString()
    expect(res[0]).to.deep.equal({ path: expectedCid, cid: expectedCid, size: 12 })
  })

  it('.add with iterable', async () => {
    const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'
    const res = await all(ipfs.add([Buffer.from('test')]))

    expect(res).to.have.length(1)
    res[0].cid = res[0].cid.toString()
    expect(res[0]).to.deep.equal({ path: expectedCid, cid: expectedCid, size: 12 })
  })

  it('files.mkdir', async () => {
    await ipfs.files.mkdir('/test-folder')
  })

  it('files.flush', async () => {
    await ipfs.files.flush('/')
  })

  it('files.cp', async () => {
    const folder = `/test-folder-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.cp([
      '/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      `${folder}/test-file-${Math.random()}`
    ])
  })

  it('files.cp with non-array arguments', async () => {
    const folder = `/test-folder-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.cp(
      '/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      `${folder}/test-file-${Math.random()}`
    )
  })

  it('files.mv', async () => {
    const folder = `/test-folder-${Math.random()}`
    const source = `${folder}/test-file-${Math.random()}`
    const dest = `${folder}/test-file-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.cp(
      '/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      source
    )
    await ipfs.files.mv([
      source,
      dest
    ])
  })

  it('files.mv with non-array arguments', async () => {
    const folder = `/test-folder-${Math.random()}`
    const source = `${folder}/test-file-${Math.random()}`
    const dest = `${folder}/test-file-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.cp(
      '/ipfs/Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      source
    )
    await ipfs.files.mv(
      source,
      dest
    )
  })

  it('files.ls', async () => {
    const folder = `/test-folder-${Math.random()}`
    const file = `${folder}/test-file-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.write(file, Buffer.from('Hello, world'), {
      create: true
    })
    const files = await all(ipfs.files.ls(folder))

    expect(files.length).to.equal(1)
  })

  it('files.ls mfs root by default', async () => {
    const folder = `test-folder-${Math.random()}`

    await ipfs.files.mkdir(`/${folder}`)
    const files = await all(ipfs.files.ls())

    expect(files.find(file => file.name === folder)).to.be.ok()
  })

  it('files.write', async () => {
    await ipfs.files.write('/test-folder/test-file-2.txt', Buffer.from('hello world'), {
      create: true
    })

    const buf = Buffer.concat(await all(ipfs.files.read('/test-folder/test-file-2.txt')))

    expect(buf.toString()).to.be.equal('hello world')
  })

  it('files.write without options', async () => {
    await ipfs.files.write('/test-folder/test-file-2.txt', Buffer.from('hello world'))

    const buf = Buffer.concat(await all(ipfs.files.read('/test-folder/test-file-2.txt')))

    expect(buf.toString()).to.be.equal('hello world')
  })

  it('files.stat', async () => {
    const folder = `/test-folder-${Math.random()}`
    const file = `${folder}/test-file-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.write(file, testfile, {
      create: true
    })

    const stats = await ipfs.files.stat(file)
    stats.cid = stats.cid.toString()

    expect(stats).to.deep.equal({
      cid: 'QmQhouoDPAnzhVM148yCa9CbUXK65wSEAZBtgrLGHtmdmP',
      size: 12,
      cumulativeSize: 70,
      blocks: 1,
      type: 'file',
      withLocality: false
    })
  })

  it('files.stat file that does not exist()', async () => {
    await expect(ipfs.files.stat('/test-folder/does-not-exist()')).to.be.rejectedWith({
      code: 0,
      type: 'error'
    })
  })

  it('files.read', async () => {
    const folder = `/test-folder-${Math.random()}`
    const file = `${folder}/test-file-${Math.random()}`

    await ipfs.files.mkdir(folder)
    await ipfs.files.write(file, testfile, {
      create: true
    })
    const buf = Buffer.concat(await all(ipfs.files.read(file)))

    expect(Buffer.from(buf)).to.deep.equal(testfile)
  })

  it('files.rm without options', async () => {
    await ipfs.files.rm('/test-folder/test-file-2.txt')
  })

  it('files.rm', async () => {
    await ipfs.files.rm('/test-folder', { recursive: true })
  })
})
