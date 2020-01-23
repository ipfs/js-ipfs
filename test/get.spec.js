/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const loadFixture = require('aegir/fixtures')
const all = require('it-all')
const concat = require('it-concat')

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

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
    await all(ipfs.add(smallFile.data))
  })

  after(() => f.clean())

  it('no compression args', async () => {
    const files = await all(ipfs.get(smallFile.cid))

    expect(files).to.be.length(1)
    const content = await concat(files[0].content)
    expect(content.toString()).to.contain(smallFile.data.toString())
  })

  it('archive true', async () => {
    const files = await all(ipfs.get(smallFile.cid, { archive: true }))

    expect(files).to.be.length(1)
    const content = await concat(files[0].content)
    expect(content.toString()).to.contain(smallFile.data.toString())
  })

  it('err with out of range compression level', async () => {
    await expect(all(ipfs.get(smallFile.cid, {
      compress: true,
      compressionLevel: 10
    }))).to.be.rejectedWith('compression level must be between 1 and 9')
  })

  // TODO Understand why this test started failing
  it.skip('with compression level', async () => {
    await all(ipfs.get(smallFile.cid, { compress: true, 'compression-level': 1 }))
  })

  it('add path containing "+"s (for testing get)', async () => {
    const filename = 'ti,c64x+mega++mod-pic.txt'
    const subdir = 'tmp/c++files'
    const expectedCid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    const path = `${subdir}/${filename}`
    const files = await all(ipfs.add([{
      path,
      content: Buffer.from(path)
    }]))

    expect(files[2].cid.toString()).to.equal(expectedCid)
  })

  it('get path containing "+"s', async () => {
    const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
    const files = await all(ipfs.get(cid))

    expect(files).to.be.an('array').with.lengthOf(3)
    expect(files[0]).to.have.property('path', cid)
    expect(files[1]).to.have.property('path', `${cid}/c++files`)
    expect(files[2]).to.have.property('path', `${cid}/c++files/ti,c64x+mega++mod-pic.txt`)
  })
})
