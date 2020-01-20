/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const fs = require('fs')
const fromB58String = require('multihashes').fromB58String
const all = require('it-all')

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

  describe('parseIpfsPath', () => {
    it('parses path with no links', function () {
      expect(utils.parseIpfsPath(rootHash))
        .to.deep.equal({
          hash: rootHash,
          links: []
        })
    })

    it('parses path with links', function () {
      expect(utils.parseIpfsPath(`${rootHash}/docs/index`))
        .to.deep.equal({
          hash: rootHash,
          links: ['docs', 'index']
        })
    })

    it('parses path with /ipfs/ prefix', function () {
      expect(utils.parseIpfsPath(`/ipfs/${rootHash}/about`))
        .to.deep.equal({
          hash: rootHash,
          links: ['about']
        })
    })

    it('parses path with leading and trailing slashes', function () {
      expect(utils.parseIpfsPath(`/${rootHash}/`))
        .to.deep.equal({
          hash: rootHash,
          links: []
        })
    })

    it('normalize path with no ipfs path, nor ipns path nor cid should throw an exception', function () {
      expect(() => utils.normalizePath(`/${rootHash}/`)).to.throw()
    })

    it('normalize path should return an ipfs path, when an ipfs path is provided', function () {
      const ipfsPath = `/ipfs/${rootHash}`
      expect(utils.normalizePath(ipfsPath))
        .to.equal(ipfsPath)
    })

    it('normalize path should return an ipfs path, when a cid is provided', function () {
      const ipfsPath = `/ipfs/${rootHash}`
      expect(utils.normalizePath(rootHash))
        .to.equal(ipfsPath)
    })

    it('normalize path should return an ipns path, when an ipns path is provided', function () {
      const ipnsPath = `/ipns/${rootHash}`
      expect(utils.normalizePath(ipnsPath))
        .to.equal(ipnsPath)
    })

    it('parses non sha2-256 paths', function () {
      // There are many, many hashing algorithms. Just one should be a sufficient
      // indicator. Used go-ipfs@0.4.13 `add --hash=keccak-512` to generate
      const keccak512 = 'zB7S6ZdcqsTqvNhBpx3SbFTocRpAUHj1w9WQXQGyWBVEsLStNfaaNtsdFUQbRk4tYPZvnpGbtDN5gEH4uVzUwsFyJh9Ei'
      expect(utils.parseIpfsPath(keccak512))
        .to.deep.equal({
          hash: keccak512,
          links: []
        })
    })

    it('returns error for malformed path', function () {
      const fn = () => utils.parseIpfsPath(`${rootHash}//about`)
      expect(fn).to.throw('invalid ipfs ref path')
    })

    it('returns error if root is not a valid sha2-256 multihash', function () {
      const fn = () => utils.parseIpfsPath('invalid/ipfs/path')
      expect(fn).to.throw('invalid ipfs ref path')
    })
  })

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
      await all(node.add(fixtures))
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
        .to.be.rejected()
    })

    it('should error when a link doesn\'t exist', () => {
      return expect(utils.resolvePath(node.dag, `${aboutPath}/fusion`))
        .to.be.rejected()
        .and.eventually.have.property('message')
        .that.includes('no link named "fusion" under QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q')
    })
  })
})
