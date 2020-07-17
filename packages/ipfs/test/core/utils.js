/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const fs = require('fs')
const { fromB58String } = require('multihashing-async').multihash

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')
const IPFS = require('../../src/core')
const utils = require('../../src/core/utils')

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

    let node
    let repo

    before(async () => {
      repo = createTempRepo()
      node = await IPFS.create({
        silent: true,
        repo,
        config: {
          Bootstrap: []
        },
        preload: { enabled: false }
      })
      await node.add(fixtures)
    })

    after(() => node.stop())

    after(() => repo.teardown())

    it('handles base58 hash format', async () => {
      const hashes = await utils.resolvePath(node.dag, rootHash)

      expect(hashes.length).to.equal(1)
      expect(hashes[0].buffer).to.deep.equal(rootMultihash)
    })

    it('handles multihash format', async () => {
      const hashes = await utils.resolvePath(node.dag, aboutMultihash)

      expect(hashes.length).to.equal(1)
      expect(hashes[0].buffer).to.deep.equal(aboutMultihash)
    })

    it('handles ipfs paths format', async function () {
      this.timeout(200 * 1000)
      const hashes = await utils.resolvePath(node.dag, aboutPath)

      expect(hashes.length).to.equal(1)
      expect(hashes[0].buffer).to.deep.equal(aboutMultihash)
    })

    it('handles an array', async () => {
      const paths = [rootHash, rootPath, rootMultihash]
      const hashes = await utils.resolvePath(node.dag, paths)

      expect(hashes.length).to.equal(3)
      expect(hashes[0].buffer).to.deep.equal(rootMultihash)
      expect(hashes[1].buffer).to.deep.equal(rootMultihash)
      expect(hashes[2].buffer).to.deep.equal(rootMultihash)
    })

    it('should error on invalid hashes', () => {
      return expect(utils.resolvePath(node.dag, '/ipfs/asdlkjahsdfkjahsdfd'))
        .to.eventually.be.rejected()
    })

    it('should error when a link doesn\'t exist', () => {
      return expect(utils.resolvePath(node.dag, `${aboutPath}/fusion`))
        .to.eventually.be.rejected()
        .and.have.property('message')
        .that.includes('no link named "fusion" under QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q')
    })
  })
})
