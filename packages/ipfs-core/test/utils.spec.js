/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const utils = require('../src/utils')
const createTempRepo = require('./utils/create-repo')
const { importer } = require('ipfs-unixfs-importer')
const all = require('it-all')
const codecs = require('./utils/codecs')

describe('utils', () => {
  let rootCid
  let aboutCid
  let aboutPath
  let aboutMultihash

  describe('resolvePath', function () {
    this.timeout(100 * 1000)

    /** @type {import('ipfs-repo').IPFSRepo} */
    let repo

    before(async () => {
      repo = await createTempRepo()

      const res = await all(importer([{
        path: '/dir/contents.txt',
        content: Uint8Array.from([0, 1, 2, 3])
      }], repo.blocks, {
        wrapWithDirectory: true
      }))

      rootCid = res[2].cid

      aboutCid = res[0].cid
      aboutPath = `/ipfs/${aboutCid}`
      aboutMultihash = aboutCid.multihash.bytes
    })

    it('handles base58 hash format', async () => {
      const { cid, remainderPath } = await utils.resolvePath(repo, codecs, rootCid)

      expect(cid.toString()).to.equal(rootCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('handles multihash format', async () => {
      const { cid, remainderPath } = await utils.resolvePath(repo, codecs, aboutMultihash)

      expect(cid.toString()).to.equal(aboutCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('handles ipfs paths format', async function () {
      this.timeout(200 * 1000)
      const { cid, remainderPath } = await utils.resolvePath(repo, codecs, aboutPath)

      expect(cid.toString()).to.equal(aboutCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('should error on invalid hashes', () => {
      return expect(utils.resolvePath(repo, codecs, '/ipfs/asdlkjahsdfkjahsdfd'))
        .to.eventually.be.rejected()
    })

    it('should error when a link doesn\'t exist', () => {
      return expect(utils.resolvePath(repo, codecs, `${aboutPath}/fusion`))
        .to.eventually.be.rejected()
        .and.have.property('message')
        .that.includes(`no link named "fusion" under ${aboutCid}`)
    })
  })
})
