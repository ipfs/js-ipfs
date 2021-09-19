/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { resolvePath } from '../src/utils.js'
import { createTempRepo } from './utils/create-repo.js'
import { importer } from 'ipfs-unixfs-importer'
import all from 'it-all'
import { codecs } from './utils/codecs.js'

describe('utils', () => {
  /** @type {import('multiformats/cid').CID} */
  let rootCid
  /** @type {import('multiformats/cid').CID} */
  let aboutCid
  /** @type {string} */
  let aboutPath
  /** @type {Uint8Array} */
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
      const { cid, remainderPath } = await resolvePath(repo, codecs, rootCid)

      expect(cid.toString()).to.equal(rootCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('handles multihash format', async () => {
      const { cid, remainderPath } = await resolvePath(repo, codecs, aboutMultihash)

      expect(cid.toString()).to.equal(aboutCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('handles ipfs paths format', async function () {
      this.timeout(200 * 1000)
      const { cid, remainderPath } = await resolvePath(repo, codecs, aboutPath)

      expect(cid.toString()).to.equal(aboutCid.toString())
      expect(remainderPath).to.be.empty()
    })

    it('should error on invalid hashes', () => {
      return expect(resolvePath(repo, codecs, '/ipfs/asdlkjahsdfkjahsdfd'))
        .to.eventually.be.rejected()
    })

    it('should error when a link doesn\'t exist', () => {
      return expect(resolvePath(repo, codecs, `${aboutPath}/fusion`))
        .to.eventually.be.rejected()
        .and.have.property('message')
        .that.include(`no link named "fusion" under ${aboutCid}`)
    })
  })
})
