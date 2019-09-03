/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(chaiAsPromised)
const isNode = require('detect-node')
const loadFixture = require('aegir/fixtures')

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.get (specific go-ipfs features)', function () {
  this.timeout(60 * 1000)

  function fixture (path) {
    return loadFixture(path, 'interface-ipfs-core')
  }

  const smallFile = {
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: fixture('test/fixtures/testfile.txt')
  }

  let ipfsd
  let ipfs

  before(async () => {
    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })
    ipfs = ipfsClient(ipfsd.apiAddr)

    await ipfs.add(smallFile.data)
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  it('no compression args', async () => {
    const files = await ipfs.get(smallFile.cid)

    expect(files).to.be.length(1)
    expect(files[0].content.toString()).to.contain(smallFile.data.toString())
  })

  it('archive true', async () => {
    const files = await ipfs.get(smallFile.cid, { archive: true })

    expect(files).to.be.length(1)
    expect(files[0].content.toString()).to.contain(smallFile.data.toString())
  })

  it('err with out of range compression level', async () => {
    await expect(ipfs.get(smallFile.cid, {
      compress: true,
      'compression-level': 10
    })).to.be.rejectedWith('compression level must be between 1 and 9')
  })

  // TODO Understand why this test started failing
  it.skip('with compression level', async () => {
    await ipfs.get(smallFile.cid, { compress: true, 'compression-level': 1 })
  })

  it('add path containing "+"s (for testing get)', async () => {
    if (!isNode) {
      return
    }

    const filename = 'ti,c64x+mega++mod-pic.txt'
    const subdir = 'tmp/c++files'
    const expectedCid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    const files = await ipfs.add([{
      path: subdir + '/' + filename,
      content: Buffer.from(subdir + '/' + filename, 'utf-8')
    }])

    expect(files[2].hash).to.equal(expectedCid)
  })

  it('get path containing "+"s', async () => {
    if (!isNode) {
      return
    }

    const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    let count = 0
    const files = await ipfs.get(cid)

    files.forEach((file) => {
      if (file.path !== cid) {
        count++
        expect(file.path).to.contain('+')

        if (count === 2) {
          // done()
        }
      }
    })
  })
})
