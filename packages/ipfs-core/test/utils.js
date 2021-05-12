/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const fs = require('fs')
const { fromB58String } = require('multihashing-async').multihash
const utils = require('../src/utils')
const createNode = require('./utils/create-node')

describe('utils', () => {
  const rootHash = 'QmTAMavb995EHErSrKo7mB8dYkpaSJxu6ys1a6XJyB2sys'
  const rootPath = `/ipfs/${rootHash}`
  const rootMultihash = fromB58String(rootHash)
  const aboutHash = 'QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q'
  const aboutPath = `${rootPath}/mercury`
  const aboutMultihash = fromB58String(aboutHash)

  describe('resolvePath', function () {
    this.timeout(100 * 1000)
    const fixtures = [
      'test/fixtures/planets/mercury/wiki.md',
      'test/fixtures/planets/solar-system.md'
    ].map(path => ({
      path,
      content: fs.readFileSync(path)
    }))

    let ipfs
    let cleanup

    before(async () => {
      const res = await createNode({
        config: {
          Pubsub: {
            Enabled: false
          }
        }
      })
      ipfs = res.ipfs
      cleanup = res.cleanup

      await ipfs.add(fixtures)
    })

    after(() => cleanup())

    it('handles base58 hash format', async () => {
      const hash = await utils.resolvePath(ipfs.ipld, rootHash)

      expect(hash).to.have.property('bytes').that.deep.equals(rootMultihash)
    })

    it('handles multihash format', async () => {
      const hash = await utils.resolvePath(ipfs.ipld, aboutMultihash)

      expect(hash).to.have.property('bytes').that.deep.equals(aboutMultihash)
    })

    it('handles ipfs paths format', async function () {
      this.timeout(200 * 1000)
      const hash = await utils.resolvePath(ipfs.ipld, aboutPath)

      expect(hash).to.have.property('bytes').that.deep.equals(aboutMultihash)
    })

    it('should error on invalid hashes', () => {
      return expect(utils.resolvePath(ipfs.ipld, '/ipfs/asdlkjahsdfkjahsdfd'))
        .to.eventually.be.rejected()
    })

    it('should error when a link doesn\'t exist', () => {
      return expect(utils.resolvePath(ipfs.ipld, `${aboutPath}/fusion`))
        .to.eventually.be.rejected()
        .and.have.property('message')
        .that.includes('no link named "fusion" under QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q')
    })
  })
})
