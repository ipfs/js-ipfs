/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')
const fromB58String = require('multihashes').fromB58String

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

    it('returns error for malformed path', function () {
      const fn = () => utils.parseIpfsPath(`${rootHash}//about`)
      expect(fn).to.throw('invalid ipfs ref path')
    })

    it('returns error if root is not a valid multihash', function () {
      const fn = () => utils.parseIpfsPath('invalid/ipfs/path')
      expect(fn).to.throw('invalid ipfs ref path')
    })
  })

  describe('resolvePaths', function () {
    this.timeout(80 * 1000)
    const fixtures = [
      'test/fixtures/planets/mercury/wiki.md',
      'test/fixtures/planets/solar-system.md'
    ].map(path => ({
      path,
      content: fs.readFileSync(path)
    }))

    let node
    let repo

    before(done => {
      repo = createTempRepo()
      node = new IPFS({
        repo: repo
      })
      node.once('ready', () => node.files.add(fixtures, done))
    })

    after(done => {
      repo.teardown(done)
    })

    it('handles base58 hash format', (done) => {
      utils.resolvePaths(node, rootHash, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(rootMultihash)
        done()
      })
    })

    it('handles multihash format', (done) => {
      utils.resolvePaths(node, aboutMultihash, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(aboutMultihash)
        done()
      })
    })

    it('handles ipfs paths format', function (done) {
      this.timeout(200 * 1000)
      utils.resolvePaths(node, aboutPath, (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(1)
        expect(hashes[0]).to.deep.equal(aboutMultihash)
        done()
      })
    })

    it('handles an array', (done) => {
      utils.resolvePaths(node, [rootHash, rootPath, rootMultihash], (err, hashes) => {
        expect(err).to.not.exist()
        expect(hashes.length).to.equal(3)
        expect(hashes[0]).to.deep.equal(rootMultihash)
        expect(hashes[1]).to.deep.equal(rootMultihash)
        expect(hashes[2]).to.deep.equal(rootMultihash)
        done()
      })
    })

    it('should error on invalid hashes', function (done) {
      utils.resolvePaths(node, '/ipfs/asdlkjahsdfkjahsdfd', err => {
        expect(err).to.exist()
        done()
      })
    })

    it(`should error when a link doesn't exist`, function (done) {
      utils.resolvePaths(node, `${aboutPath}/fusion`, err => {
        expect(err.message).to.include(
          `no link named "fusion" under QmbJCNKXJqVK8CzbjpNFz2YekHwh3CSHpBA86uqYg3sJ8q`
        )
        done()
      })
    })
  })
})
